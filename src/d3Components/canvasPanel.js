import * as d3 from 'd3';
import vAtom from './vAtom'

var dataset = {'title':null,'data':null}

var canvasPanel = function(_selection){

    _selection.selectAll('g')
    		  .data(dataset.data)
    		  .enter()
    		  .append('g')
    		  .each(function(d){
    		  	d3.select(this).call(vAtom.bindData(d))
    		  })


}

canvasPanel.bindData=function(data){
		if(!arguments.length) return dataset;
		dataset = data;
		return this;
}


export default canvasPanel;