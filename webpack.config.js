
var path = require('path');

var SRC = path.resolve(__dirname, "src");
var OUTPUT = path.resolve(__dirname, "build");

module.exports = {
	entry: SRC+"/index.jsx",
	output:{
		// library:'cohortPanel',
		path:OUTPUT,
		library:'cohortPanel',
		libraryTarget:'umd',
		filename:'cohortPanelV2.js'

	},
	module:{
		loaders:[{
			test : /\.jsx?/,
			include: SRC,
	        loader: "babel-loader",
		}]
	}
};