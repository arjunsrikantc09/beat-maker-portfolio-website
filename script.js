const audio = document.getElementById('audioEl');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekBar = document.getElementById('seekBar');
const trackTitle = document.getElementById('trackTitle');
const trackItems = Array.from(document.querySelectorAll('#tracklist .track'));

let currentIndex = 0;

function loadTrack(index, autoplay) {
    currentIndex = (index + trackItems.length) % trackItems.length;
    const item = trackItems[currentIndex];

    trackItems.forEach(t => t.classList.remove('active'));
    item.classList.add('active');

    audio.src = item.dataset.src;
    trackTitle.textContent = item.dataset.name;
    seekBar.value = 0;

    if (autoplay) {
        audio.play();
    }
}

function setPlayIcon(isPlaying) {
    playIcon.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9658;';
}

playBtn.addEventListener('click', () => {
    if (!audio.src) {
        loadTrack(currentIndex, true);
        return;
    }
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

prevBtn.addEventListener('click', () => loadTrack(currentIndex - 1, true));
nextBtn.addEventListener('click', () => loadTrack(currentIndex + 1, true));

audio.addEventListener('play', () => setPlayIcon(true));
audio.addEventListener('pause', () => setPlayIcon(false));
audio.addEventListener('ended', () => loadTrack(currentIndex + 1, true));

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        seekBar.value = (audio.currentTime / audio.duration) * 100;
    }
});

seekBar.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (seekBar.value / 100) * audio.duration;
    }
});

trackItems.forEach((item, index) => {
    item.addEventListener('click', () => loadTrack(index, true));
});

loadTrack(0, false);
