import React from 'react';
import { volcanoPlot } from './plotFn'
import Vatom from './Vatom'

class Canvas extends React.Component{
    constructor(props){
    	super(props);
    	
    }
    
    componentDidMount() {
        this.scrollerY.addEventListener('mousemove', this.onHighlight.bind(this));
    }

    componentWillUnmount(){
        this.scrollerY.removeEventListener('mousemove', this.onHighlight.bind(this));
    }
    


    render(){
		const atomList= this.props.dataset.map((p)=><Vatom key={p.key} onClick = { ()=>this.props.onClick(p) } {...p} />)
		return <svg width={this.props.width} height={this.props.height} >
					<g>
					   {atomList}
					</g>
				</svg>;
	}
}

export default class Volcanoplot extends React.Component{
    constructor(props){
    	super(props);
    	// this.state = {showLabel:-1}
    }

    // handlerHighlight(d){
    	
    // 	this.setState({showLabel:d})
        
    	
    // }

    render(){
		const atomList= this.props.dataset.map((p)=><Vatom key={p.key} onClick = { ()=>this.props.onClick(p) } {...p} />)
		return <svg width={this.props.width} height={this.props.height} >
					<g>
					   {atomList}
					</g>
		       </svg>;
	}
}