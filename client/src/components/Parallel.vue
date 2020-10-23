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
        data(){
            return {
                mini_mode:['durationSeconds','srcPayloadBytes','destPayloadBytes','srcTotalBytes','destTotalBytes','srcPacketCount','destPacketCount']
            }
        },
        mounted() {
            this.Test_Chart('srcTotalBytes')
            this.Mini_Test_Chart()

        },
        methods: {
            Test_Chart(attribute) {

                let parallel_chart = {}

                parallel_chart.margin = {top: 30, right: 100, bottom: 10, left: 100}

                parallel_chart.width = document.getElementById('parallel_chart_main').offsetWidth - parallel_chart.margin.left * 2;
                parallel_chart.height = document.getElementById('parallel_chart_main').offsetHeight -parallel_chart.margin.bottom*2;

                parallel_chart.svg = d3.select('#parallel_chart_main').append('svg')
                    .attr("viewBox", [0, 0, parallel_chart.width, parallel_chart.height])
                    // .attr('width',parallel_chart.width)
                    // .attr('height',parallel_chart.height)
                    .append("g")
                    .attr("transform",
                        "translate(" + parallel_chart.margin.left + "," + (parallel_chart.margin.top+parallel_chart.margin.bottom) + ")");

                parallel_chart.title = parallel_chart.svg.append('text') ///Add title
                    .text('CONNECTION  FLOW')
                    .attr('class','chart_title')
                    .attr('x',-80)
                    .attr('y',-25)

                // Here I set the list of dimension manually to control the order of axis:
                let dimensions = ["SrcIp", "srcPort", "dateTime", "destPort", 'destIp']

                // For each dimension, I build a linear scale. I store all in a y object
                let y = {}

                let x = d3.scalePoint()
                    .range([0, parallel_chart.width - parallel_chart.margin.right * 2])
                    .domain(dimensions);

                function path(d) {
                    return d3.line().curve(d3.curveCardinal)(dimensions.map(function (p) {
                        return [x(p), y[p](d[p])];
                    }));
                }

                let src_g = parallel_chart.svg.append('g')
                    .attr('transform','translate(-100,0)')

                let dest_g = parallel_chart.svg.append('g')
                    .attr('transform',`translate(${parallel_chart.width-parallel_chart.margin.right - 20},0)`)

                d3.csv('../../../static/nf_mini_data.csv').then(
                    res1 => {
                        d3.csv('../../../static/mini_data.csv').then(res2 => {

                            res1 = res1.filter(d=>d[attribute]!=="0")

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

                            res1.forEach(d=>{
                                d.warning = res2.find(s => s.SrcIp === d.SrcIp && s.destIp === d.destIp);
                            })

                            let res = res1

                            let ip_data = Array.from(d3.group(res, d => d.SrcIp).values()).map(d => {
                                return {
                                    ip: d[0].SrcIp,
                                    ip_array: d[0].SrcIp.split('.'),
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

                            let ip_data_dest = Array.from(d3.group(res, d => d.destIp).values()).map(d => {
                                return {
                                    ip: d[0].destIp,
                                    ip_array: d[0].destIp.split('.'),
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


                            let test_data = {
                                name: 'root',
                                children: Array.from(d3.group(ip_data, d => d.ip_array[0]).values()).map(d => {
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
                            let test_data_dest = {
                                name: 'root',
                                children: Array.from(d3.group(ip_data_dest, d => d.ip_array[0]).values()).map(d => {
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

                            let partition = data => d3.partition()
                                .size([parallel_chart.height - parallel_chart.margin.top * 2 + 5, 100])
                                .padding(1)
                                (d3.hierarchy(data)
                                    .sum(d => d.value))

                            let root = partition(test_data)
                            let root2 = partition(test_data_dest)

                            let color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, test_data.children.length + 1))

                            let cell = src_g.selectAll('g')
                                .data(root.descendants().filter(d => d.depth !== 0))
                                .join('g')
                                .attr("transform", d => `translate(${d.y0},${d.x0})`);

                            cell.append('rect')
                                .attr("width", d => d.y1 - d.y0)
                                .attr("height", d => d.x1 - d.x0)
                                .attr("fill-opacity", 0.6)
                                .attr("fill", d => {
                                    // console.log(d);
                                    if (!d.depth) return "#ccc";
                                    while (d.depth > 1) d = d.parent;
                                    return color(d.data.name);
                                });

                            let cell2 = dest_g.selectAll('g')
                                .data(root2.descendants().filter(d => d.depth !== 0))
                                .join('g')
                                .attr("transform", d => `translate(-${d.y0},${d.x0})`);


                            cell2.append('rect')
                                .attr("width", d => d.y1 - d.y0)
                                .attr("height", d => d.x1 - d.x0)
                                .attr("fill-opacity", 0.6)
                                .attr("fill", d => {
                                    // console.log(d);
                                    if (!d.depth) return "#ccc";
                                    while (d.depth > 1) d = d.parent;
                                    return color(d.data.name);
                                });

                            let text = cell.filter(d => (d.x1 - d.x0) > 10)
                                .append("text")
                                .style('font-size', '6px')
                                .attr('dx', '1em')
                                // .attr('y',d=>d.y0-d.y1)
                                // .attr("x", 4)
                                .attr("y", 9);

                            let text2 = cell2.filter(d => (d.x1 - d.x0) > 10)
                                .append("text")
                                .style('font-size', '6px')
                                .attr("x", 4)
                                .attr("y", 13);

                            text.append("tspan")
                                .text(d => d.data.name);

                            text2.append("tspan")
                                .text(d => d.data.name);

                            cell.append("title")
                                .text(d => `${d.ancestors().map(d => d.data.name).reverse().join(".")}`.replace('root.', ''));


                            y['SrcIp'] = d3.scaleBand()
                                .domain(ip_data.map(d => d.ip).sort((a, b) => {
                                    let arr1 = a.split('.')
                                    let arr2 = b.split('.')
                                    for (let i = 0; i < 4; i++) {
                                        if (parseInt(arr1[i]) > parseInt(arr2[i])) {
                                            return 1
                                        } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
                                            return -1
                                        }
                                    }
                                }))
                                .range([0, parallel_chart.height - parallel_chart.margin.top * 2])

                            y['dateTime'] = d3.scaleTime()
                                .domain(d3.extent(res, d => d.dateTime))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['srcPort'] = d3.scaleSqrt()
                                .domain(d3.extent(res, d => d.srcPort))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['destPort'] = d3.scaleSqrt()
                                .domain(d3.extent(res, d => d.destPort))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            y['destIp'] = d3.scaleBand()
                                .domain(ip_data_dest.map(d => d.ip).sort((a, b) => {
                                    let arr1 = a.split('.')
                                    let arr2 = b.split('.')
                                    for (let i = 0; i < 4; i++) {
                                        if (parseInt(arr1[i]) > parseInt(arr2[i])) {
                                            return 1
                                        } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
                                            return -1
                                        }
                                    }
                                }))
                                .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                            let brushHeight = 50
                            let brush = d3.brushY()
                                .extent([
                                    [parallel_chart.margin.left, -(brushHeight / 2)],
                                    [parallel_chart.width - parallel_chart.margin.right, brushHeight / 2]
                                ])
                                .on("start brush end", console.log(1));


                            // // console.log(date_extent);
                            let paths = parallel_chart.svg
                                .selectAll(".myPath")
                                .data(res)
                                .enter()
                                .append("path")
                                .attr("d", path)
                                .attr('class',d=>'myPath path_'+d.srcPort)
                                .style("fill", "none")
                                .style("stroke", d => d.warning ? '#dd074e' : 'rgba(100,158,221,0.8)')
                                .style("opacity", 0.1)
                                .style('stroke-width', 1)
                                .on('mouseover',function(d) {
                                    d3.select(this).style('stroke-width', 3).style('opacity', 1)
                                })
                                .on('mouseout',function(d) {
                                    d3.select(this).style('stroke-width', 1).style('opacity', .1)
                                })
                                .append('title')
                                .text(d => `${d.SrcIp}:${d.srcPort}->${d.destIp}:${d.destPort}`)
                            //
                            // //
                            // //     // Draw the axis:
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
                                    else if(d === 'SrcIp'){
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
                        })
                    })
            },
            Mini_Test_Chart() {

                let parallel_chart = {}

                parallel_chart.margin = {top: 15, right: 30, bottom: 15, left: 30}

                parallel_chart.width = document.getElementById('mini1').offsetWidth - parallel_chart.margin.left * 2;
                parallel_chart.height = document.getElementById('mini1').offsetHeight - parallel_chart.margin.top -parallel_chart.margin.bottom;

                let that = this;

                parallel_chart.svgs = []

                d3.select('#mini4').style('background','#dd8528')

                for (let i = 0; i<7;i++){
                    parallel_chart.svgs[i] = d3.select('#mini'+(i+1)).append('svg')
                        .attr("viewBox", [0, 0, parallel_chart.width, parallel_chart.height])
                        // .attr('width',parallel_chart.width)
                        // .attr('height',parallel_chart.height)
                        .on('click',function () {
                            d3.selectAll('.parallel_mini').style('background','');
                            d3.select(this.parentElement).style('background','#dd892f');
                            d3.select('#parallel_chart_main').html('')
                            that.Test_Chart(that.mini_mode[i])
                        })
                        .append("g")

                        .on('mouseover',()=>{
                            d3.select('body').style('cursor','pointer')
                        })
                        .on('mouseout',()=>{
                            d3.select('body').style('cursor','')
                        })
                        .attr("transform",
                            "translate(" + parallel_chart.margin.left + "," + (parallel_chart.margin.top+parallel_chart.margin.bottom) + ")");
                }

                let dimensions = ["SrcIp", "srcPort", "dateTime", "destPort", 'destIp']

                let y = {}
                //
                let x = d3.scalePoint()
                    .range([0, parallel_chart.width - parallel_chart.margin.right * 2])
                    .domain(dimensions);
                //
                function path(d) {
                    return d3.line().curve(d3.curveCardinal)(dimensions.map(function (p) {
                        return [x(p), y[p](d[p])];
                    }));
                }
                parallel_chart.title = parallel_chart.svgs.forEach((svg,i)=> {
                    svg.append('text') ///Add title
                        .text(this.mini_mode[i])
                        .attr('class', 'chart_title')
                        .attr('x', -10)
                        .attr('y', -10)

                    let src_g = svg.append('g')
                        .attr('transform', 'translate(-30,0)')

                    let dest_g = svg.append('g')
                        .attr('transform', `translate(${parallel_chart.width - parallel_chart.margin.right - 5},0)`)

                    d3.csv('../../../static/nf_mini_data.csv').then(
                        res1 => {
                            d3.csv('../../../static/mini_data.csv').then(res2 => {
                                res1 = res1.filter(d => d[that.mini_mode[i]] !== "0")
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

                                // console.log(res1.length);
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

                                res1.forEach(d => {
                                    d.warning = res2.find(s => s.SrcIp === d.SrcIp && s.destIp === d.destIp);
                                })

                                let res = res1

                                let ip_data = Array.from(d3.group(res, d => d.SrcIp).values()).map(d => {
                                    return {
                                        ip: d[0].SrcIp,
                                        ip_array: d[0].SrcIp.split('.'),
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

                                let ip_data_dest = Array.from(d3.group(res, d => d.destIp).values()).map(d => {
                                    return {
                                        ip: d[0].destIp,
                                        ip_array: d[0].destIp.split('.'),
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


                                let test_data = {
                                    name: 'root',
                                    children: Array.from(d3.group(ip_data, d => d.ip_array[0]).values()).map(d => {
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
                                let test_data_dest = {
                                    name: 'root',
                                    children: Array.from(d3.group(ip_data_dest, d => d.ip_array[0]).values()).map(d => {
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

                                let partition = data => d3.partition()
                                    .size([parallel_chart.height - parallel_chart.margin.top * 2, 30])
                                    .padding(1)
                                    (d3.hierarchy(data)
                                        .sum(d => d.value))

                                let root = partition(test_data)
                                let root2 = partition(test_data_dest)

                                let color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, test_data.children.length + 1))

                                let cell = src_g.selectAll('g')
                                    .data(root.descendants().filter(d => d.depth !== 0))
                                    .join('g')
                                    .attr("transform", d => `translate(${d.y0},${d.x0})`);

                                cell.append('rect')
                                    .attr("width", d => d.y1 - d.y0)
                                    .attr("height", d => d.x1 - d.x0)
                                    .attr("fill-opacity", 0.6)
                                    .attr("fill", d => {
                                        // console.log(d);
                                        if (!d.depth) return "#ccc";
                                        while (d.depth > 1) d = d.parent;
                                        return color(d.data.name);
                                    });

                                let cell2 = dest_g.selectAll('g')
                                    .data(root2.descendants().filter(d => d.depth !== 0))
                                    .join('g')
                                    .attr("transform", d => `translate(-${d.y0},${d.x0})`);


                                cell2.append('rect')
                                    .attr("width", d => d.y1 - d.y0)
                                    .attr("height", d => d.x1 - d.x0)
                                    .attr("fill-opacity", 0.6)
                                    .attr("fill", d => {
                                        // console.log(d);
                                        if (!d.depth) return "#ccc";
                                        while (d.depth > 1) d = d.parent;
                                        return color(d.data.name);
                                    });

                                y['SrcIp'] = d3.scaleBand()
                                    .domain(ip_data.map(d => d.ip).sort((a, b) => {
                                        let arr1 = a.split('.')
                                        let arr2 = b.split('.')
                                        for (let i = 0; i < 4; i++) {
                                            if (parseInt(arr1[i]) > parseInt(arr2[i])) {
                                                return 1
                                            } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
                                                return -1
                                            }
                                        }
                                    }))
                                    .range([0, parallel_chart.height - parallel_chart.margin.top * 2])

                                y['dateTime'] = d3.scaleTime()
                                    .domain(d3.extent(res, d => d.dateTime))
                                    .range([parallel_chart.height - parallel_chart.margin.top * 2 - 10, 0])

                                y['srcPort'] = d3.scaleSqrt()
                                    .domain(d3.extent(res, d => d.srcPort))
                                    .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                                y['destPort'] = d3.scaleSqrt()
                                    .domain(d3.extent(res, d => d.destPort))
                                    .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                                y['destIp'] = d3.scaleBand()
                                    .domain(ip_data_dest.map(d => d.ip).sort((a, b) => {
                                        let arr1 = a.split('.')
                                        let arr2 = b.split('.')
                                        for (let i = 0; i < 4; i++) {
                                            if (parseInt(arr1[i]) > parseInt(arr2[i])) {
                                                return 1
                                            } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
                                                return -1
                                            }
                                        }
                                    }))
                                    .range([parallel_chart.height - parallel_chart.margin.top * 2, 0])

                                let paths = svg
                                    .selectAll("myPath")
                                    .data(res)
                                    .enter()
                                    .append("path")
                                    .attr("d", path)
                                    .style("fill", "none")
                                    .style("stroke", d => d.warning ? '#dd074e' : 'rgba(100,158,221,0.8)')
                                    .style("opacity", 0.1)
                                    .style('stroke-width', 1)
                            })
                        })
                })


            },
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

  .parallel_mini{
    position: relative;
    float: left;
    width:calc(100%/7);
    /*background-color: #8fefcd;*/
    height: 98%;
    /*margin: 3px;*/
  }
  .chart_title{
    font-size: 20px;
  }
</style>
