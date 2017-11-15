import React from 'react';

export default class Scrollerline extends React.Component{
	constructor(props){
		super(props);
		this.state={x:props.location.x,y:props.location.y,dragging:false}
	}
    
    componentDidMount() {
        this.vatom.addEventListener('mousedown', this.dragStart.bind(this));
        this.vatom.addEventListener('mousemove', this.dragging.bind(this));
        this.vatom.addEventListener('mouseup',this.dragEnd.bind(this));
    }

    componentWillUnmount(){
        this.vatom.removeEventListener('mousedown', this.dragStart.bind(this));
        this.vatom.removeEventListener('mousemove', this.dragging.bind(this));
        this.vatom.removeEventListener('mouseup',this.dragEnd.bind(this));
    }

    dragStart(e){
        this.setState({dragging:true})
        e.stopPropagation()
        e.preventDefault()
    	
    }
    dragging(e){
        if(this.state.dragging){
            if(this.props.horizon){
        	   this.setState({y:e.offsetY})
            }else{
               this.setState({x:e.offsetX}) 
            }
        }
        e.stopPropagation()
        e.preventDefault()
    }
    dragEnd(e){
        this.setState({dragging:false})
        e.stopPropagation()
        e.preventDefault()

    }

   	render(){

		const textStyle = !this.props.tick?{ dominantBaseline:'hanging',textAnchor:'start', fontSize:'.6em',fill:'#000000'}:this.props.tick;
        
       
       
        return <g ref={ref=>this.vatom = ref}>
				 <g transform={"translate ("+this.state.x+','+this.state.y+")"}>
				 <path  {...this.props.shape} />
				 { this.props.tick && <text {...textStyle}> {this.props.label} </text> }
				 </g>
				 
		       </g>;  
	}
}