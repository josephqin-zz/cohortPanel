import React from 'react';
import ReactDom from 'react-dom';
import Cohortpanel from './components/Cohortpanel'


var width = 1000,
	height = 500,
	dataset = new Array;



var renderModule = function(node){

	const cleandata = dataset.filter((d)=>d.logPval!==null).map((d,i)=>{
		let item = {};
		Object.assign(item,d);
		item.id = i;
		return item;
	});
    	
    
	ReactDom.render(
	<Cohortpanel width={width} height ={height} dataset={cleandata} />,
	node.node()
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