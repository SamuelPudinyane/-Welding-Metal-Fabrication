const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;
const recentRequests = new Map();
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASS?.replace(/\s/g, '');
const mailRecipient = process.env.MAIL_TO?.trim() || smtpUser;
const mailConfigured = Boolean(smtpUser && smtpPassword && mailRecipient);
const transporter = mailConfigured ? nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: {
        user: smtpUser,
        pass: smtpPassword
    },
    disableFileAccess: true,
    disableUrlAccess: true
}) : null;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use('/images', express.static(path.join(__dirname, 'images'), { maxAge: '7d' }));
app.get('/slider.js', (_request, response) => response.sendFile(path.join(__dirname, 'slider.js')));
app.get('/quote-form.js', (_request, response) => response.sendFile(path.join(__dirname, 'quote-form.js')));
app.get('/video-player.js', (_request, response) => response.sendFile(path.join(__dirname, 'video-player.js')));
app.get('/privacy-policy.html', (_request, response) => response.sendFile(path.join(__dirname, 'privacy-policy.html')));
app.get('/terms-of-service.html', (_request, response) => response.sendFile(path.join(__dirname, 'terms-of-service.html')));
app.get('/', (_request, response) => response.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (_request, response) => response.json({ status: 'ok' }));

app.post('/quote', async (request, response) => {
    const origin = request.get('origin');
    if (origin && new URL(origin).host !== request.get('host')) {
        return response.status(403).json({ error: 'Request origin is not allowed.' });
    }

    const { name, email, subject, message, website } = request.body || {};
    if (website) return response.json({ sent: true });
    if (!mailConfigured) {
        console.error('Email delivery is not configured: check SMTP_USER, SMTP_PASS and MAIL_TO.');
        return response.status(503).json({ error: 'Email delivery is not configured yet.' });
    }
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
        await transporter.sendMail({
            from: `Welding website <${smtpUser}>`,
            to: mailRecipient,
            replyTo: email.trim(),
            subject: `${typeof subject === 'string' && subject.trim() ? subject.trim().slice(0, 120) : 'Website question'} — ${name.trim()}`,
            text: `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${typeof subject === 'string' ? subject.trim() : ''}\n\nQuestion / project details:\n${message.trim()}`
        });
        response.json({ sent: true });
    } catch (error) {
        console.error('Email delivery failed:', error.message);
        response.status(500).json({ error: 'Email delivery failed.' });
    }
});

app.listen(port, () => console.log(`Mail service listening on port ${port}`));
