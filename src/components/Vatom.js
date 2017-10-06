import React from 'react';

export default class Vatom extends React.Component{
    
    componentDidMount() {
        this.vatom.addEventListener('mouseover', this.props.onHighlight);
    }

    componentWillUnmount(){
        this.vatom.removeEventListener('mouseover', this.props.onHighlight);
    }

   	render(){

		const textStyle = { dominantBaseline:'hanging',textAnchor:'start', fontSize:'.5em',fill:'#000000'}
        const content = this.props.label
		return <g ref={ref=>this.vatom = ref} transform={"translate ("+this.props.location.x+','+this.props.location.y+")"}>
				 <path {...this.props.shape} />
				 { this.props.showLabel && <text style={textStyle}> {content} </text> } 
		       </g>;  
	}
}