<template>
  <div id="parallel_chart">
    <div id="parallel_chart_main"></div>
    <div id="parallel_chart_mini">
      <div v-for="i in 7" class="parallel_mini" :key="i" :id="'mini'+i"></div>
    </div>
  </div>
</template>

<script>
    import * as d3 from 'd3'
    export default {
        name: "AppParallel",
        mounted() {
            this.Test_Chart()
            this.Mini_Test_Chart('mini1')
            this.Mini_Test_Chart('mini2')
            this.Mini_Test_Chart('mini3')
            this.Mini_Test_Chart('mini4')
            this.Mini_Test_Chart('mini5')
            this.Mini_Test_Chart('mini6')
            this.Mini_Test_Chart('mini7')

        },
        methods: {
            Test_Chart() {

                let parallel_chart = {}

                parallel_chart.margin = {top: 20, right: 100, bottom: 20, left: 100}

                parallel_chart.width = document.getElementById('parallel_chart_main').offsetWidth - parallel_chart.margin.left * 2;
                parallel_chart.height = document.getElementById('parallel_chart_main').offsetHeight - parallel_chart.margin.bottom * 2;

                parallel_chart.svg = d3.select('#parallel_chart_main').append('svg')
                    .attr("viewBox", [0, 0, parallel_chart.width, parallel_chart.height])
                    // .attr('width',parallel_chart.width)
                    // .attr('height',parallel_chart.height)
                    .append("g")
                    .attr("transform",
                        "translate(" + parallel_chart.margin.left + "," + parallel_chart.margin.top + ")");

                // Here I set the list of dimension manually to control the order of axis:
                let dimensions = ["SrcIp", "srcPort", "dateTime", "destPort", 'destIp']

                // For each dimension, I build a linear scale. I store all in a y object
                let y = {}
                // for (let i = 0;i<dimensions.length;i++) {
                //     let name = dimensions[i]
                //     y[name] = d3.scaleLinear()
                //         .domain( [0,8] ) // --> Same axis range for each group
                //         // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
                //         .range([parallel_chart.height, 0])
                // }

                let x = d3.scalePoint()
                    .range([0, parallel_chart.width - parallel_chart.margin.right * 2])
                    .domain(dimensions);

                function path(d) {
                    return d3.line().curve(d3.curveCardinal)(dimensions.map(function (p) {
                        return [x(p), y[p](d[p])];
                    }));
                }

                d3.csv('../../../static/nf_mini_data.csv').then(
                    res1 => {
                        d3.csv('../../../static/mini_data.csv').then(res2 => {

                            res1 = res1.map(d => {
                                return {
                                    SrcIp: d.firstSeenSrcIp,
                                    dateTime: d3.timeParse('%Y-%m-%d %H:%M:%S')(d.parsedDate),
                                    srcPort: parseInt(d.firstSeenSrcPort),
                                    destPort: parseInt(d.firstSeenDestPort),
                                    destIp: d.firstSeenDestIp,
                                    IPS:false
                                }
                            });
                            res2 = res2.map(d => {
                                return {
                                    SrcIp: d.SrcIp,
                                    dateTime: d3.timeParse('%Y-%m-%d %H:%M:%S')(d.dateTime),
                                    srcPort: parseInt(d.srcPort),
                                    destPort: parseInt(d.destPort),
                                    destIp: d.destIp,
                                    IPS:true
                                }
                            });

                            let res = res2.concat(res1)

                            y['SrcIp'] = d3.scalePoint()
                                .domain(Array.from(d3.group(res, d => d.SrcIp).keys()))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['dateTime'] = d3.scaleTime()
                                .domain(d3.extent(res, d => d.dateTime))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['srcPort'] = d3.scaleLinear()
                                .domain(d3.extent(res, d => d.srcPort))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['destPort'] = d3.scalePoint()
                                .domain(Array.from(d3.group(res, d => d.destPort).keys()).sort((a,b)=>a-b))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['destIp'] = d3.scalePoint()
                                .domain(Array.from(d3.group(res, d => d.destIp).keys()))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            // console.log(date_extent);
                            parallel_chart.svg
                                .selectAll("myPath")
                                .data(res)
                                .enter()
                                .append("path")
                                .attr("d", path)
                                .style("fill", "none")
                                .style("stroke", d=>d.IPS?'#dd421e':'rgba(100,158,221,0.8)')
                                .style("opacity", 0.1)
                                .style('stroke-width', 2)
                            // .on("mouseover", highlight)
                            // .on("mouseleave", doNotHighlight )
                            //
                            //     // Draw the axis:
                            parallel_chart.svg.selectAll("myAxis")
                            // For each dimension of the dataset I add a 'g' element:
                                .data(dimensions)
                                .enter()
                                .append("g")
                                .attr("class", "axis")
                                // I translate this element to its right position on the x axis
                                .attr("transform", function (d) {
                                    return "translate(" + x(d) + ")";
                                })
                                // And I build the axis with the call function
                                .each(function (d) {
                                    if (d === 'dateTime')
                                        d3.select(this).call(d3.axisLeft().tickFormat(d3.timeFormat('%M:%S')).scale(y[d]));
                                    else if (d === 'destIp') {
                                        d3.select(this).call(d3.axisRight().scale(y[d]));
                                    } else
                                        d3.select(this).call(d3.axisLeft().scale(y[d]));

                                })
                                // Add axis title
                                .append("text")
                                .style("text-anchor", "middle")
                                .attr("y", -9)
                                .text(function (d) {
                                    return d;
                                })
                                .style("fill", "black")
                        });
                    })
            },
            Mini_Test_Chart(id) {

                let parallel_chart = {}

                parallel_chart.margin = {top: 10, right: 20, bottom: 10, left: 20}

                parallel_chart.width = document.getElementById(id).offsetWidth - parallel_chart.margin.left * 2;
                parallel_chart.height = document.getElementById(id).offsetHeight - parallel_chart.margin.bottom * 2;

                parallel_chart.svg = d3.select('#' + id).append('svg')
                // .attr("viewBox", [0, 0, parallel_chart.width, parallel_chart.height])
                    .attr('width', parallel_chart.width)
                    .attr('height', parallel_chart.height)
                    .append("g")
                    .attr("transform",
                        "translate(" + parallel_chart.margin.left + "," + parallel_chart.margin.top * 2 + ")");

                // Here I set the list of dimension manually to control the order of axis:
                let dimensions = ["SrcIp", "srcPort", "dateTime", "destPort", 'destIp']

                // For each dimension, I build a linear scale. I store all in a y object
                let y = {}
                // for (let i = 0;i<dimensions.length;i++) {
                //     let name = dimensions[i]
                //     y[name] = d3.scaleLinear()
                //         .domain( [0,8] ) // --> Same axis range for each group
                //         // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
                //         .range([parallel_chart.height, 0])
                // }

                let x = d3.scalePoint()
                    .range([0, parallel_chart.width - parallel_chart.margin.right * 2])
                    .domain(dimensions);

                function path(d) {
                    return d3.line().curve(d3.curveBundle)(dimensions.map(function (p) {
                        return [x(p), y[p](d[p])];
                    }));
                }

                d3.csv('../../../static/nf_mini_data.csv').then(
                    res1 => {
                        d3.csv('../../../static/mini_data.csv').then(res2 => {

                            res1 = res1.map(d => {
                                return {
                                    SrcIp: d.firstSeenSrcIp,
                                    dateTime: d3.timeParse('%Y-%m-%d %H:%M:%S')(d.parsedDate),
                                    srcPort: parseInt(d.firstSeenSrcPort),
                                    destPort: parseInt(d.firstSeenDestPort),
                                    destIp: d.firstSeenDestIp,
                                    IPS: false
                                }
                            });

                            res2 = res2.map(d => {
                                return {
                                    SrcIp: d.SrcIp,
                                    dateTime: d3.timeParse('%Y-%m-%d %H:%M:%S')(d.dateTime),
                                    srcPort: parseInt(d.srcPort),
                                    destPort: parseInt(d.destPort),
                                    destIp: d.destIp,
                                    IPS: true
                                }
                            });

                            let res = res2.concat(res1)

                            // console.log(res);

                            y['SrcIp'] = d3.scalePoint()
                                .domain(Array.from(d3.group(res, d => d.SrcIp).keys()))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['dateTime'] = d3.scaleTime()
                                .domain(d3.extent(res, d => d.dateTime))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['srcPort'] = d3.scaleLinear()
                                .domain(d3.extent(res, d => d.srcPort))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['destPort'] = d3.scaleLinear()
                                .domain(d3.extent(res, d => d.destPort))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['destIp'] = d3.scalePoint()
                                .domain(Array.from(d3.group(res, d => d.destIp).keys()))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            // console.log(date_extent);
                            parallel_chart.svg
                                .selectAll("myPath")
                                .data(res)
                                .enter()
                                .append("path")
                                .attr("d", path)
                                .style("fill", "none")
                                .style("stroke", '#649edd')
                                .style("opacity", 0.5)
                                .style('stroke-width', .4)
                            // .on("mouseover", highlight)
                            // .on("mouseleave", doNotHighlight )
                            //
                            //     // Draw the axis:
                            parallel_chart.svg.selectAll("myAxis")
                            // For each dimension of the dataset I add a 'g' element:
                                .data(dimensions)
                                .enter()
                                .append("g")
                                .attr("class", "axis")
                                // I translate this element to its right position on the x axis
                                .attr("transform", function (d) {
                                    return "translate(" + x(d) + ")";
                                })
                                // And I build the axis with the call function
                                .each(function (d) {
                                    if (d === 'dateTime')
                                        d3.select(this).call(d3.axisLeft().tickFormat(d3.timeFormat('%M:%S')).scale(y[d]));
                                    else
                                        d3.select(this).call(d3.axisLeft().scale(y[d]));

                                })
                                // Add axis title
                                .append("text")
                                .style("text-anchor", "middle")
                                .attr("y", -9)
                                .text(function (d) {
                                    return d;
                                })
                                .style("fill", "black")
                        });

                    })
            }
        }
    }
</script>

<style scoped>
  /*#parallel_chart{*/
  /*  position: absolute;*/
  /*  bottom: 0;*/
  /*  width: 100%;*/
  /*  height: 50%;*/
  /*  background-color: #2c3e50;*/
  /*}*/

  #parallel_chart_main{
    position: relative;
    width: 100%;
    height: 70%;
    background-color: #efefef;
  }
  #parallel_chart_mini{
    position: relative;
    width: 100%;
    height: 30%;
    /*background-color: #2c3e50;*/
  }
  .axis {
    opacity: 0.4;
  }
  .axis:hover {
    opacity: 1;
  }

  .parallel_mini{
    position: relative;
    float: left;
    width:13.95%;
    background-color: #efefef;
    height: 96%;
    margin: 3px;
  }
</style>
