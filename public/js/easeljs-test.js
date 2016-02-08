window.onload = init;

// e.g. project/tracks, this would be retrieved from the DB
var tracks = [new Track(), 
  new Track(70, 'lightskyblue'),
  new Track(80, '#00FF00')];
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
			var localToTrack = e.currentTarget.globalToLocal(e.stageX, e.stageY);
			e.currentTarget.regX = localToTrack.x;
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


// Object that represents an individual track
function Track(length, fill) {
	this.start = 0;
	this.yPos = 0;
	this.length = length || 200;
	this.height = 50;
	this.fill = fill || '#AAAAAA';
}

// Track.prototype.draw = function(ctx) {
// 	ctx.fillStyle = this.fill;
// 	ctx.fillRect(this.start, this.yPos, this.length, this.height);
// }


// Object that represents a project/song
function Project(tracks) {
  this.tracks = tracks;

  // calculate y positions
  for(var i = 0; i < tracks.length; i++) {
    tracks[i].yPos = i * tracks[i].height;
  }
}

Project.prototype.init = function() {

}