function Track(name, url, fill) {
	this._startTime = 0;
	this._yPosition = 0;
	this._length = 200;
	this._height = 50;
	this._fill = fill || '#AAAAAA';
	this._title = name;
	this._url = url;
	this._instance = null;
}