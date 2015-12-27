window.onload = init;
var audioCtx;
var analyser;

function init() {
	audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	analyser = audioCtx.createAnalyser();

	var bufferLoader = new BufferLoader(audioCtx,
		[
			'../audio/raoul.mp3'
		],
		finishedLoading
		);

	bufferLoader.load();
}


function finishedLoading(bufferList) {
	var source = audioCtx.createBufferSource();
	source.buffer = bufferList[0];
	// source.connect(context.destination);
	source.connect(analyser);
	analyser.connect(audioCtx.destination);
	source.start(audioCtx.currentTime);


	analyser.fftSize = 2048;
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);
	var drawVisual;

	var canvas = document.getElementById('player');
	canvas.height = 1000;
	canvas.width = 1000;
	canvas.style.border = '1px solid black';
  	var canvasCtx = canvas.getContext('2d');

	function draw() {
		drawVisual = requestAnimationFrame(draw);

		analyser.getByteTimeDomainData(dataArray);

		canvasCtx.fillStyle = 'rgb(200, 200, 200)';
		// canvasCtx.fillRect(0, 0, 1000, 1000);

		canvasCtx.lineWidth = 2;
		canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

		canvasCtx.beginPath();

		var sliceWidth = 1000 * 1.0 / bufferLength;
		var x = 0;

		for (var i = 0; i < bufferLength; i++) {
			var v = dataArray[i] / 128.0;
			var y = v * 1000 / 2;

			if (i === 0) {
				canvasCtx.moveTo(x, y);
			}
			else {
				canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}

		canvasCtx.lineTo(canvas.width, canvas.height / 2);
		canvasCtx.stroke();
	};

	draw();
}






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