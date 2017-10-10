import * as d3 from "d3";
import React from 'react';
import ReactDom from 'react-dom';
import Cohortpanel from './components/Cohortpanel'

var width = 1000,
	height = 500,
	dataset = new Array;

var drawCircle = (radius) => 'M '+(0-radius)+' '+0+' a '+radius+' '+radius+', 0, 1, 0, '+(radius*2)+' '+0+' '+'a '+radius+' '+radius+', 0, 1, 0, '+(-radius*2)+' '+0;
  	
var volcanoPlot = function(dataSet,width,height){
       let xMax = d3.max(dataSet.map((d)=>d.mean_ratio));
       let xMin = d3.min(dataSet.map((d)=>d.mean_ratio));
       let yMax = d3.max(dataSet.map((d)=>d.logPval));
       let yMin = d3.min(dataSet.map((d)=>d.logPval));
       let xFn = d3.scaleLinear().range([0,width]).domain([xMin,xMax]).nice();
       let yFn = d3.scaleLinear().range([height,0]).domain([yMin,yMax]).nice();
       let color = d3.scaleSequential().domain([yMin*xMin,yMax*xMax]).interpolator(d3.interpolateRainbow);
       
       

       return dataSet.map((t)=>{
        let item = {};
        item.id = t.id;
        item.label = t.metabolite;
        item.location={x:xFn(t.mean_ratio),y:yFn(t.logPval)};
        item.shape={d:drawCircle(5),fill:color(t.mean_ratio*t.logPval),stroke:'#ffffff','strokeWidth':'1px'}
        return item
       })

    }

var scatterPlot = function(data,width,height){
    let dataSet = data.sort((a,b)=>a.x>b.x);
    let xValues = dataSet.map((d)=>d.id)
    let xFn = d3.scalePoint().range([20,width]).domain(xValues).padding(0.5);



    let yMax = d3.max(dataSet.map((d)=>d.y));
    let yMin = d3.min(dataSet.map((d)=>d.y));
    // let ymedian = d3.median(dataSet.map((d)=>d.y))
    let yFn = d3.scaleLinear().range([height,40]).domain([0,yMax]);
    
    let color = d3.scaleOrdinal().range(d3.schemeCategory20).domain(xValues);
    
    return dataSet.map((t)=>{
      let item = {}
      item.id = t.id
      item.label = t.id
      item.location= {x:xFn(t.id),y:yFn(t.y)}
      item.shape={d:drawCircle(10),fill:color(t.id),strokeWidth:'1px'}
      return item;
    })

    }

var getNode = function(peakids,vals,cohort){
      let peakid = peakids.split(',');
      let val = vals.split(',');

      return peakid.map((d,i)=>{
          let item = {};
          item.x = cohort;
          item.id = +d;
          item.y = +val[i];
          return item;
      })
    }

var renderModule = function(node){

	const cleandata = dataset.filter((d)=>d.logPval!==null).map((d,i)=>{
		let item = {};
		Object.assign(item,d);
		item.id = i;
		return item;
	});
    const vocalnoplotData = {title:'volcano plot',data:volcanoPlot(cleandata,width,height)};
    const keggplotData = {title:'kegg map',data:volcanoPlot(cleandata,width,height)}
    const scatterplotData = cleandata.reduce((acc,d)=>{
       let item = {}
       item.title = 'scatter plot'
       item.data = scatterPlot([...getNode(d.peakids_1,d.vals_1,d.cohort1),...getNode(d.peakids_2,d.vals_2,d.cohort2)],cwidth,cheight);
       acc[d.id] = item;
       return acc;
       },{});
    const plotdata = [
     {'0':vocalnoplotData,'1':keggplotData},
     scatterplotData,
     ];
 	
    
	ReactDom.render(
	<Cohortpanel width={width} height ={height} dataset={plotdata} />,
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