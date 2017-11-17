'use strict';
import * as d3 from "d3";
import { event as currentEvent } from 'd3'
import {default as inputBox} from "./inputBox";
import {default as scrollerButton} from "./scrollerButton";
var options=d3.range('100').map((d,i)=>{return {value:'opt'+i,selected:false,show:true}}),
	width=200,
	height=300,
	rowRanges = d3.range(10),
	showOptions = options.filter((d)=>d.show),
	selectFn = (value)=>{console.log(value+' is selected')};
    

var listPanel = function(_selection){
	_selection.selectAll('*').remove();
	let cellHeight = (height-30)/rowRanges.length;
	let cellWidth = width;
    
	let dispatcher = d3.dispatch('updateOpts','selectOpt','scrollOpts');
    let inputFn = (value)=>{
		options = options.map((d)=>{return {...d,show:(value && d.value.toLowerCase().indexOf(value.toLowerCase())===-1)?false:true}});
		rowRanges = d3.range(rowRanges.length)
		dispatcher.call('updateOpts',this,rowRanges);
	}
    let inputPanelFn = inputBox.setWidth(width).setInputFn(inputFn).setPlaceholder('Searching') 
    let inputPanel = _selection.append('g')
                    .attr('id','inputBox')
                    .on('click',function(d){
                    	dispatcher.call('updateOpts',this,rowRanges);
                    })
                    .call(inputPanelFn);
    let scrollerPanel =  _selection.append('g').attr('id','scrollerPanel').attr('transform',d3.zoomIdentity.translate(0,30))               
	let selectionPanel = _selection.append('g').attr('id','selectionPanel').attr('transform',d3.zoomIdentity.translate(10,30));



	dispatcher.on('selectOpt',function(opt){
		options = options.map((d)=>{return {...d,selected:d.value===opt.value?true:false}})//change selected opt statu;
		selectFn(opt.value);
		inputPanel.call(inputPanelFn.setPlaceholder(opt.value));//input show the selected one
		dispatcher.call('updateOpts',this,rowRanges);//opts refreshed
		// selectionPanel.selectAll('*').remove();
	});

    dispatcher.on('scrollOpts',function(step){
    	if( !( step<0 && d3.min(rowRanges)-1===-1 ) && !( step>0 && d3.max(rowRanges)+1===showOptions.length) )
		rowRanges = rowRanges.map((d)=>d+step);
			  
		dispatcher.call('updateOpts',this,rowRanges);
    })

	dispatcher.on('updateOpts',function(ranges=[...rowRanges]){
		selectionPanel.selectAll('*').remove();
		scrollerPanel.selectAll('*').remove();
		showOptions = options.filter((d)=>d.show);
		
		
		selectionPanel.selectAll('g')
				  .data(showOptions.filter((d,i)=>ranges.includes(i)))
				  .enter()
				  .append('g')
				  .each(function(opt,i){
				  	
				  	let text = opt.value===null?'no value':opt.value.toString() 
                    let textsize = Math.floor(cellWidth/text.length);
                    
                    d3.select(this).attr('transform',d3.zoomIdentity.translate(0,cellHeight*i))
    				d3.select(this).append('rect')
    				   				   .attr('width',cellWidth)
    				   				   .attr('height',cellHeight)
    				   				   .attr('fill',opt.selected?'#f7d0b2':'#ffffff')
    				   				   .style('opacity',0.8);

    				d3.select(this).append('text')
    				    			   .text(text)
    				    			   .style('fill','#000000')
                                       //control text size to include everthing in cell
                                       .style('font-size',textsize*2.2>16?16:textsize*2.2)	
    				    			   .attr('x',0)
    				    			   .attr('y',cellHeight/2)
    				    			   .style('dominant-baseline','middle')
    				    			   .style('text-anchor','start')

         			})
				   .on('click',(d)=>dispatcher.call('selectOpt',this,d))
            
              if(showOptions.length>rowRanges.length){
			  scrollerPanel.call(scrollerButton
			  			         .setDomain(showOptions.length)
			  			         .setLocation(d3.min(rowRanges))
			  			         .setDragEvent((cur)=>{
			  			         	if( cur>=0 && cur <= showOptions.length-9){
			  			         		rowRanges = d3.range(cur,cur+10);
			  			         		dispatcher.call('updateOpts',this,rowRanges);
			  			         	}
			  			         }))
              }
              selectionPanel.node().addEventListener('mousewheel',function(e){
              e.stopPropagation();	
              if(showOptions.length>rowRanges.length){
		      dispatcher.call('scrollOpts',this,e.deltaY<0?1:-1) ;
		      }
		    });
		  
    
			 
   	})

	dispatcher.call('updateOpts',this,rowRanges);
	
}

listPanel.bindData = function(data){
	if(!arguments.length) return options;
	options = [...data.map((d)=>{return {value:d,selected:false,show:true}})];
	return this;
}

listPanel.setHeight = function(data){
	if(!arguments.length) return height;
	height = data;
	return this;
}

listPanel.setWidth = function(data){
	if(!arguments.length) return dataset;
	width = data;
	return this;
}

listPanel.setRow = function(num){
	if(!arguments.length) return rowRanges.length;
	rowRanges = d3.range(num);
	return this;
}

listPanel.setSelectFn = function(fn){
	if(!arguments.length) return selectFn;
	selectFn = fn;
	return this;
}


export default listPanel;
