document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const celebrationBanner = document.getElementById('celebrationBanner');
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let celebrationTrack = new Audio('happy-birthday copy.mp3');

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;

    if (candles.length > 0 && activeCandles === 0) {
      celebrationBanner.style.display = "block"; 
      celebrationTrack.play();
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  function addInitialCandles() {
  const rect = cake.getBoundingClientRect();

  const initialCandleCount = 27;

  for (let i = 0; i < initialCandleCount; i++) {
    // random horizontal position (but avoid edges)
    const left = Math.random() * (rect.width - 40) + 20;

    // random vertical position restricted to upper part of cake
    const top = Math.random() * (rect.height * 0.35) + rect.height * 0.05;

    addCandle(left, top);
  }
}

  // Add candles on first load
  addInitialCandles();

  // Add candles manually on click
  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 40;
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});
