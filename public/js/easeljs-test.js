window.onload = init;

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
		track.on("pressmove", function(e) {
			e.target.x = e.stageX;
			console.log("target x: " + e.target.x + " stage x: " + e.stageX + " raw x: " + e.rawX);
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

// Determine if a point is inside the track's bounds
Track.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the track's X and (X + Width) and its Y and (Y + Height)
  return  (this.start <= mx) && (this.start + this.length >= mx) &&
          (this.yPos <= my) && (this.yPos + this.height >= my);
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