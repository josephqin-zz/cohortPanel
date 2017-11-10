import * as d3 from 'd3';
import vAtom from './vAtom'

var width = 1000,
    height = 500;

var clickEvent = (d)=>console.log(d);

var canvasPanel = function(_selection){
    
    _selection.append('h2')
              .text((d)=>d.title)
              // .style('dominant-baseline','hanging')
              // .style('text-anchor','start');

    _selection.append('svg')
              .attr('width',width)  
              .attr('height',height)
              .selectAll('g')
        		  .data((d)=>d.data)
        		  .enter()
        		  .append('g')
        		  .each(function(d){
        		  	 d3.select(this).call(vAtom)
        		  })
              .on('click',clickEvent);

}

canvasPanel.setClick = function(fn){
    if(!arguments.length) return clickEvent;
    clickEvent = fn
    return this;
}

canvasPanel.setHeight = function(data){
  if(!arguments.length) return height;
  height = data;
  return this;
}

canvasPanel.setWidth = function(data){
  if(!arguments.length) return dataset;
  width = data;
  return this;
}


export default canvasPanel;