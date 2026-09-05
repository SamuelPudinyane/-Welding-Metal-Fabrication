const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 10000;
const allowedOrigins = new Set([
    'https://weldingandmetalfabrication.co.za',
    'https://www.weldingandmetalfabrication.co.za',
    'https://welding-metal-fabrication.onrender.com'
]);
const recentRequests = new Map();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use((request, response, next) => {
    const origin = request.get('origin');
    if (origin && allowedOrigins.has(origin)) {
        response.set('Access-Control-Allow-Origin', origin);
        response.set('Vary', 'Origin');
    }
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
});

app.get('/', (_request, response) => response.json({
    status: 'ok',
    service: 'Welding & Metal Fabrication email service'
}));
app.get('/health', (_request, response) => response.json({ status: 'ok' }));

app.post('/quote', async (request, response) => {
    const origin = request.get('origin');
    if (!origin || !allowedOrigins.has(origin)) {
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
