import React from 'react';
import Canvas from './Canvas';
import {volcanoPlot,scatterPlot,keggPlot,linePlot} from './plotFn'
import axios from 'axios';


export default class Cohortpanel extends React.Component {
	constructor(props){
		super(props);
    this.defaultPlot = this.props.defaultType==='volcano'?{title:'volcano plot',data:volcanoPlot(this.props.dataset,this.props.width,this.props.height)}:{title:'Kegg Map',data:keggPlot(this.props.dataset,this.props.width,this.props.height)}
		this.state = {plots:[this.defaultPlot]}
        
	}


    
  forwardClickHandler(d){
    // console.log(d);
    let metadata = this.props.dataset;
		let plotData = {};
    if(d.type==='metabolite'){
         plotData.title = 'scatter plot ' + metadata[d.id].metabolite + '(' +metadata[d.id].kegg_id+')' ;
         plotData.data = scatterPlot(metadata[d.id],this.props.width,this.props.height);
         this.setState({plots:[this.defaultPlot,plotData]});
    }else{
        axios.get('http://10.4.1.60/mtb/getData.php?type=mtb_chromat&peak_ids='+d.id.toString())
              .then(res => {
                let lines = res.data.data.values.map((d)=>{
                   let line = {};
                   line.id = 'peak'+d.peak_id;
                   line.name = d.sample_name;
                   let x = d.eic_rt.split(',').map((d)=>Number(d))
                   let y = d.eic_intensity.split(',').map((d)=>Number(d))
                   line.values = x.map((t,i)=>{
                    return {x:t,y:y[i]}
                  }).filter((c)=>c.x>=Number(d.min_rt)&&c.x<=Number(d.max_rt));
                   line.ref = d.rt;
                   return line;
                });
                plotData.title = 'Chromatogram' + ' Peak ID: '+res.data.data.values[0].peak_id;
                plotData.data = linePlot(lines,this.props.width,this.props.height);
                this.setState((prestate)=>({plots:[...prestate.plots.filter((d,i)=>i<2),plotData]}))

              })
    }
		
	}

	render(){

    const plotsData = this.state.plots.map((plot,index)=><div key={index}>
             <h3 id='title'>{ plot.title }</h3>
             <Canvas width={this.props.width} height ={this.props.height} dataset={plot.data} onClick={this.forwardClickHandler.bind(this)}/>
             </div>
        );
       
		return (<div>
             {plotsData}
			       </div>)

	}
}