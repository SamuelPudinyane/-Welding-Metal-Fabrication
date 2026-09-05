const quoteForm = document.querySelector('#quote-form');
const formStatus = document.querySelector('#form-status');

quoteForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const formData = new FormData(quoteForm);
    const payload = Object.fromEntries(formData.entries());

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    formStatus.className = 'form-status';
    formStatus.textContent = 'Sending your question...';

    try {
        const response = await fetch('https://welding-and-metal-fabrication.onrender.com/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || 'Your message could not be sent.');
        }

        quoteForm.reset();
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you. Your question was sent successfully.';
    } catch (error) {
        formStatus.className = 'form-status error';
        formStatus.textContent = `${error.message} Please try again or contact us on WhatsApp.`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Question';
    }
});
