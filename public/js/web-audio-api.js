// var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// oscillator = audioCtx.createOscillator();
// var gainNode = audioCtx.createGain();

// oscillator.connect(gainNode);
// // AudioContext.destination refers to the default
// // output mechanism of the device (usually the speakers)
// gainNode.connect(audioCtx.destination);

// // set oscillator type, other options are 'square', 'sawtooth',
// // 'triangle', and 'custom'
// oscillator.type = 'sine';
// // frequency (in hertz)
// oscillator.frequency.value = 2500;
// oscillator.start();

window.onload = init;
var context;
var bufferLoader;
var analyser;

var output = document.getElementById('output');


function init() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();
  analyser = context.createAnalyser();
  analyser.fftSize = 2048;

	bufferLoader = new BufferLoader(context,
		[
			'../audio/raoul.mp3'
		],
		finishedLoading
		);

	bufferLoader.load();
}


function draw() {
  drawVisual = requestAnimationFrame(draw);
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');
  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  // canvasCtx.fillRect(0, 0, 1000, 1000);

  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  canvasCtx.beginPath();

  var sliceWidth = 1000 * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {
    var v = dataArray[i] / 128.0;
    var y = v * 500 / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
    // output.innerHTML += i + " ";
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}


function finishedLoading(bufferList) {
	// create 2 sources and play them both together
	// var source1 = context.createBufferSource();
	// var source2 = context.createBufferSource();

	// source1.buffer = bufferList[0];
	// source2.buffer = bufferList[1];

	// source1.connect(context.destination);
	// source2.connect(context.destination);

	var startTime = context.currentTime;
	var tempo = 120; //bpm
	var eightNoteTime = (60 / tempo) / 2;

	// bars
	// for (var bar = 0; bar < 1; bar++) {
	// 	var time = startTime + bar * 8 * eightNoteTime;

	// 	// play bass on beats 1, 5
	// 	playSound(bufferList[0], time);
 //    playSound(bufferList[0], time + 4 * eightNoteTime);

	// 	// play snare on beats 3, 7
	// 	playSound(bufferList[1], time + 2 * eightNoteTime);
 //    playSound(bufferList[1], time + 6 * eightNoteTime);

 //    // play hi-hat every eighth note
 //    for (var i = 0; i < 8; ++i) {
 //      playSound(bufferList[2], time + i * eightNoteTime);
 //    }
	// }
  playSound(bufferList[0], startTime);
}


function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  // source.connect(context.destination);
  source.connect(analyser);
  analyser.connect(context.destination);
  if (!source.start) {
    source.start = source.noteOn;
  }
  source.start(time);

    draw();
}


// source - http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}