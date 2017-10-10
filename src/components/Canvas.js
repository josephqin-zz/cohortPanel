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
		const atomList= this.props.dataset.map((p)=><Vatom key={p.key} onHighlight={this.handlerHighlight.bind(this,p.key)} onClick = { ()=>this.props.onClick(p.id) } {...p} showLabel={ this.state.showLabel===p.key }/>)
		return <svg width={this.props.width} height={this.props.height} >
					<g>
					   {atomList}
					</g>
		       </svg>;
	}
}