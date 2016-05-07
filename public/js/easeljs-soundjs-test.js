window.onload = init;

// get from DB
// var tracks = [
//   new Track('Guitar', '../audio/under-the-bridge-guitar-track.mp3', 'red'),
//   new Track('Drums', '../audio/under-the-bridge-drum-track.mp3', 'grey'),
//   new Track('Bass', '../audio/under-the-bridge-bass-track.mp3', 'blue'),
//   new Track('Vocals', '../audio/under-the-bridge-vocal-track.mp3', 'green')
// ]

var tracks = [
  new Track('Guitar', '../audio/rem-lmr-guitar.mp3', 'red'),
  new Track('Drums', '../audio/rem-lmr-drums.mp3', 'grey'),
  new Track('Bass', '../audio/rem-lmr-bass.mp3', 'blue'),
  new Track('Vocals', '../audio/rem-lmr-vox.mp3', 'green')
]

var canvas;
var stage;
var right;
var left;

var playButton;
var stopButton;

var playHead;
var playHeadNormalisationFactor;
var animationFrameId;


function init() {
	canvas = document.getElementById("project");
	// set canvas size
	// canvas.width = Math.max.apply(null, tracks.map(function(track) {
	// 	return track.length;
	// }))
	canvas.width = 400;
	canvas.height = tracks.length * 50;

	stage = new createjs.Stage("project");
	stage.mouseMoveOutside = true;
	stage.snapToPixel = true;
	left = 0;
	right = canvas.width;

	// add playhead
	playHead = new createjs.Shape();
	playHead.graphics.beginStroke("orange");
	playHead.graphics.moveTo(0, 0).lineTo(0, tracks.length * 50);

	createjs.Sound.addEventListener('fileload', soundsLoaded);

	playButton = document.getElementById('play');
	stopButton = document.getElementById('stop');

	playButton.addEventListener('click', playButtonClick);
	stopButton.addEventListener('click', stopButtonClick);

	// disable play/stop buttons until sounds have loaded
	playButton.disabled = true;
	stopButton.disabled = true;


	for(var i = 0; i < tracks.length; i++) {
		var track = new createjs.Shape();
		track.name = tracks[i].title;

		// register sounds
		createjs.Sound.registerSound(tracks[i].url, tracks[i].title);

		tracks[i].yPosition = i * tracks[i].height;

		track.graphics.beginFill(tracks[i].fill).drawRect(tracks[i].startTime, tracks[i].yPosition, tracks[i].length, tracks[i].height);
		track.setBounds(tracks[i].startTime, tracks[i].yPosition, tracks[i].length, tracks[i].height);

		// MOUSE EVENTS
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

		track.on("pressup", function(e) {
			// use regX as the local x position because it is applied only once on mousedown
			// e.localX can change if the user keeps dragging even when the track is at its limits
			var localXClamped = e.currentTarget.regX;
			var lhs = e.currentTarget.x - localXClamped;

			if (localXClamped < 0) {
				localXClamped = 0;
				lhs = 0;
			} else if (localXClamped > e.currentTarget.getBounds().width) {
				localXClamped = e.currentTarget.getBounds().width;
				lhs = e.currentTarget.getBounds().width;
			}

			var snapPos = 50 * Math.round(lhs / 50);

			e.currentTarget.x = snapPos + e.currentTarget.regX;

			// console.log("xPos: " + e.currentTarget.x + " localX: " + e.localX + " localXClamped: " + localXClamped + " lhs: " + lhs + " snapPos: " + snapPos);

			stage.update();

			// which track was moved?
			var track = tracks.find(function(track) {
				if (track.title === e.currentTarget.name) {
					return track;
				}
			});

			// update track start time
			track.instance.startTime = 20000;

		});

		stage.addChild(track);
	}

	// add play head at the end on top
	stage.addChild(playHead);

	stage.update();
}

// note: this will run for every sound that is loaded
// need a way of waiting until ALL sounds are loaded - preload.js?
function soundsLoaded(evt) {
	playButton.disabled = false;
	stopButton.disabled = false;

	var track = tracks.find(function(track) {
		if (track.title === evt.id) {
			return track;
		}
	})

	// what if track couldn't be found?
	track.instance = createjs.Sound.createInstance(track.title);
	playHeadNormalisationFactor = canvas.width / (track.instance.duration / 1000);

	console.log(playHeadNormalisationFactor);

	console.log('soundsLoaded called');
}


function playButtonClick(evt) {
	if (playButton.value === 'Play') {
		tracks.forEach(function(track) {
			track.instance.play();
			playButton.value = 'Pause';
			playButton.innerHTML = 'Pause';
		})
		animationFrameId = requestAnimationFrame(syncPlayhead);
	} else if (playButton.value === 'Pause') {
		tracks.forEach(function(track) {
			track.instance.paused = true;
			playButton.value = 'Play';
			playButton.innerHTML = 'Play';
		})
		window.cancelAnimationFrame(animationFrameId);
	}

}


function stopButtonClick(evt) {
	createjs.Sound.stop();
	playButton.value = 'Play';
	playButton.innerHTML = 'Play';

	window.cancelAnimationFrame(animationFrameId);
}


function syncPlayhead() {
	// console.log(tracks[0].instance.position / 1000 * playHeadNormalisationFactor);
	console.log(tracks[0].instance.position);
	playHead.x = tracks[0].instance.position / 1000 * playHeadNormalisationFactor;
	stage.update();
	animationFrameId = requestAnimationFrame(syncPlayhead);
}