import React from 'react';
import Vatom from './Vatom'
import Scrollerline from './Scrollerline'

export default class Canvas extends React.Component{
    constructor(props){
    	super(props);
    	// this.state = {showLabel:-1}
    }

    // handlerHighlight(d){
    	
    // 	this.setState({showLabel:d})
        
    	
    // }

    render(){
		const atomList = this.props.dataset.plot.map((p)=><Vatom key={p.key} onClick = { ()=>this.props.onClick(p) } {...p} />)
		const axis = this.props.dataset.axis?this.props.dataset.axis.map((p)=><Vatom key={p.key} onClick = { null } {...p} />):null
        const reflines = this.props.dataset.referenceLines?this.props.dataset.referenceLines.map((p)=><Scrollerline key={p.key} horizon={p.key==='pVline'?true:false} {...p} />):null
        return <svg width={this.props.width} height={this.props.height} >
					<g>
                       {reflines}
					   {atomList}
                       {axis}
                    </g>
		       </svg>;
	}
}