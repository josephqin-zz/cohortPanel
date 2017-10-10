import React from 'react';

export default class Vatom extends React.Component{
    
    componentDidMount() {
        this.vatom.addEventListener('mouseover', this.props.onHighlight);
        this.vatom.addEventListener('click',this.props.onClick);
    }

    componentWillUnmount(){
        this.vatom.removeEventListener('mouseover', this.props.onHighlight);
        this.vatom.removeEventListener('click',this.props.onClick);
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