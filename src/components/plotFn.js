import * as d3 from "d3";
import {keggMap} from './keggMap';

const margin = {left:20,right:20,top:20,bottom:20};


var axisFn = function(ticks,scalefn,x=true){
    let pointfn = d3.scalePoint().range(scalefn.range()).domain(d3.range(ticks));
    return d3.range(ticks).map((t)=>{
      let item = {}
      item.key = (x?'xaxis':'yaix')+t;
      item.location = {x:pointfn(t),y:20}
      item.label = scalefn.invert(pointfn(t))
      item.shape = {d:'M 0,0 L 0,10',stroke:'#000000',strokeWidth:'2px'}
      return item;
    })


}



var drawCircle = (radius) => 'M '+(0-radius)+' '+0+' a '+radius+' '+radius+', 0, 1, 0, '+(radius*2)+' '+0+' '+'a '+radius+' '+radius+', 0, 1, 0, '+(-radius*2)+' '+0;

var getNode = function(peakids,vals,cohort){
      let peakid = peakids.split(',');
      let val = vals.split(',');

      return peakid.map((d,i)=>{
          let item = {};
          item.x = cohort;
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
        let xFn = d3.scaleLinear().range([left,right]).domain([xMin,xMax]).nice();
        let yFn = d3.scaleLinear().range([top,bottom]).domain([yMin,yMax]).nice();

        return keggMap.map((g,i)=>{
           let item = {}
           let nodeDetail = metaData.filter((d)=>d.kegg_id===g.name)
           item.key = 'k'+i;
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


       //set x-scale y-scale and color;
       let xMax = d3.max(plotData.map((d)=>d.mean_ratio));
       let xMin = d3.min(plotData.map((d)=>d.mean_ratio));
       let yMax = d3.max(plotData.map((d)=>d.logPval));
       let yMin = d3.min(plotData.map((d)=>d.logPval));
       let xFn = d3.scaleLinear().range([left,right]).domain([xMin,xMax]).nice();
       let yFn = d3.scaleLinear().range([bottom,top]).domain([yMin,yMax]).nice();
       let color = d3.scaleSequential().domain([yMin*xMin,yMax*xMax]).interpolator(d3.interpolateRainbow);
       
       //vocalno plot need 0 references line 
       let refline = {key:'vline',location:{x:xFn(0),y:yFn(yMin)},shape:{d:'M 0,'+top+' L 0,-'+bottom,stroke:'#000000',strokeWidth:'1px',strokeDasharray:"5, 5" }}
       let xaxis = axisFn(10,xFn);
       return [refline,...plotData.map((t)=>{
        let item = {};
        item.key = 'v'+t.id;
        item.id = t.id;
        item.label = t.metabolite;
        item.location={x:xFn(t.mean_ratio),y:yFn(t.logPval)};
        item.shape={d:drawCircle(5),fill:color(t.mean_ratio*t.logPval),stroke:'#ffffff',strokeWidth:'1px'}
        return item
       }),...xaxis]

    }

export var scatterPlot = function(plotData,width,height){
    let left = margin.left;
    let right = width-margin.right;
    let top = margin.top;
    let bottom = height-margin.bottom;


    let data = [...getNode(plotData.peakids_1,plotData.vals_1,plotData.cohort1),...getNode(plotData.peakids_2,plotData.vals_2,plotData.cohort2)]
    let dataSet = data.sort((a,b)=>a.x>b.x);
    let xValues = dataSet.map((d)=>d.id)
    let xFn = d3.scalePoint().range([left,right]).domain(xValues).padding(0.5);



    let yMax = d3.max(dataSet.map((d)=>d.y));
    let yMin = d3.min(dataSet.map((d)=>d.y));
    // let ymedian = d3.median(dataSet.map((d)=>d.y))
    let yFn = d3.scaleLinear().range([bottom,top]).domain([0,yMax]);
    
    let color = d3.scaleOrdinal().range(d3.schemeCategory20).domain(xValues);
    
    return dataSet.map((t)=>{
      let item = {}
      item.key = t.id;
      item.id = t.id;
      item.label = t.id;
      item.location= {x:xFn(t.id),y:yFn(t.y)}
      item.shape={d:drawCircle(10),fill:color(t.id),strokeWidth:'1px'}
      return item;
    })
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
    return plotData.map((t)=>{
      let item = {}
      item.key = t.id;
      item.id = t.id
      item.label = t.name
      item.location= {x:0,y:0}
      item.shape={d:lineFunction(t.values),stroke:color(t.id),strokeWidth:'2px',fill:'none'}
      return item;
      
    })
  }