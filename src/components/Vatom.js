import React from 'react';

export default class Vatom extends React.Component{
	constructor(props){
		super(props);
		this.state={x:null,y:null}
	}
    
    componentDidMount() {
        this.vatom.addEventListener('mouseover', this.onHighlight.bind(this));
        this.vatom.addEventListener('mouseout', this.offHighlight.bind(this));
        this.vatom.addEventListener('click',this.props.onClick);
    }

    componentWillUnmount(){
        this.vatom.removeEventListener('mouseover', this.onHighlight.bind(this));
        this.vatom.removeEventListener('mouseout', this.offHighlight.bind(this));
        this.vatom.removeEventListener('click',this.props.onClick);
    }

    onHighlight(e){
    	this.setState({x:e.offsetX,y:e.offsetY})
    }
    offHighlight(e){
    	this.setState({x:null,y:null})
    }

   	render(){

		const textStyle = !this.props.tick?{ dominantBaseline:'hanging',textAnchor:'start', fontSize:'.6em',fill:'#000000'}:this.props.tick;
        
        const content = ( this.state.x && this.props.label )?this.props.label.toString().split(';').map((c,i)=><tspan key={i} x={this.state.x} y={this.state.y+10*i}>{c}</tspan>):null;
		return <g ref={ref=>this.vatom = ref}>
				 <g transform={"translate ("+this.props.location.x+','+this.props.location.y+")"}>
				 <path  {...this.props.shape} />
				 { this.props.tick && <text {...textStyle}> {this.props.label} </text> }
				 </g>
				 { !this.props.tick && <text {...textStyle}> { content }  </text>} 
		       </g>;  
	}
}