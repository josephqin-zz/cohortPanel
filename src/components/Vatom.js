import React from 'react';

export default class Vatom extends React.Component{
    
    componentDidMount() {
        this.vatom.addEventListener('click', this.props.onClick);
    }

    componentWillUnmount(){
        this.vatom.removeEventListener('click', this.props.onClick);
    }

    

	render(){
        
		return <g ref={ref=>this.vatom = ref} transform={"translate ("+this.props.location.x+','+this.props.location.y+")"}>
				 <path {...this.props.shape} />
				 <text>{this.props.text}</text> 
		       </g>; 
	}
}