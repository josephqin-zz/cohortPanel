import React from 'react';
import Vatom from './Vatom'

export default class Canvas extends React.Component{
    constructor(props){
    	super(props);
    	this.state = {showLabel:-1}
    }

    handlerHighlight(d){
    	
    	this.setState({showLabel:d})
        
    	
    }

    render(){
		const atomList= this.props.dataset.map((p,i)=><Vatom key={i} onHighlight={this.handlerHighlight.bind(this,i)} {...p} showLabel={this.state.showLabel===i}/>)
		return <svg width={this.props.width} height={this.props.height} >
					<g>
					   {atomList}
					</g>
		       </svg>;
	}
}