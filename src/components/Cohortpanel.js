import React from 'react';
import Canvas from './Canvas';

export default class Cohortpanel extends React.Component {
	constructor(props){
		super(props);
		this.state = {phase:[0],plot:this.props.dataset[0][0]}

	}

    getnewPlot(newPhase){
    	let metadata = this.props.dataset;
		let phaseLength = newPhase.length;
        let phaseIndex = newPhase[phaseLength-1];
        this.setState({phase:[...newPhase],plot:metadata[phaseLength-1][phaseIndex]});
    }


	backwardClickHandler(){
		this.getnewPlot(this.state.phase.filter((d,i,self)=>i<self.length-1))
	}

	forwardClickHandler(d){
		if(this.state.phase.length<2){this.getnewPlot([...this.state.phase,d])}
		

	}

	render(){
		
       
		return (<div>
					<h2 id='title'>{ this.state.phase.length > 1 && <button onClick={this.backwardClickHandler.bind(this) }>  { '<<' }</button>} { this.state.plot.title }</h2>
					
					<Canvas width={this.props.width} height ={this.props.height} dataset={this.state.plot.data} onClick={this.forwardClickHandler.bind(this)}/>
			   </div>)

	}
}