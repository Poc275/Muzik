window.onload = init;

// e.g. project/tracks, this would be retrieved from the DB
var tracks = [new Track(), 
  new Track(70, 'lightskyblue'),
  new Track(80, '#00FF00')];
var project = new Project(tracks);

var log = document.getElementById('output');


function init() {
	var stage = new createjs.Stage("project");

	for (var i = 0; i < tracks.length; i++) {
		var track = new createjs.Shape();
		track.graphics.beginFill(tracks[i].fill).drawRect(tracks[i].start, tracks[i].yPos, tracks[i].length, tracks[i].height);

		track.on("mousedown", function(e) {
			// retrieve position of mouse selection and set as transform point
			// (regX) so that the tracks move smoothly
			var target = e.currentTarget;
			var localToTrack = target.globalToLocal(e.stageX, e.stageY);
			target.regX = localToTrack.x;
		});

		track.on("pressmove", function(e) {
			var min = e.stageX - e.currentTarget.regX;
			var max = e.stageX + e.currentTarget.regX;
			console.log(e.currentTarget.regX + " min: " + min + " max: " + max);

			e.currentTarget.x = e.stageX;
			stage.update();
		});

		stage.addChild(track);
	}

	stage.update();
}


// Object that represents an individual track
function Track(length, fill) {
	this.start = 0;
	this.yPos = 0;
	this.length = length || 200;
	this.height = 50;
	this.fill = fill || '#AAAAAA';
}

Track.prototype.draw = function(ctx) {
	ctx.fillStyle = this.fill;
	ctx.fillRect(this.start, this.yPos, this.length, this.height);
}


// Object that represents a project/song
function Project(tracks) {
  this.tracks = tracks;

  // calculate y positions
  for (var i = 0; i < tracks.length; i++) {
    tracks[i].yPos = i * tracks[i].height;
  }
}

Project.prototype.init = function() {

}