import * as d3 from "d3";
// import { event as currentEvent } from 'd3-selection'
var height = 270,
	width = 10,
	location = 0,
	moveDomain = 100,
	dragEventFn = function(d){console.log(d)};

var drawRect = (x,y,width,height) => 'M'+x+' '+y+' v '+height+' h '+width+' v -'+height+' Z';	

var scrollerButton = function(_selection){
	_selection.selectAll('*').remove();

    //draw track
	_selection.append('g').append('path')
						  .attr('d','M '+width/2+', 0'+'v '+height)
						  .attr('fill',"none")
	              		  .attr("stroke","#000")
	              		  .attr("stroke-width",'1px');
	//draw button
	let buttonHeight = height*0.1;
	let buttonWidth = width*0.7
	let moveRang = [height*0.05,height*0.95];
	let button = _selection.append('g');
	let scaleFn = d3.scaleLinear().range(moveRang).domain([0,moveDomain]);
	button.append('path')
		  .attr('d',drawRect(-buttonWidth/2,-buttonHeight/2,buttonWidth,buttonHeight))
		  .style('fill','#2E86C1')

	button.attr('transform',d3.zoomIdentity.translate(width/2,scaleFn(location)))

    // button.call(d3.drag().on("drag",dragged))
    // function dragged(){
    // 	let yCoordinate = (a,b,c)=> (a + b + c) - d3.min([a,b,c]) - d3.max([a,b,c])
    // 	dragEventFn(Math.floor(scaleFn.invert(()=>d3.event.y)));
    // 	d3.select(this).attr('transform',d3.zoomIdentity.translate(width/2,yCoordinate(...moveRang,()=>d3.event.y)))
    // }


}

scrollerButton.setDomain = function(data){
	if(!arguments.length)return data;
	moveDomain = data;
	return this;
}

scrollerButton.setLocation = function(data){
	if(!arguments.length)return data;
	location = data;
	return this;
}

scrollerButton.setDragEvent = function(fn){
	if(!arguments.length)return fn;
	dragEventFn = fn;
	return this;
}


export default scrollerButton;