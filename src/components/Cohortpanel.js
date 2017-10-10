import React from 'react';
import Canvas from './Canvas';
import {volcanoPlot,scatterPlot,keggPlot,linePlot} from './plotFn'
import axios from 'axios';


export default class Cohortpanel extends React.Component {
	constructor(props){
		super(props);
		this.state = {phase:[0],plot:{title:'volcano plot',data:volcanoPlot(this.props.dataset,this.props.width,this.props.height)}}
        
	}


    getnewPlot(newPhase){
    	let metadata = this.props.dataset;
		let phaseLength = newPhase.length;
        let phaseIndex = newPhase[phaseLength-1];
        
        if(phaseLength===1){
           let plotData = {};
           if(phaseIndex===0){
           	plotData.title='volcano plot';
            plotData.data=volcanoPlot(metadata,this.props.width,this.props.height);
            this.setState({phase:[...newPhase],plot:plotData});
           }else{
           	        		 	
            plotData.title='kegg Map';
            plotData.data=keggPlot(metadata,this.props.width,this.props.height);
            this.setState({phase:[...newPhase],plot:plotData});
           		 
           } 
           
           
        }
        else if(phaseLength===2){
           let plotData = {};
           plotData.title = 'scatter plot';
           plotData.data = scatterPlot(metadata[phaseIndex],this.props.width,this.props.height);
           this.setState({phase:[...newPhase],plot:plotData});	
        }else{
        	 axios.get('http://10.4.1.60/mtb/getData.php?type=mtb_chromat&peak_ids='+phaseIndex.toString())
        	 	  .then(res => {
        	 	  	let lines = res.data.data.values.map((d)=>{
			             let line = {};
			             line.id = 'peak'+d.peak_id;
			             line.name = d.sample_name;
			             let x = d.eic_rt.split(',').map((d)=>Number(d))
			             let y = d.eic_intensity.split(',').map((d)=>Number(d))
			             line.values = x.map((t,i)=>{
			              return {x:t,y:y[i]}
			            }).filter((c)=>c.x>=Number(d.min_rt)&&c.x<=Number(d.max_rt))
			             return line;
			          });
        	 	  	this.setState({phase:[...newPhase],plot:{title:'Chromatogram',data:linePlot(lines,this.props.width,this.props.height)}})

        	 	  })
        };

        
    }


	backwardClickHandler(){
		this.getnewPlot(this.state.phase.filter((d,i,self)=>i<self.length-1))
	}

	forwardClickHandler(d){
		if(this.state.phase.length<3){this.getnewPlot([...this.state.phase,d])}
		
	}
    switchClickHandler(){
    	if(this.state.phase[0]===0){this.getnewPlot([1])}
    	else{this.getnewPlot([0])}
    }

	render(){
		
       
		return (<div>
			        { this.state.phase.length === 1 && <button onClick={this.switchClickHandler.bind(this)}> { this.state.phase[0]===0?'Keeg Map':'Volcano Plot' }   </button>}
					<h2 id='title'>{ this.state.phase.length > 1 && <button onClick={this.backwardClickHandler.bind(this) }>  { '<<' }</button>} { this.state.plot.title }</h2>
					<Canvas width={this.props.width} height ={this.props.height} dataset={this.state.plot.data} onClick={this.forwardClickHandler.bind(this)}/>
			   </div>)

	}
}