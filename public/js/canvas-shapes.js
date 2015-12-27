window.onload = init;
// e.g. tracks in a song will already be known
var tracks = [new Track(), 
  new Track(70, 'lightskyblue'),
  new Track(80, '#00FF00')];

var project = new Project(tracks);

var log = document.getElementById('output');

function init() {
	var canvas = document.getElementById('track');
	canvas.height = 400;
	canvas.width = 1000;
  canvas.style.border = '1px solid black';

	var cs = new CanvasState(canvas);

  for (var i = 0; i < tracks.length; i++) {
    cs.addTrack(tracks[i]);
  }

	// cs.addTrack(new Track(40, 40, 50, 50));
	// cs.addTrack(new Track(60, 140, 40, 70, 'lightskyblue'));
  // cs.addTrack(new Track(500, 240, 120, 80, '#00FF00'));
}

function CanvasState(canvas) {
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.ctx = canvas.getContext('2d');

	// state tracking
	this.valid = false;
	this.tracks = [];
	this.dragging = false;
	this.selection = null;
	this.dragoffx = 0;
	this.dragoffy = 0;

	var myState = this;

	// disable double clicking to select text
	canvas.addEventListener('selectstart', function(e) {
		e.preventDefault();
		return false;
	}, false);

	// up, down, and move are for dragging
	canvas.addEventListener('mousedown', function(e) {
		var mouse = myState.getMouse(e);
		var mx = mouse.x;
		var my = mouse.y;
		var tracks = myState.tracks;
		var len = tracks.length;

		for (var i = len - 1; i >= 0; i--) {
			if (tracks[i].contains(mx, my)) {
				var mySel = tracks[i];
				myState.dragoffx = mx - mySel.start;
				myState.dragoffy = my - mySel.yPos;
				myState.dragging = true;
				myState.selection = mySel;
				myState.valid = false;
				return;
			}
		}

		if (myState.selection) {
			myState.selection = null;
			myState.valid = false;
		}
	}, true);

	canvas.addEventListener('mousemove', function(e) {
		if (myState.dragging) {
			var mouse = myState.getMouse(e);

			myState.selection.start = mouse.x - myState.dragoffx;
			// myState.selection.y = mouse.y - myState.dragoffy;
			myState.valid = false;

      log.innerHTML = myState.selection.start;
		}
	}, true);

	canvas.addEventListener('mouseup', function(e) {
    	myState.dragging = false;
  	}, true);

	// options
	this.selectionColor = '#CC0000';
	this.interval = 30;

	setInterval(function() {
		myState.draw();
	}, myState.interval);
}


CanvasState.prototype.addTrack = function(track) {
  this.tracks.push(track);
  this.valid = false;
}


CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}


CanvasState.prototype.draw = function() {
  if (!this.valid) {
    var ctx = this.ctx;
    var tracks = this.tracks;
    this.clear();
    
    // ** Add stuff you want drawn in the background all the time here **
    
    // draw all tracks
    var len = tracks.length;

    for (var i = 0; i < len; i++) {
      var track = tracks[i];
      // We can skip the drawing of elements that have moved off the screen:
      if (track.start > this.width || track.yPos > this.height ||
          track.start + track.length < 0 || track.yPos + track.height < 0) {
      		continue;
      }
      tracks[i].draw(ctx);
    }
    
    // draw selection
    // right now this is just a stroke along the edge of the selected track
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.start, mySel.yPos, mySel.length, mySel.height);
    }
    
    // ** Add stuff you want drawn on top all the time here **
    
    this.valid = true;
  }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas;
  var offsetX = 0;
  var offsetY = 0;
  var mx = 0;
  var my = 0;
  
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  // ALL UNDEFINED!
  //offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  //offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
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