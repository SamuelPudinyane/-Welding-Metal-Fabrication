document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('#video');
    const overlay = document.querySelector('.play');
    const initialPlayButton = document.querySelector('#play');
    if (!video || !overlay || !initialPlayButton) return;

    const videos = [
        ['images/VID_20251225_141940.mp4', 'Project video 1'],
        ['images/VID_20251225_134327.mp4', 'Project video 2'],
        ['images/VID-20251219-WA0005.mp4', 'Project video 3'],
        ['images/VID-20250119-WA0006.mp4', 'Project video 4']
    ];
    let currentIndex = 0;

    const title = document.createElement('span');
    title.className = 'video-title';
    title.textContent = videos[currentIndex][1];

    const controls = document.createElement('div');
    controls.className = 'video-controls';
    controls.setAttribute('aria-label', 'Video controls');
    controls.innerHTML = `
        <button class="video-control primary" type="button" data-action="toggle">▶ Play</button>
        <button class="video-control" type="button" data-action="stop">■ Stop</button>
        <button class="video-control" type="button" data-action="next">Next ›</button>
    `;
    video.parentElement.append(title, controls);

    const toggleButton = controls.querySelector('[data-action="toggle"]');
    const stopButton = controls.querySelector('[data-action="stop"]');
    const nextButton = controls.querySelector('[data-action="next"]');

    function updateToggleLabel() {
        toggleButton.textContent = video.paused ? '▶ Play' : '❚❚ Pause';
    }

    async function playVideo() {
        overlay.style.display = 'none';
        try {
            await video.play();
        } catch (_error) {
            overlay.style.display = 'grid';
        }
        updateToggleLabel();
    }

    function togglePlayback() {
        if (video.paused) playVideo();
        else {
            video.pause();
            updateToggleLabel();
        }
    }

    function stopVideo() {
        video.pause();
        video.currentTime = 0;
        overlay.style.display = 'grid';
        updateToggleLabel();
    }

    function nextVideo() {
        const wasPlaying = !video.paused;
        currentIndex = (currentIndex + 1) % videos.length;
        video.src = videos[currentIndex][0];
        title.textContent = videos[currentIndex][1];
        video.load();
        if (wasPlaying) playVideo();
        else {
            overlay.style.display = 'grid';
            updateToggleLabel();
        }
    }

    initialPlayButton.addEventListener('click', playVideo);
    toggleButton.addEventListener('click', togglePlayback);
    stopButton.addEventListener('click', stopVideo);
    nextButton.addEventListener('click', nextVideo);
    video.addEventListener('play', updateToggleLabel);
    video.addEventListener('pause', updateToggleLabel);
    video.addEventListener('ended', nextVideo);
    updateToggleLabel();
});
