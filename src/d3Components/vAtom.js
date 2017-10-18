import * as d3 from 'd3';



var upperReg = /[A-Z]/    

var attrVert = (d) => Array.from(d).map((d)=>d).reduce((acc,d)=>[...acc,upperReg.test(d)?'-'+d.toLowerCase():d],[]).join('')


var render = (node,shape)=>Object.keys(shape).forEach((d)=>node.attr(attrVert(d),shape[d]))


var vAtom = function(_selection){
    let dataset = _selection.data()[0]
    const textStyle = !dataset.tick?{ dominantBaseline:'hanging',textAnchor:'start', fontSize:'.6em',fill:'#000000'}:dataset.tick;
	// const content = ( this.state.x && this.props.label )?this.props.label.toString().split(';').map((c,i)=><tspan key={i} x={this.state.x} y={this.state.y+10*i}>{c}</tspan>):null;
	let atomNode = _selection.append('g').attr('name','node')
	atomNode.attr('transform',d3.zoomIdentity.translate(dataset.location.x,dataset.location.y))
    render(atomNode.append('path'),dataset.shape)
    if(dataset.tick){render(atomNode.append('text').text(dataset.label),textStyle)}
    let tooltip = _selection.append('text').attr('name','tooltip')
    render(tooltip,textStyle);
    _selection.node().addEventListener('mouseover',function(e){

    	 let label = _selection.data()[0].label;
         
    	 if(label){
           
    	 	tooltip.selectAll('tspan')
    	 		   .data(label.toString().split(';'))
    	 		   .enter()
    	 		   .append('tspan')
    	 		   .text((t)=>t)
    	 		   .attr('x',e.offsetX)
    	 		   .attr('y',(t,i)=>e.offsetY+10*i)
    	 };
    })

    _selection.node().addEventListener('mouseout',(e)=>{
    	   
    	 	tooltip.selectAll('*').remove();
    	 		  
    })

    // _selection.node().addEventListener('click',(e)=>{
           
    //         clickEvent(_selection.data()[0])
                  
    // })

}



   
        
		

export default vAtom;