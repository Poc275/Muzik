function Project() {
	this._tracks = [];
	this._duration = 60000;		// 1 min default
}

function Project(tracks) {
	this._tracks = tracks;
	this._duration = 60000;		// 1 min default
}

Project.prototype.UpdateProjectDuration = function() {
	// get a reference to the duration as 'this' changes scope
	// when inside the forEach function
	var duration = this._duration;
	this._tracks.forEach(function(track) {
		if (track._instance.duration > duration) {
			duration = track._instance.duration;
		}
	})

	this._duration = duration;
}

Project.prototype.getDuration = function() {
	return this._duration;
}