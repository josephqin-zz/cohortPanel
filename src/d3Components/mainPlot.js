import * as d3 from 'd3';
import { event as currentEvent } from 'd3'

import vAtom from './vAtom'

var width = 1000,
    height = 500,
    boundary = {y:0,x:[]},
    dispatch = d3.dispatch('setboundry')

var clickEvent = (d)=>console.log(d);

var mainPlot = function(_selection){
    
    
    _selection.append('h2')
              .text((d)=>d.title)
              // .style('dominant-baseline','hanging')
              // .style('text-anchor','start');
   const wrapper = _selection.append('div').attr('id','wrapper')
                             .style('display','inline-grid')
                             .style('grid-template-columns',width.toString()+'px '+(width*1/3).toString()+'px '+(width*1/3).toString()+'px')

   const svg = wrapper.append('div').append('svg')
              .attr('width',width)  
              .attr('height',height)

   const g = svg.selectAll('g')
                .data((d)=>d3.entries(d.data))
          		  .enter()
          		  .append('g')
                .attr('id',(d)=>d.key)
            
  const vatom = g.selectAll('g')
             .data((d)=>d.value)
             .enter()
             .append('g')
        		 .each(function(d){
        		  	 d3.select(this).call(vAtom)
        		   })
             .on('click',clickEvent);
  if(_selection.data()[0].title==='volcano plot'){
     const blueList = wrapper.append('div').attr('id','blueList').style('max-height',height+'px').style('overflow','scroll').style('color','blue')
  const redList = wrapper.append('div').attr('id','redList').style('max-height',height+'px').style('overflow','scroll').style('color','red')          

  boundary.y = d3.select('#pVline').data()[0].location.y
  boundary.x = d3.select('#referenceLines').data()[0].value.filter((d)=>d.key!=='pVline').map((d)=>d.location.x).sort((a,b)=>a-b)
  const circles = d3.select('#plot').selectAll('path')
  //setBoundary
  dispatch.on('setboundry',function(){
    circles.style('fill',(d)=>(d.location.y <= this.y && (d.location.x <= d3.min(this.x) || d.location.x >= d3.max(this.x)))?d.defaultColor:'grey')
    let shownodes = circles.data().filter((d)=>(d.location.y <= this.y && (d.location.x <= d3.min(this.x) || d.location.x >= d3.max(this.x))))
    
    blueList.selectAll('*').remove();
    redList.selectAll('*').remove();
    blueList.selectAll('p').data(shownodes.filter((d)=>d.defaultColor==='blue').map((d)=>d.label.split(';')[0].split(':')[1])).enter().append('p').text((d)=>d)
    redList.selectAll('p').data(shownodes.filter((d)=>d.defaultColor==='red').map((d)=>d.label.split(';')[0].split(':')[1])).enter().append('p').text((d)=>d)
  })

  dispatch.call('setboundry',boundary)

  //add drag behavior
  d3.select('#pVline')
                 .call(d3.drag()
                         .on("drag", function(d){
                            boundary.y = currentEvent.y;
                            d3.select(this).attr('transform',d3.zoomIdentity.translate(d.location.x,currentEvent.y));
                            dispatch.call('setboundry',boundary);
                            }))

  d3.select('#vline0')
                 .call(d3.drag()
                         .on("drag", function(d){
                            boundary.x[0] = currentEvent.x
                            d3.select(this).attr('transform',d3.zoomIdentity.translate(currentEvent.x,d.location.y));
                            dispatch.call('setboundry',boundary);
                            }))

  d3.select('#vline1')
                 .call(d3.drag()
                         .on("drag", function(d){
                            boundary.x[1] = currentEvent.x
                            d3.select(this).attr('transform',d3.zoomIdentity.translate(currentEvent.x,d.location.y));
                            dispatch.call('setboundry',boundary);
                            })) 
  }
               

  
}

mainPlot.setClick = function(fn){
    if(!arguments.length) return clickEvent;
    clickEvent = fn
    return this;
}

mainPlot.setHeight = function(data){
  if(!arguments.length) return height;
  height = data;
  return this;
}

mainPlot.setWidth = function(data){
  if(!arguments.length) return dataset;
  width = data;
  return this;
}


export default mainPlot;