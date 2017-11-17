import * as d3 from 'd3'
import canvasPanel from './canvasPanel';
import mainPlot from './mainPlot';
import {volcanoPlot,scatterPlot,keggPlot,linePlot} from '../components/plotFn'
import axios from 'axios';


var width = 1000,
    height = 500,
    plotType = 'volcano',
    dataset = new Array,
    plotsData = new Array;

var dispatcher = d3.dispatch('updateUI')
    
var forwardClickHandler = function(d){
    // console.log(d);
    let metadata = dataset;
		let plotData = {};
    if(d.type==='metabolite'){
         plotData.title = 'scatter plot ' + metadata[d.id].metabolite + '(' +metadata[d.id].kegg_id+')' ;
         plotData.data = scatterPlot(metadata[d.id],width,height);
         plotsData = [plotData]
         dispatcher.call('updateUI',this,plotsData);
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
                  }).filter((c)=>c.x>=Number(d.min_rt)&&c.x<=Number(d.max_rt))
                   line.ref = d.rt;
                   return line;
                });
                plotData.title = 'Chromatogram' + ' Peak ID: '+res.data.data.values[0].peak_id;
                plotData.data = linePlot(lines,width,height);
                plotsData=[...plotsData.filter((d,i)=>i<1),plotData]
                dispatcher.call('updateUI',this,plotsData);

              })
    }	
	}

	
// }

var cohortPanel = function(_selection){
    _selection.selectAll('*').remove()
    plotsData = []

    _selection.append('div')
              .attr('id','mainPlot')
              .datum(plotType==='volcano'?{title:'volcano plot',data:volcanoPlot(dataset,width,height)}:{title:'Kegg Map',data:keggPlot(dataset,width,height)})
              .call(mainPlot.setClick(forwardClickHandler).setHeight(height).setWidth(width))

    const restplots = _selection.append('div')
    dispatcher.on('updateUI',function(plots){
      restplots.selectAll('*').remove();
      
      restplots.selectAll('div')
              .data(plots)
              .enter()
              .append('div')
              // .attr('transform',(d,i)=>d3.zoomIdentity.translate(0,height*i))
              .each(function(d){
                   d3.select(this)
                     .call(canvasPanel.setClick(forwardClickHandler).setHeight(height).setWidth(width))
              })
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