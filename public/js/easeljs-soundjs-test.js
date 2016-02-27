window.onload = init;

// get from DB
var tracks = [
  new Track('Guitar', '../audio/under-the-bridge-guitar-track.mp3', 'red'),
  new Track('Drums', '../audio/under-the-bridge-drum-track.mp3', 'grey'),
  new Track('Bass', '../audio/under-the-bridge-bass-track.mp3', 'blue'),
  new Track('Vocals', '../audio/under-the-bridge-vocal-track.mp3', 'green')
]

var canvas;
var stage;
var right;
var left;

var playButton;
var stopButton;


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

		// register sounds
		createjs.Sound.registerSound(tracks[i].url, tracks[i].title);

		tracks[i].yPosition = i * tracks[i].height;

		track.graphics.beginFill(tracks[i].fill).drawRect(tracks[i].startTime, tracks[i].yPosition, tracks[i].length, tracks[i].height);
		track.setBounds(tracks[i].startTime, tracks[i].yPosition, tracks[i].length, tracks[i].height);

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
}

// note: this will run for every sound that is loaded
// need a way of waiting until ALL sounds are loaded
function soundsLoaded(evt) {
	playButton.disabled = false;
	stopButton.disabled = false;

	var track = tracks.find(function(track) {
		if (track.title === evt.id) {
			return track;
		}
	})

	track.instance = createjs.Sound.createInstance(track.title);

	console.log('soundsLoaded called');
}


function playButtonClick(evt) {
	if (playButton.value === 'Play') {
		tracks.forEach(function(track) {
			track.instance.play();
			playButton.value = 'Pause';
			playButton.innerHTML = 'Pause';
		})
	} else if (playButton.value === 'Pause') {
		tracks.forEach(function(track) {
			track.instance.paused = true;
			playButton.value = 'Play';
			playButton.innerHTML = 'Play';
		})
	}
}


function stopButtonClick(evt) {
	createjs.Sound.stop();
	playButton.value = 'Play';
	playButton.innerHTML = 'Play';
}