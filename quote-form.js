const quoteForm = document.querySelector('#quote-form');
const formStatus = document.querySelector('#form-status');

quoteForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const formData = new FormData(quoteForm);
    const payload = Object.fromEntries(formData.entries());

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    formStatus.className = 'form-status';
    formStatus.textContent = 'Sending your question...';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
        const response = await fetch('/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || 'Your message could not be sent.');
        }

        quoteForm.reset();
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you. Your question was sent successfully.';
    } catch (error) {
        const message = error.name === 'AbortError'
            ? 'The email server took too long to respond.'
            : error.message;
        formStatus.className = 'form-status error';
        formStatus.textContent = `${message} Please try again or contact us on WhatsApp.`;
    } finally {
        clearTimeout(timeout);
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});
