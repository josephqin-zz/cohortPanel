import * as d3 from 'd3'
import canvasPanel from './canvasPanel';
import {volcanoPlot,scatterPlot,keggPlot,linePlot} from '../components/plotFn'


var width = 1000,
    height = 500,
    plotType = 'volcano',
    dataset = new Array;

    
//   forwardClickHandler(d){
//     // console.log(d);
//     let metadata = this.props.dataset;
// 		let plotData = {};
//     if(d.type==='metabolite'){
//          plotData.title = 'scatter plot ' + metadata[d.id].metabolite + '(' +metadata[d.id].kegg_id+')' ;
//          plotData.data = scatterPlot(metadata[d.id],this.props.width,this.props.height);
//          this.setState({plots:[this.defaultPlot,plotData]});
//     }else{
//         axios.get('http://10.4.1.60/mtb/getData.php?type=mtb_chromat&peak_ids='+d.id.toString())
//               .then(res => {
//                 let lines = res.data.data.values.map((d)=>{
//                    let line = {};
//                    line.id = 'peak'+d.peak_id;
//                    line.name = d.sample_name;
//                    let x = d.eic_rt.split(',').map((d)=>Number(d))
//                    let y = d.eic_intensity.split(',').map((d)=>Number(d))
//                    line.values = x.map((t,i)=>{
//                     return {x:t,y:y[i]}
//                   }).filter((c)=>c.x>=Number(d.min_rt)&&c.x<=Number(d.max_rt))
//                    return line;
//                 });
//                 plotData.title = 'Chromatogram' + ' Peak ID: '+res.data.data.values[0].peak_id;
//                 plotData.data = linePlot(lines,this.props.width,this.props.height);
//                 this.setState((prestate)=>({plots:[...prestate.plots.filter((d,i)=>i<2),plotData]}))

//               })
//     }
		
// 	}

	
// }

var cohortPanel = function(_selection){
    
    let plotData = plotType==='volcano'?{title:'volcano plot',data:volcanoPlot(dataset,width,height)}:{title:'Kegg Map',data:keggPlot(dataset,width,height)}

    _selection.selectAll('g')
              .data([plotData])
              .enter()
              .append('g')
              .each(function(d){
                   d3.select(this)
                     .call(canvasPanel.bindData(d))
              })
}

cohortPanel.bindData=function(data){
    if(!arguments.length) return dataset;
    dataset = data;
    return this;
}

cohortPanel.setHeight = function(data){
  if(!arguments.length) return height;
  height = data;
  return this;
}

cohortPanel.setWidth = function(data){
  if(!arguments.length) return dataset;
  width = data;
  return this;
}

cohortPanel.setType = function(data){
  if(!arguments.length) return plotType;
  plotType = data;
  return this;
}



export default cohortPanel;