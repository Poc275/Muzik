function Project(audioContext, tracks) {
  this.tracks = tracks;
  this.ctx = audioContext;

  var urls = [];

  // calculate y positions
  for(var i = 0; i < tracks.length; i++) {
    tracks[i].yPosition = i * tracks[i].height;
    urls[i] = tracks[i].sound;
  }

  var bufferLoader = new BufferLoader(audioContext, urls, finishedLoading);
  bufferLoader.load();
  this.track = bufferLoader;
}


Project.prototype.playTrack = function() {
	for(var i = 0; i < this.tracks.length; i++) {
		this.playProject(this.track.bufferList[i]);
	}
}

Project.prototype.stopTrack = function() {
	for(var i = 0; i < this.tracks.length; i++) {
		this.track.bufferList[i].stop();
	}
}

Project.prototype.playProject = function(buffer) {
  var startTime = context.currentTime;

  var source = this.ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(this.ctx.destination);
  // source.connect(analyser);
  // analyser.connect(context.destination);

  if (!source.start) {
    source.start = source.noteOn;
  }
  source.start(startTime);

  // console.log(this);
}