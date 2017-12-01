import * as d3 from 'd3';

var upperReg = /[A-Z]/    


//interpret 'backgroundColor' to 'background-color'
var attrVert = (d) => Array.from(d).map((d)=>d).reduce((acc,d)=>[...acc,upperReg.test(d)?'-'+d.toLowerCase():d],[]).join('')
var render = (node,shape)=>Object.keys(shape).forEach((d)=>node.attr(attrVert(d),shape[d]))


var vAtom = function(_selection){
    let dataset = _selection.data()[0]
    //text CSS style
    const textStyle = !dataset.tick?{ dominantBaseline:'hanging',textAnchor:'start', fontSize:'.6em',fill:'#000000'}:dataset.tick;
	// const content = ( this.state.x && this.props.label )?this.props.label.toString().split(';').map((c,i)=><tspan key={i} x={this.state.x} y={this.state.y+10*i}>{c}</tspan>):null;
	
    let atomNode = _selection.append('g').attr('id',(d)=>d.key)

    //set location(x,y)
	atomNode.attr('transform',d3.zoomIdentity.translate(dataset.location.x,dataset.location.y))
    
    //set attribute 'd'  
    render(atomNode.append('path'),dataset.shape)
    
    //if node is tick style for Axis then append 'text' with it
    if(dataset.tick){render(atomNode.append('text').text(dataset.label),textStyle)}
    


    let tooltip = _selection.append('text').attr('name','tooltip')
    render(tooltip,textStyle);


    //show tooltip 
    _selection.node().addEventListener('mouseover',function(e){

    	 let label = _selection.data()[0].label;
         
    	 if(!dataset.tick && label){
           
    	 	tooltip.selectAll('tspan')
    	 		   .data(label.toString().split(';'))
    	 		   .enter()
    	 		   .append('tspan')
    	 		   .text((t)=>t)
    	 		   .attr('x',e.offsetX+5)
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