document.addEventListener('DOMContentLoaded', () => {
    const projects = [
        ['images/IMG_20251223_160035.jpg', 'Window Protection', 'Residential Project'],
        ['images/IMG_20251209_164333.jpg', 'Driveway Gate', 'Residential Project'],
        ['images/IMG_20251225_163821.jpg', 'Custom Fabrication', 'Made to Specification'],
        ['images/IMG-20250119-WA0001.jpg', 'Security Fencing', 'Residential Project'],
        ['images/IMG_20251209_164357.jpg', 'Custom Steelwork', 'Fabrication Project'],
        ['images/IMG_20251212_142900.jpg', 'Security Installation', 'Residential Project'],
        ['images/IMG_20251215_142216.jpg', 'Metal Gate', 'Custom Project'],
        ['images/IMG_20251224_162951.jpg', 'Welding Project', 'Custom Fabrication'],
        ['images/IMG_20251225_134405.jpg', 'Property Security', 'Installation Project'],
        ['images/IMG_20251226_105215.jpg', 'Finished Metalwork', 'Recent Project']
    ];
    const cards = [...document.querySelectorAll('.gallery .project')];
    if (!cards.length) return;

    cards.forEach((card) => {
        card.querySelector('img')?.classList.add('project-image');
        const control = card.querySelector('.circle');
        control?.setAttribute('role', 'button');
        control?.setAttribute('tabindex', '0');
        control?.setAttribute('aria-label', 'Show next gallery image');
    });

    let startIndex = 0;
    let timer;

    function render() {
        cards.forEach((card, slot) => {
            const item = projects[(startIndex + slot) % projects.length];
            const image = card.querySelector('.project-image');
            image.classList.add('changing');
            window.setTimeout(() => {
                image.src = item[0];
                image.alt = item[1];
                card.querySelector('.info b').textContent = item[1];
                card.querySelector('.info small').textContent = item[2];
                image.classList.remove('changing');
            }, 180);
        });
    }

    function next() {
        startIndex = (startIndex + 1) % projects.length;
        render();
    }

    function restart() {
        clearInterval(timer);
        timer = setInterval(next, 10_000);
    }

    cards.forEach((card) => {
        const control = card.querySelector('.circle');
        control?.addEventListener('click', () => { next(); restart(); });
        control?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); next(); restart();
            }
        });
    });

    const emailLink = document.querySelector('.details a[href^="mailto:"]');
    if (emailLink) emailLink.textContent = 'piuspudinyane3141@gmail.com';
    const quoteLink = document.querySelector('.details')?.closest('.panel')?.querySelector('.gold[href^="https://wa.me/"]');
    if (quoteLink) {
        quoteLink.textContent = 'WhatsApp Us →';
        quoteLink.target = '_blank';
        quoteLink.rel = 'noopener';
        quoteLink.href = 'https://wa.me/27817886852?text=Hello%2C%20I%20would%20like%20to%20request%20a%20quote.';
    }

    restart();
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : restart());
});
