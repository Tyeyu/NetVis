<template>
  <div id="parallel_chart">
    <div id="parallel_chart_main"></div>
    <div id="parallel_chart_mini"></div>
  </div>
</template>

<script>
    import * as d3 from 'd3'
    import readcsv from "../ToolJs/Readcsv";
    export default {
        name: "AppParallel",
        data(){
            return {
                mini_mode:['durationSeconds','srcPayloadBytes','destPayloadBytes','srcTotalBytes','destTotalBytes','srcPacketCount','destPacketCount'],
            }
        },
        mounted() {
            readcsv.GetParallel_data('1','2')
        },
        methods: {
            Test_Chart(data) {

                let parallel_chart = {}

                parallel_chart.margin = {top: 30, right: 100, bottom: 10, left: 100}

                parallel_chart.width = document.getElementById('parallel_chart_main').offsetWidth - parallel_chart.margin.left * 2;
                parallel_chart.height = document.getElementById('parallel_chart_main').offsetHeight -parallel_chart.margin.bottom*2;

                d3.select('#parallel_chart_main').html('')

                parallel_chart.svg = d3.select('#parallel_chart_main').append('svg')
                    .attr("viewBox", [0, 0, parallel_chart.width, parallel_chart.height])
                    // .attr('width',parallel_chart.width)
                    // .attr('height',parallel_chart.height)
                    .append("g")
                    .attr("transform", "translate(" + parallel_chart.margin.left + "," + (parallel_chart.margin.top+parallel_chart.margin.bottom) + ")");

                parallel_chart.title = parallel_chart.svg.append('text') ///Add title
                    .text('CONNECTION  FLOW')
                    .attr('class','chart_title')
                    .attr('x',-80)
                    .attr('y',-25)

                let ip_sort = (data,attribute)=>{
                    return Array.from(d3.group(data, d => d[attribute]).values()).map(d => {
                        return {
                            ip: d[0][attribute],
                            ip_array: d[0][attribute].split('.'),
                            value: d.length
                        }
                    }).sort((a, b) => {
                        let arr1 = a.ip.split('.')
                        let arr2 = b.ip.split('.')
                        for (let i = 0; i < 4; i++) {
                            if (parseInt(arr1[i]) > parseInt(arr2[i])) {
                                return 1
                            } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
                                return -1
                            }
                        }
                    })
                }
                let construct_root = data =>{
                    return {
                        name: 'root',
                        children: Array.from(d3.group(data, d => d.ip_array[0]).values()).map(d => {
                            return {
                                name: d[0].ip_array[0],
                                // value:d3.sum(d,d=>d.value),
                                children: Array.from(d3.group(d, d => d.ip_array[1]).values()).map(d => {
                                    return {
                                        name: d[0].ip_array[1],
                                        // value: d3.sum(d, d => d.value),
                                        children: Array.from(d3.group(d, d => d.ip_array[2]).values()).map(d => {
                                            return {
                                                name: d[0].ip_array[2],
                                                // value: d3.sum(d, d => d.value),
                                                children: Array.from(d3.group(d, d => d.ip_array[3]).values()).map(d => {
                                                    return {
                                                        name: d[0].ip_array[3],
                                                        // value: d3.sum(d, s => s.value),
                                                        value: d[0].value
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
                let partition = data => d3.partition()
                    .size([parallel_chart.height-parallel_chart.margin.top*2, 100])
                    .padding(1)
                    (d3.hierarchy(data)
                        .sum(d => d.value))

                let ip_data_src = ip_sort(data,'srcIp')
                let ip_data_dest = ip_sort(data,'destIp')

                let partition_src = partition(construct_root(ip_sort(data,'srcIp')))
                let partition_dest = partition(construct_root(ip_sort(data,'destIp')))

                let color =  d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, partition_dest.children.length+1))

                parallel_chart.rect_left = parallel_chart.svg.append('g')
                    .attr('transform',`translate(-115)`)
                    .selectAll('g')
                    .data(d=> partition(construct_root(ip_sort(data.filter(s=>s[d] !== '0'),'srcIp'))).descendants().filter(d => d.depth !== 0))
                    .join('g')
                    .attr("transform", d => `translate(${d.y0},${d.x0})`);
                //
                parallel_chart.rect_left.append('rect')
                    .attr("width", d => d.y1 - d.y0)
                    .attr("height", d => d.x1 - d.x0)
                    .attr("fill-opacity", 0.6)
                    .attr("fill", d => {
                        if (!d.depth) return "#ccc";
                        while (d.depth > 1) d = d.parent;
                        return color(d.data.name);
                    })
                    .append("title")
                    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join(".")}`.replace('root.', ''));

                parallel_chart.rect_right = parallel_chart.svg.append('g')
                    .attr('transform',`translate(${parallel_chart.width-105})`)
                    .selectAll('g')
                    .data(d=> partition(construct_root(ip_sort(data.filter(s=>s[d] !== '0'),'destIp'))).descendants().filter(d => d.depth !== 0))
                    .join('g')
                    .attr("transform", d => `translate(-${d.y0},${d.x0})`);

                parallel_chart.rect_right.append('rect')
                    .attr("width", d => d.y1 - d.y0)
                    .attr("height", d => d.x1 - d.x0)
                    .attr("fill-opacity", 0.6)
                    .attr("fill", d => {
                        if (!d.depth) return "#ccc";
                        while (d.depth > 1) d = d.parent;
                        return color(d.data.name);
                    })
                    .append("title")
                    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join(".")}`.replace('root.', ''));

                parallel_chart.rect_left.filter(d => (d.x1 - d.x0) > 10)
                    .append("text")
                    .style('font-size', '6px')
                    .attr('dx', '1em')
                    // .attr('y',d=>d.y0-d.y1)
                    // .attr("x", 4)
                    .attr("y", 9)
                    .append("tspan")
                    .text(d => d.data.name);

                parallel_chart.rect_right.filter(d => (d.x1 - d.x0) > 10)
                    .append("text")
                    .style('font-size', '6px')
                    .attr('dx', '1em')
                    // .attr('y',d=>d.y0-d.y1)
                    // .attr("x", 4)
                    .attr("y", 9)
                    .append("tspan")
                    .text(d => d.data.name);

                let dimensions = ["srcIp", "srcPort", "dateTime", "destPort", 'destIp']

                let x = d3.scalePoint()
                    .range([0, parallel_chart.width - parallel_chart.margin.right * 2 + 30])
                    .domain(dimensions);

                let y = {}


                let path = d =>  d3.line().curve(d3.curveCardinal)(dimensions.map(p =>  [x(p), y[p](d[p])]));

                y['srcIp'] = d3.scaleBand()
                    .domain(ip_data_src.map(d => d.ip))
                    .range([0, parallel_chart.height - parallel_chart.margin.top*2])

                y['dateTime'] = d3.scaleTime()
                    .domain(d3.extent(data, d => d.dateTime))
                    .range([parallel_chart.height - parallel_chart.margin.top*2 , 0])

                y['srcPort'] = d3.scaleSqrt()
                    .domain(d3.extent(data, d => d.srcPort))
                    .range([parallel_chart.height - parallel_chart.margin.top*2, 0])

                y['destPort'] = d3.scaleSqrt()
                    .domain(d3.extent(data, d => d.destPort))
                    .range([parallel_chart.height - parallel_chart.margin.top*2, 0])

                y['destIp'] = d3.scaleBand()
                    .domain(ip_data_dest.map(d => d.ip))
                    .range([parallel_chart.height - parallel_chart.margin.top*2, 0])


                parallel_chart.paths = parallel_chart.svg.append('g')
                    .attr('transform','translate(-15)')
                    .selectAll("myPath")
                    .data(data)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", "none")
                    .style("stroke", d => d.ips ? '#ff0f20' : 'rgba(100,158,221,0.8)')
                    .style("opacity", .1)
                    .style('stroke-width', 1)
                    .on('mouseover',function(d) {
                        d3.select(this).style('stroke-width', 3).style('opacity', 1)
                    })
                    .on('mouseout',function(d) {
                        d3.select(this).style('stroke-width', 1).style('opacity', .1)
                    })
                    .append('title')
                    .text(d => `${d.srcIp}:${d.srcPort}->${d.destIp}:${d.destPort}`)

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
                            // d3.select(this).call(d3.axisRight().tickFormat('').tickSize(0).scale(y[d]));
                        }
                        else if(d === 'srcIp'){
                            // d3.select(this).call(d3.axisLeft().tickFormat('').tickSize(0).scale(y[d]));
                        }
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

            },
            sub_chart(data){

                data = data.map(d=>{
                    return {
                        srcIp: d.SrcIp,
                        dateTime: d3.timeParse('%Y-%m-%d %H:%M:%S')(d.dateTime),
                        srcPort: parseInt(d.srcPort),
                        destPort: parseInt(d.destPort),
                        destIp: d.destIp,
                        ips:d.ips,
                        durationSeconds:d.durationSeconds,
                        srcPayloadBytes:d.srcPayloadBytes,
                        destPayloadBytes:d.destPayloadBytes,
                        srcTotalBytes:d.srcPayloadBytes,
                        destTotalBytes:d.destTotalBytes,
                        srcPacketCount:d.srcPacketCount,
                        destPacketCount:d.destPacketCount
                    }
                })

                this.Test_Chart(data.filter(s=>s['srcPayloadBytes']!=="0"))

                let sub_parallel_chart = {}
                let that = this;

                let mode = ['durationSeconds','srcPayloadBytes','destPayloadBytes','srcTotalBytes','destTotalBytes','srcPacketCount','destPacketCount']
                let dimensions = ["srcIp", "srcPort", "dateTime", "destPort", 'destIp']

                sub_parallel_chart.margin = {top: 15, right: 30, bottom: 15, left: 30}

                sub_parallel_chart.width = document.getElementById('parallel_chart_mini').offsetWidth;
                sub_parallel_chart.height = document.getElementById('parallel_chart_mini').offsetHeight;
                sub_parallel_chart.cell_width = sub_parallel_chart.width/7

                sub_parallel_chart.svg = d3.select('#parallel_chart_mini')
                    .append('svg')
                    .attr("viewBox", [0, 0, sub_parallel_chart.width, sub_parallel_chart.height])

                sub_parallel_chart.groups = sub_parallel_chart.svg.selectAll('g')
                    .data(mode)
                    .enter()
                    .append('g')
                    .attr('transform',(d,i)=>`translate(${i * sub_parallel_chart.cell_width},${sub_parallel_chart.margin.top + 5})`)
                    .on('click',function(d,i) {
                        d3.selectAll('.parallel_mask').attr('opacity',0)
                        d3.select(this).select('.parallel_mask').attr('opacity',.3)
                        that.Test_Chart(data.filter(s=>s[i]!=="0"))
                    })
                    .on('mouseover',(d)=>{
                        d3.select('body').style('cursor','pointer')
                    })
                    .on('mouseout',()=>{
                        d3.select('body').style('cursor','')
                    })


                sub_parallel_chart.title = sub_parallel_chart.groups.append('text')
                    .text(d=>d)
                    .attr('dx','1em')
                    .attr('dy','-6')


                let ip_sort = (data,attribute)=>{
                    return Array.from(d3.group(data, d => d[attribute]).values()).map(d => {
                        return {
                            ip: d[0][attribute],
                            ip_array: d[0][attribute].split('.'),
                            value: d.length
                        }
                    }).sort((a, b) => {
                        let arr1 = a.ip.split('.')
                        let arr2 = b.ip.split('.')
                        for (let i = 0; i < 4; i++) {
                            if (parseInt(arr1[i]) > parseInt(arr2[i])) {
                                return 1
                            } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
                                return -1
                            }
                        }
                    })
                }
                let construct_root = data =>{
                    return {
                        name: 'root',
                        children: Array.from(d3.group(data, d => d.ip_array[0]).values()).map(d => {
                            return {
                                name: d[0].ip_array[0],
                                // value:d3.sum(d,d=>d.value),
                                children: Array.from(d3.group(d, d => d.ip_array[1]).values()).map(d => {
                                    return {
                                        name: d[0].ip_array[1],
                                        // value: d3.sum(d, d => d.value),
                                        children: Array.from(d3.group(d, d => d.ip_array[2]).values()).map(d => {
                                            return {
                                                name: d[0].ip_array[2],
                                                // value: d3.sum(d, d => d.value),
                                                children: Array.from(d3.group(d, d => d.ip_array[3]).values()).map(d => {
                                                    return {
                                                        name: d[0].ip_array[3],
                                                        // value: d3.sum(d, s => s.value),
                                                        value: d[0].value
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
                let partition = data => d3.partition()
                    .size([sub_parallel_chart.height-sub_parallel_chart.margin.top*2, 30])
                    .padding(1)
                    (d3.hierarchy(data)
                        .sum(d => d.value))

                let ip_data_src = ip_sort(data,'srcIp')
                let ip_data_dest = ip_sort(data,'destIp')

                let partition_dest = partition(construct_root(ip_sort(data,'destIp')))

                let color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, partition_dest.children.length + 1))

                sub_parallel_chart.rect_left = sub_parallel_chart.groups.append('g')
                    .attr('transform',`translate(0)`)
                    .selectAll('g')
                    .data(d=> partition(construct_root(ip_sort(data.filter(s=>s[d] !== '0'),'srcIp'))).descendants().filter(d => d.depth !== 0))
                    .join('g')
                    .attr("transform", d => `translate(${d.y0},${d.x0})`);
                //
                sub_parallel_chart.rect_left.append('rect')
                    .attr("width", d => d.y1 - d.y0)
                    .attr("height", d => d.x1 - d.x0)
                    .attr("fill-opacity", 0.6)
                    .attr("fill", d => {
                        if (!d.depth) return "#ccc";
                        while (d.depth > 1) d = d.parent;
                        return color(d.data.name);
                    });

                sub_parallel_chart.rect_right = sub_parallel_chart.groups.append('g')
                    .attr('transform',`translate(${sub_parallel_chart.cell_width-5})`)
                    .selectAll('g')
                    .data(d=> partition(construct_root(ip_sort(data.filter(s=>s[d] !== '0'),'destIp'))).descendants().filter(d => d.depth !== 0))
                    .join('g')
                    .attr("transform", d => `translate(-${d.y0},${d.x0})`);

                sub_parallel_chart.rect_right.append('rect')
                    .attr("width", d => d.y1 - d.y0)
                    .attr("height", d => d.x1 - d.x0)
                    .attr("fill-opacity", 0.6)
                    .attr("fill", d => {
                        if (!d.depth) return "#ccc";
                        while (d.depth > 1) d = d.parent;
                        return color(d.data.name);
                    });

                let x = d3.scalePoint()
                    .range([0, sub_parallel_chart.width/7 - 60])
                    .domain(dimensions);

                let y = {}

                let path = d =>  d3.line().curve(d3.curveCardinal)(dimensions.map(p =>  [x(p), y[p](d[p])]));

                y['srcIp'] = d3.scaleBand()
                    .domain(ip_data_src.map(d => d.ip))
                    .range([0, sub_parallel_chart.height - sub_parallel_chart.margin.top*2])

                y['dateTime'] = d3.scaleTime()
                    .domain(d3.extent(data, d => d.dateTime))
                    .range([sub_parallel_chart.height - sub_parallel_chart.margin.top*2 -10, 0])

                y['srcPort'] = d3.scaleSqrt()
                    .domain(d3.extent(data, d => d.srcPort))
                    .range([sub_parallel_chart.height - sub_parallel_chart.margin.top*2, 0])

                y['destPort'] = d3.scaleSqrt()
                    .domain(d3.extent(data, d => d.destPort))
                    .range([sub_parallel_chart.height - sub_parallel_chart.margin.top*2, 0])

                y['destIp'] = d3.scaleBand()
                    .domain(ip_data_dest.map(d => d.ip))
                    .range([sub_parallel_chart.height - sub_parallel_chart.margin.top*2, 0])


                sub_parallel_chart.paths = sub_parallel_chart.groups.append('g')
                    .attr('transform','translate(30)')
                    .selectAll("myPath")
                    .data(d=>data.filter(s=>s[d]!=='0'))
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", "none")
                    .style("stroke", d => d.ips ? '#ff0f20' : 'rgba(100,158,221,0.8)')
                    .style("opacity", .1)
                    .style('stroke-width', 1)

                sub_parallel_chart.mask = sub_parallel_chart.groups
                    .append('rect')
                    .attr('class','parallel_mask')
                    .attr('width',sub_parallel_chart.cell_width)
                    .attr('height',sub_parallel_chart.height)
                    .attr('fill','#bbb')
                    .attr('opacity',d=>d === 'srcPayloadBytes'?0.3:0)

            }
        },
        computed:{
            ParallelData(){
                return this.$store.getters.getParallelData
            }
        },
        watch:{
            ParallelData:{
                handler(data){
                    this.sub_chart(data);
                }

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
    height: 65%;
    /*background-color: #efefef;*/
  }
  #parallel_chart_mini{
    position: relative;
    width: 100%;
    height: 35%;
    /*background-color: #2c3e50;*/
  }
  .axis {
    opacity: 0.4;
  }
  .axis:hover {
    opacity: 1;
  }
  .chart_title{
    font-size: 20px;
  }
</style>
