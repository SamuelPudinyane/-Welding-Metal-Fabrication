const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;
const recentRequests = new Map();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use('/images', express.static(path.join(__dirname, 'images'), { maxAge: '7d' }));
app.get('/slider.js', (_request, response) => response.sendFile(path.join(__dirname, 'slider.js')));
app.get('/quote-form.js', (_request, response) => response.sendFile(path.join(__dirname, 'quote-form.js')));
app.get('/privacy-policy.html', (_request, response) => response.sendFile(path.join(__dirname, 'privacy-policy.html')));
app.get('/terms-of-service.html', (_request, response) => response.sendFile(path.join(__dirname, 'terms-of-service.html')));
app.get('/', (_request, response) => response.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (_request, response) => response.json({ status: 'ok' }));

app.post('/quote', async (request, response) => {
    const origin = request.get('origin');
    if (origin && new URL(origin).host !== request.get('host')) {
        return response.status(403).json({ error: 'Request origin is not allowed.' });
    }

    const { name, email, message, website } = request.body || {};
    if (website) return response.json({ sent: true });
    if (![name, email, message].every((value) => typeof value === 'string' && value.trim())) {
        return response.status(400).json({ error: 'Please complete every required field.' });
    }
    if (name.length > 120 || email.length > 254 || message.length > 5000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return response.status(400).json({ error: 'Please check the information you entered.' });
    }

    const clientAddress = request.ip;
    const now = Date.now();
    if (now - (recentRequests.get(clientAddress) || 0) < 60_000) {
        return response.status(429).json({ error: 'Please wait one minute before sending another message.' });
    }
    recentRequests.set(clientAddress, now);

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        await transporter.sendMail({
            from: `Welding website <${process.env.SMTP_USER}>`,
            to: process.env.MAIL_TO || process.env.SMTP_USER,
            replyTo: email.trim(),
            subject: `Website question from ${name.trim()}`,
            text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nQuestion / project details:\n${message.trim()}`
        });
        response.json({ sent: true });
    } catch (error) {
        console.error('Email delivery failed:', error.message);
        response.status(500).json({ error: 'Email delivery failed.' });
    }
});

app.listen(port, () => console.log(`Mail service listening on port ${port}`));
