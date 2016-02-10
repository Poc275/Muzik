window.onload = init;
var context = new (window.AudioContext || window.webkitAudioContext)();
var buffers = ['../audio/raoul.mp3', '../audio/soul.mp3', '../audio/snare-drum.mp3'];

// e.g. project/tracks, this would be retrieved from the DB
var tracks = [
	new Track(200, '#A35BC2', buffers[0]), 
  	new Track(70, 'lightskyblue', buffers[1]),
  	new Track(80, '#00FF00', buffers[2])];

var project = new Project(tracks);

var canvas;
var stage;
var right;
var left;


function init() {
	canvas = document.getElementById("project");
	stage = new createjs.Stage("project");
	stage.mouseMoveOutside = true;
	stage.snapToPixel = true;
	left = 0;
	right = canvas.width;

	for(var i = 0; i < tracks.length; i++) {
		var track = new createjs.Shape();
		track.graphics.beginFill(tracks[i].fill).drawRect(tracks[i].start, tracks[i].yPos, tracks[i].length, tracks[i].height);
		track.setBounds(tracks[i].start, tracks[i].yPos, tracks[i].length, tracks[i].height);

		track.on("mousedown", function(e) {
			// retrieve position of mouse selection and set as transform point
			// (regX) so that the tracks move smoothly
			e.currentTarget.regX = e.localX;
		});

		track.on("pressmove", function(e) {
			e.currentTarget.x = Math.max(stage.x + e.currentTarget.regX, 
				Math.min(stage.x + right - e.currentTarget.getBounds().width + e.currentTarget.regX, e.stageX));

			stage.update();
		});

		stage.addChild(track);
	}

	stage.update();

	// play tracks
	// for(var i = 0; i < tracks.length; i++) {
	// 	tracks[i].track.load();
	// }
	project.track.load();
}


function finishedLoading(bufferList) {
	var startTime = context.currentTime;
	// var tempo = 120; //bpm
	// var eightNoteTime = (60 / tempo) / 2;

  	for(var i = 0; i < tracks.length; i++) {
  		playSound(bufferList[i], startTime);
  	}

  	// playSound(bufferList[0], startTime);
}


function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  // source.connect(analyser);
  // analyser.connect(context.destination);

  if (!source.start) {
    source.start = source.noteOn;
  }
  source.start(time);

  console.log(context.currentTime);
}



// Object that represents an individual track
function Track(length, fill, buffer) {
	// var bufferLoader = new BufferLoader(context,
	// 	[
	// 		buffer
	// 	],
	// 	finishedLoading
	// 	);

	this.start = 0;
	this.yPos = 0;
	this.length = length || 200;
	this.height = 50;
	this.fill = fill || '#AAAAAA';
	// this.track = bufferLoader;
	this.track = buffer;

	// bufferLoader.load;
}

// Track.prototype.draw = function(ctx) {
// 	ctx.fillStyle = this.fill;
// 	ctx.fillRect(this.start, this.yPos, this.length, this.height);
// }


// Object that represents a project/song
function Project(tracks) {
  this.tracks = tracks;
  var urls = [];

  // calculate y positions
  for(var i = 0; i < tracks.length; i++) {
    tracks[i].yPos = i * tracks[i].height;
    urls[i] = tracks[i].track;
  }

  var bufferLoader = new BufferLoader(context, urls, finishedLoading);
  this.track = bufferLoader;
}

Project.prototype.init = function() {

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