const audio = document.getElementById('audioEl');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekBar = document.getElementById('seekBar');
const trackTitle = document.getElementById('trackTitle');
const trackItems = Array.from(document.querySelectorAll('#tracklist .track'));
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

let currentIndex = 0;
let audioCtx, analyser, dataArray, bufferLength, animationId;

function setupAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

}

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
}

function drawVisualizer() {
    animationId = requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = bufferLength;
    const gap = 3 * (window.devicePixelRatio || 1);
    const barWidth = (canvas.width - gap * (barCount - 1)) / barCount;
    let x = 0;

    for (let i = 0; i < barCount; i++) {
        const magnitude = dataArray[i] / 255;
        const barHeight = Math.max(magnitude * canvas.height, 3);
        const y = canvas.height - barHeight;


        const gradient = canvasCtx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ff4d4d');
        gradient.addColorStop(1, '#5e0808');
        canvasCtx.fillStyle = gradient;
        canvasCtx.shadowColor = 'rgba(255, 64, 64, 0.6)';
        canvasCtx.shadowBlur = 8 * (window.devicePixelRatio || 1);
        canvasCtx.fillRect(x, y, barWidth, barHeight);

        x += barWidth + gap;
    }
}

function stopVisualizer() {
    cancelAnimationFrame(animationId);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function startVisualizer() {
    setupAudioContext();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    resizeCanvas();
    cancelAnimationFrame(animationId);
    drawVisualizer();
}

window.addEventListener('resize', () => {
    if (!audioCtx) return;
    resizeCanvas();
});

function loadTrack(index, autoplay) {
    currentIndex = (index + trackItems.length) % trackItems.length;
    const item = trackItems[currentIndex];

    trackItems.forEach(t => t.classList.remove('active'));
    item.classList.add('active');

    audio.src = item.dataset.src;
    trackTitle.textContent = item.dataset.name;
    seekBar.value = 0;

    if (autoplay) {
        setupAudioContext();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
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
    setupAudioContext();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

prevBtn.addEventListener('click', () => loadTrack(currentIndex - 1, true));
nextBtn.addEventListener('click', () => loadTrack(currentIndex + 1, true));

audio.addEventListener('play', () => {
    setPlayIcon(true);
    startVisualizer();
});
audio.addEventListener('pause', () => {
    setPlayIcon(false);
    stopVisualizer();
});
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
