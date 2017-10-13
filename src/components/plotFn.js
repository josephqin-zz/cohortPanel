import * as d3 from "d3";
import {keggMap} from './keggMap';

const margin = {left:30,right:20,top:20,bottom:20};

var drawCircle = (radius) => 'M '+(0-radius)+' '+0+' a '+radius+' '+radius+', 0, 1, 0, '+(radius*2)+' '+0+' '+'a '+radius+' '+radius+', 0, 1, 0, '+(-radius*2)+' '+0;
var drawLine = (range,direction) => 'M 0,0 '+direction+' '+Math.abs(range[1]-range[0]);

var axisFn = function(ticks,scalefn,position,xaxis=true,name=null){
    
    let pointfn = d3.scalePoint().range(scalefn.range()).domain(d3.range(ticks));
    
    let axis = {}
      axis.key=xaxis?'xaxis':'yaixs';
      axis.label=name;
      if(xaxis){
            axis.tick = { x:(scalefn.range()[1]-scalefn.range()[0]),dominantBaseline:'text-after-edge',textAnchor:'end', fontSize:'1em',fill:'#000000'}
      }else{
            axis.tick = { transform:'rotate(90)',dominantBaseline:'text-after-edge',textAnchor:'start', fontSize:'1em',fill:'#000000'}
      }
      axis.location=xaxis?{x:d3.min(scalefn.range()),y:position}:{x:position,y:d3.min(scalefn.range())};
      axis.shape={d:drawLine(scalefn.range(),xaxis?'h':'v'),stroke:'#000000',strokeWidth:'1px'};

    //select the right format for label
    let format = d3.median(scalefn.domain())>1000?d3.format('.2s'):d3.format('.2f')
    return [...d3.range(ticks).map((t)=>{
      let item = {}
      item.key = (xaxis?'xtick':'ytick')+t;
      item.location = xaxis?{x:pointfn(t),y:position}:{y:pointfn(t),x:position}
      item.label = format(scalefn.invert(pointfn(t)))
     
      if(xaxis){
          item.tick = { y:5,dominantBaseline:'hanging',textAnchor:'middle', fontSize:'.7em',fill:'#000000'}
      }else{
          item.tick = { x:-5,dominantBaseline:'central',textAnchor:'end', fontSize:'.7em',fill:'#000000'}
      }
      item.shape = {d:xaxis?'M 0,0 L 0,5':'M 0,0 L -5,0',stroke:'#000000',strokeWidth:'1px'}
      return item;
    }),axis]


}





var getNode = function(peakids,vals,cohort){
      let peakid = peakids.split(',');
      let val = vals.split(',');

      return peakid.map((d,i)=>{
          let item = {};
          item.x = cohort;
          item.type = 'sample';
          item.id = +d;
          item.y = +val[i];
          return item;
      })
    }

export var keggPlot = function(metaData,width,height){
        //set canvas boundry
        let left = 0;
        let right = width;
        let top = 0;
        let bottom = height;

        let pMax = d3.max(metaData.map((d)=>d.logPval));
        let pMin = d3.min(metaData.map((d)=>d.logPval));
        let pFn = d3.scaleSqrt().range([2,5]).domain([pMin,pMax]).nice();

        
        let dataSet = keggMap.filter((d)=>d.type==='circle')
        let xMax = d3.max(dataSet.map((d)=>+d.x));
        let xMin = d3.min(dataSet.map((d)=>+d.x));
        let yMax = d3.max(dataSet.map((d)=>+d.y));
        let yMin = d3.min(dataSet.map((d)=>+d.y));
        let xFn = d3.scaleLinear().range([left,right]).domain([xMin,xMax]);
        let yFn = d3.scaleLinear().range([top,bottom]).domain([yMin,yMax]);

        return keggMap.map((g,i)=>{
           let item = {}
           let nodeDetail = metaData.filter((d)=>d.kegg_id===g.name)
           item.key = 'k'+i;
           item.type = nodeDetail.length>0?nodeDetail[0].type:'null';
           item.id = nodeDetail.length>0?nodeDetail[0].id:g.name;
           item.label = g.type === 'line'?null:g.name
           item.location= {x:0,y:0}
           
              
          if(g.type === 'line' ){
              let coords = g.coords.split(",")
              let Xcoords = coords.filter(function(c,i){return i%2 == 0 }).map((d)=>xFn(+d))
              let Ycoords = coords.filter(function(c,i){return i%2 != 0 }).map((d)=>yFn(+d))
              item.shape={d:"M"+Xcoords.map(function(d,i){return d+","+Ycoords[i] }).join(" L"),stroke:g.fgcolor,strokeWidth:'1px',fill:'none'}             
          }else{

              item.location={x:xFn(+g.x),y:yFn(+g.y)};
              item.shape={d:drawCircle(nodeDetail.length>0?pFn(nodeDetail[0].logPval):1),fill:g.bgcolor,stroke:g.fgcolor,strokeWidth:'1px'}
          }


           return item;
          })

}


  	
export var volcanoPlot = function(plotData,width,height){
       //set canvas boundry
       let left = margin.left;
       let right = width-margin.right;
       let top = margin.top;
       let bottom = height-margin.bottom;
       let circle_ratio = width*0.007;

       //set x-scale y-scale and color;
       let xMax = d3.max(plotData.map((d)=>d.mean_ratio));
       let xMin = d3.min(plotData.map((d)=>d.mean_ratio));
       let yMax = d3.max(plotData.map((d)=>d.logPval));
       let yMin = d3.min(plotData.map((d)=>d.logPval));
       let xFn = d3.scaleLinear().range([left,right]).domain([xMin,xMax]).nice();
       let yFn = d3.scaleLinear().range([bottom,top]).domain([0,yMax]).nice();
       let color = d3.scaleSequential().domain([yMin*xMin,yMax*xMax]).interpolator(d3.interpolateRainbow);
       
       //vocalno plot need 0 references line 
       let refline = {key:'vline',location:{x:xFn(0),y:bottom},shape:{d:'M 0,0 L 0,-'+bottom,stroke:'#000000',strokeWidth:'1px',strokeDasharray:"5, 5" }}
       let axis = [...axisFn(10,xFn,bottom,true,'mean_ratio'),...axisFn(10,yFn,left,false,'logPval')];
       return [refline,...plotData.map((t)=>{
        let item = {};
        item.key = 'v'+t.id;
        item.id = t.id;
        item.type = t.type;
        item.label = t.metabolite;
        item.location={x:xFn(t.mean_ratio),y:yFn(t.logPval)};
        item.shape={d:drawCircle(circle_ratio),fill:color(t.mean_ratio*t.logPval),stroke:'#ffffff',strokeWidth:'1px'}
        return item
       }),...axis]

    }

