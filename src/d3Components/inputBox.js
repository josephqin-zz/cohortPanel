'use strict';
import * as d3 from "d3";
	
var width = 200,
  	height = 25,
  	placeholder='Select...';
    //module events defination
var dispatcher = d3.dispatch('getInput','reset');
    
dispatcher.on('getInput',function(value){console.log(this.value)});
dispatcher.on('reset',()=>{});
	
var inpoutBox =	function(_selection){
		var inputBox = _selection.append('g')
				.attr('id','inputBox')
  			  	.append('foreignObject')
  			  	.attr("width", width)
              	.attr("height", height)
  			  	.append('xhtml:input')
            .style('border','1px solid #000000')
            .attr('width','200')
  			  	.attr('placeholder',placeholder)
  			  	.on('keyup',function(){
  			  		
  			 	    dispatcher.call('getInput',this,this.value);
  			 	    			  	 			
  			  		
  	    	   	})
  	    	   	.on('click',function(){
  			  		
  			 	    dispatcher.call('getInput',this,this.value);
  			   			  	 			
  			  		
  	    	   	});
	};

inpoutBox.setInputFn = function(fn){
		dispatcher.on('getInput',fn);
		return this;
	};

inpoutBox.setHeight = function(data){
	if(!arguments.length) return height;
	height = data;
	return this;
}

inpoutBox.setWidth = function(data){
	if(!arguments.length) return dataset;
	width = data;
	return this;
}

inpoutBox.setPlaceholder = function(data){
	if(!arguments.length) return placeholder;
	placeholder = data;
	return this;
}


export default inpoutBox;