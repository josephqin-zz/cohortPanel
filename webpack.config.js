
var path = require('path');

var SRC = path.resolve(__dirname, "src");
var OUTPUT = path.resolve(__dirname, "build");

module.exports = {
	entry: SRC+"/playGround.jsx",
	output:{
		// library:'cohortPanel',
		path:OUTPUT,
		filename:'playGround.js'
	},
	module:{
		loaders:[{
			test : /\.jsx?/,
			include: SRC,
	        loader: "babel-loader",
		}]
	}
};