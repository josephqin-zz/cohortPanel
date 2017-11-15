import React from 'react';
import { volcanoPlot } from './plotFn'
import Vatom from './Vatom'

export default class Volcanoplot extends React.Component{
    constructor(props){
    	super(props);
    	
    }

   

    render(){
		const atomList= this.props.dataset.map((p)=><Vatom key={p.key} onClick = { ()=>this.props.onClick(p) } {...p} />)
		

        return <svg width={this.props.width} height={this.props.height}>
					<g>
					   {atomList}
					</g>
		       </svg>;
	}
}