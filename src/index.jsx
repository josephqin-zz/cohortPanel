import React from 'react';
import ReactDom from 'react-dom';
import Canvas from './components/Canvas'

var width = 1000,
	height = 500,
	dataset = new Array;



var renderModule = function(node){
	ReactDom.render(
	<div>
		<h2>Volcanon Plot</h2>	
		<Canvas width={width} height ={height} dataset={dataset} />
	</div>,
	node
	)
};

renderModule.bindData = function(data){
	if(!arguments.length) return dataset;
	dataset = [...data];
	return this;
}


renderModule.setHeight = function(data){
	if(!arguments.length) return height;
	height = data;
	return this;
}

renderModule.setWidth = function(data){
	if(!arguments.length) return dataset;
	width = data;
	return this;
}

module.exports = renderModule;