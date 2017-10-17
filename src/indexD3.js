import * as d3 from "d3";
import cohortPanel from './d3components/cohortPanel'


var width = 1000,
	height = 500,
	plotType = 'volcano',
	dataset = new Array;

var renderModule = function(node){

	const cleandata = dataset.filter((d)=>d.logPval!==null && !isNaN(d.logPval) ).map((d,i)=>{
		let item = {};
		Object.assign(item,d);
		item.id = i;
		item.type = 'metabolite';
		return item;
	});
    	
  	node.append('svg')
  		.attr('width',width)
  		.attr('height',height)
  		.call(cohortPanel.bindData(cleandata).setType(plotType).setWidth(width).setHeight(height))
	
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

renderModule.setType = function(data){
	if(!arguments.length) return plotType;
	plotType = data;
	return this;
}

renderModule.remove = function(node){
	node.selectAll('*').remove();
}

module.exports = renderModule;