export var scatterPlot = function(plotData,width,height){
    let left = margin.left;
    let right = width-margin.right;
    let top = margin.top;
    let bottom = height-margin.bottom;
    let circle_ratio = width*0.010;


    let data = [...getNode(plotData.peakids_1,plotData.vals_1,plotData.cohort1),...getNode(plotData.peakids_2,plotData.vals_2,plotData.cohort2)]
    let dataSet = data.sort((a,b)=>a.x>b.x);
    let xValues = dataSet.map((d)=>d.id)
    let xFn = d3.scalePoint().range([left,right]).domain(xValues).padding(0.5);



    let yMax = d3.max(dataSet.map((d)=>d.y));
    let yMin = d3.min(dataSet.map((d)=>d.y));
    // let ymedian = d3.median(dataSet.map((d)=>d.y))
    let yFn = d3.scaleLinear().range([bottom,top]).domain([0,yMax]).nice();

    let color = d3.scaleOrdinal().range(d3.schemeCategory20).domain(xValues);
    //draw xaxis

    let xaxis = d3.nest()
                    .key((d)=>d.x)
                    .rollup((d)=>d.map((t)=>xFn(t.id)))
                    .sortKeys((a,b)=>a.x>b.x)
                    .entries(data)
                    .map((g,i)=>{
                      let w = d3.max(g.value)-d3.min(g.value);
                      let item = {};
                      item.key = 'xaxis'+i;
                      item.label = g.key;
                      item.location = {x:d3.min(g.value),y:bottom}
                      item.shape = {stroke:'#000000',strokeWidth:'1px',fill:'none'};
                      item.shape.d = 'M 0,5 v -5 h'+w+' v 5';
                      item.tick = { dominantBaseline:'hanging',textAnchor:'middle', fontSize:'1em',fill:'#000000' }
                      item.tick.x = w/2;
                      item.tick.y = 2.5;
                      return item;
                    });
    


    
    let axis = [...xaxis,...axisFn(10,yFn,left,false,'areatop')];
    return [...dataSet.map((t)=>{
      let item = {}
      item.key = t.id;
      item.id = t.id;
      item.type = t.type;
      item.label = t.id;
      item.location= {x:xFn(t.id),y:yFn(t.y)}
      item.shape={d:drawCircle(circle_ratio),fill:color(t.id),strokeWidth:'1px'}
      return item;
    }),...axis]
  }

  export var linePlot=function(plotData,width,height){
    let left = margin.left;
    let right = width-margin.right;
    let top = margin.top;
    let bottom = height-margin.bottom;


    let Xmin = d3.min(plotData.map((d)=>d3.min(d.values.map((t)=>(t.x)))))
    let Xmax = d3.max(plotData.map((d)=>d3.max(d.values.map((t)=>(t.x)))))
    let Ymin = d3.min(plotData.map((d)=>d3.min(d.values.map((t)=>(t.y)))))
    let Ymax = d3.max(plotData.map((d)=>d3.max(d.values.map((t)=>(t.y)))))
    let xScale = d3.scaleLinear().range([left,right]).domain([Xmin,Xmax]).nice();
    let yScale = d3.scaleLinear().range([bottom,top]).domain([Ymin,Ymax]).nice();
     
    let color = d3.scaleOrdinal().range(d3.schemeCategory20);
    let lineFunction = d3.line()
                               .x(function (d) {return xScale(d.x);})
                               .y(function (d) {return yScale(d.y);})
                               .curve(d3.curveMonotoneX);

    let axis = [...axisFn(10,xScale,bottom,true,'rt'),...axisFn(10,yScale,left,false,'intensity')];
    return [...plotData.map((t)=>{
      let item = {}
      item.key = t.id;
      item.id = t.id
      item.label = t.name
      item.location= {x:0,y:0}
      item.shape={d:lineFunction(t.values),stroke:color(t.id),strokeWidth:'2px',fill:'none'}
      return item;
      
    }),...axis]
  }