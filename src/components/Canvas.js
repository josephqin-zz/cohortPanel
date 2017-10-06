import React from 'react';
import Vatom from './Vatom'

export default class Canvas extends React.Component{
    constructor(props){
    	super(props);
    	this.handlerMouseOver = this.handlerMouseOver.bind(this);
    }

    handlerMouseOver(e){
    	
    	console.log(e);
        
    	
    }

    render(){
		const atomList= this.props.dataset.map((p,i)=><Vatom key={i} location={p.location} onHighlight={this.handlerMouseOver}  shape={p.shape}/>)
		return <svg width={this.props.width} height={this.props.height} >
					<g>
					   {atomList}
					</g>
		       </svg>;
	}
}