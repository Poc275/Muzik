function Track(name, url, fill) {
	this.startTime = 0;
	this.yPosition = 0;
	this.length = 200;
	this.height = 50;
	this.fill = fill || '#AAAAAA';
	this.title = name;
	this.url = url;
	this.instance = null;
}

// Track.prototype.trackLoaded = function(bufferList) {
// 	console.log(bufferList);
// }