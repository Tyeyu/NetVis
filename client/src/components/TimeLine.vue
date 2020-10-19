<template>
    <div id='TimelineContainer'>
        <div id='TimelineTitle'>
            <div id='TimelineContext'>Event Timeline </div>
        </div>
        <div id='TimelineGraph'>
            <div id='TimelineGraph-Overview'></div>
            <div id='TimelineGraph-Details'></div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Timeline',
    data() {
        return {
            TimelineContainer: null,
            DetailsContainer: null,
            timeline_datalist: null,
            timeline_dic: {
                time: [],
                totalbytes: [],
                cpu_load: [],
                priority: [],
                status: [],
                NCon: [],
                NVol: [],
                srcip_entropy: [],
                destip_entropy: [],
                srcport_entropy: [],
                destport_entropy: [],
            },
            startTime: null,
            endTime: null,
            linelist: ['status', 'priority', 'cpu_load', 'totalbytes', 'srcip_entropy', 'destip_entropy', 'srcport_entropy', 'destport_entropy'],
            listDict:{
                'status': {
                    'Title': 'Status',
                    'Color': '#747d8c',
                }, 
                'priority': {
                    'Title': 'Priority',
                    'Color': '#747d8c',
                },
                'cpu_load': {
                    'Title': 'Cpu Load',
                    'Color': '#747d8c'
                },
                'totalbytes': {
                    'Title': 'Total Bytes',
                    'Color': '#747d8c'
                },
                'srcip_entropy': {
                    'Title': 'Srcip',
                    'Color': '#1e90ff'
                },
                'destip_entropy': {
                    'Title': 'Destip',
                    'Color': '#70a1ff'
                },
                'srcport_entropy': {
                    'Title': 'Srcport',
                    'Color': '#2ed573'
                },
                'destport_entropy': {
                    'Title': 'Destport',
                    'Color': '#7bed9f'
                }
            },
            ScaleYOverview: []
        }
    },
    mounted(){
        let self = this
        self.fnResize()
        self.DataInit()
    },
    methods:{
        ChartOverviewInit(data){
            //get container width height
            let self = this;
            let ContainerGraphWidth = $('#TimelineGraph').width(),
                ContainerGraphHeight = $('#TimelineGraph').height(),

                ContainerOverviewWidth = $('#TimelineGraph-Overview').width(),
                ContainerOverviewHeight = $('#TimelineGraph-Overview').height()
        
            let ContainerOverviewMargin = {'top': ContainerOverviewHeight * 0.05, 'bottom': ContainerOverviewHeight * 0.05, 'left': ContainerOverviewWidth * 0.05, 'right': ContainerOverviewWidth * 0.05}
            
            //line container space number / line container high
            let ContainerSpace = 10,
                ContainerItemsHeight = (ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom) / ContainerSpace

            //svg container border
            let ConOverview = d3.select('#TimelineGraph-Overview').append('svg')
                .attr('width', ContainerOverviewWidth)
                .attr('height', ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom)
                .attr('transform', () => {return 'translate(0' + ',' + ContainerOverviewMargin.top + ')'})
                .style('float', 'left')

            //ScaleX universal
            let ScaleXOverview = d3.scaleTime()
                .domain(d3.extent(self.timeline_dic.time, (d,i) => {return d3.timeParse("%Y-%m-%d %H:%M:%S")(d)}))
                .range([0, ContainerOverviewWidth - ContainerOverviewMargin.left - ContainerOverviewMargin.right]),
                ScaleXDetails = d3.scaleTime()

            // ScaleY customization & line container customization
            let ScaleY = {},
                ContainerLineEntity = {}
            
            self.linelist.forEach((d,i) => {
                ScaleY[d] = {}
                ScaleY[d]['ScaleY'] = {}
                ScaleY[d]['ScaleY']['name'] = d
                ScaleY[d]['ScaleY']['entity'] = d3.scaleLinear().domain([d3.min(self.timeline_dic[d]), d3.max(self.timeline_dic[d])]).range([ContainerItemsHeight, 0])

                ContainerLineEntity[d] = {}
                ContainerLineEntity[d]['container'] = ConOverview.append('g').attr('id', () => {return 'Container-line-' + d})
                    .attr('width', ContainerOverviewWidth - ContainerOverviewMargin.right)
                    .attr('height', ContainerItemsHeight)
                    .style('border', '2px solid grey')
            })

            //line container position calculation
            let gap = Math.floor((ContainerSpace - 2) / 2)
            for(let i=0; i<ContainerSpace; i++){
                let order = i,
                    AxisXtemp = null;
                //gap mid space
                if(order == gap){
                    continue;
                } else if (i < gap){
                    order = i;
                } else if (i > gap){
                    order = i-1
                }
                if (i == ContainerSpace - 1) {
                    continue;
                }

                // final AxisX has ticks
                if(i == ContainerSpace - 2){
                    AxisXtemp = d3.axisBottom(ScaleXOverview)
                } else {
                    AxisXtemp = d3.axisBottom(ScaleXOverview).tickFormat(() => {return ''})
                }

                // line generator
                let line = d3.line()
                    .x((v) => {return ScaleXOverview(d3.timeParse("%Y-%m-%d %H:%M:%S")(v.x))})
                    .y((v) => {return ScaleY[self.linelist[order]]['ScaleY']['entity'](v.y)})
                    .curve(d3.curveMonotoneX)
                // line container position
                ContainerLineEntity[self.linelist[order]]['container'].attr('transform', () => {return "translate(" + ContainerOverviewMargin.left +"," +  (i * ContainerItemsHeight ) + ")"})
                //draw AxisX
                ContainerLineEntity[self.linelist[order]]['axis'] = ContainerLineEntity[self.linelist[order]]['container']
                    .append('g').attr('transform', () => {return "translate(0" +"," + ContainerItemsHeight + ')'}).call(AxisXtemp)
                //draw line
                ContainerLineEntity[self.linelist[order]]['line'] = ContainerLineEntity[self.linelist[order]]['container']
                    .append('path')
                    .datum(() => {
                        let data = [],
                            key = self.linelist[order]
                        self.timeline_datalist.forEach((d) => {
                            data.push({'x': d['time'], 'y': d[key]})
                        })
                        return data
                    })
                    .attr('type', self.linelist[order])
                    .attr('fill', 'none')
                    .attr('stroke', () => {
                        return self.listDict[self.linelist[order]]['Color']
                    })
                    .attr('stroke-width', 1.5)
                    .attr("d", line)
                    .attr('class', () => {return 'ov-line-' + self.linelist[order]})

                 ContainerLineEntity[self.linelist[order]]['text'] = ContainerLineEntity[self.linelist[order]]['container']
                 .append('text')
                 .text(() => {
                     return self.listDict[self.linelist[order]]['Title']
                 })
                 .style('fill', '#515a6e')
                 .style('font-size', 11)
                 .attr('transform', () => {return "translate(" + (-(ContainerOverviewMargin.left / 1.5)) + ',' + (ContainerItemsHeight) + ')'})
            }

            //not display axis line
            d3.select('#TimelineGraph-Overview').selectAll('.domain').style('opacity', 0)

            //Add text
            let ConOverviewTextOverview = ConOverview.append('g').attr('id', 'ConOverviewTextOverview')
                .attr('transform', 'translate(' + ( ContainerOverviewWidth - ContainerOverviewMargin.left + (ContainerOverviewMargin.right / 3) )  + ',' + (ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom) / 5 * 1.5 + ')')
                .append('text').text('Overview')
                .style('font-size', 12)
                .style('fill', '#515a6e')
                .style('font-weight', 900)

            let ConOverviewTextEntropy = ConOverview.append('g').attr('id', 'ConOverviewTextEntropy')
                .attr('transform', 'translate(' + ( ContainerOverviewWidth - ContainerOverviewMargin.left + (ContainerOverviewMargin.right / 3) )  + ',' + (ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom) / 5 * 4 + ')')
                .append('text').text('Entropy')
                .style('font-size', 12)
                .style('fill', '#515a6e')
                .style('font-weight', 900)

            
            //Add beauty bar
            let ConOverviewBars = ConOverview.append('g').attr('id', 'ConOverviewBars')
                .attr('transform', () => {
                    return 'translate(' + (ContainerOverviewWidth - ContainerOverviewMargin.left + (ContainerOverviewMargin.right / 5)) + ',' +  ContainerOverviewMargin.top + ')'
                })
                .append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 5)
                .attr('height', () => {return ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom})
                .style('fill', 'grey')

            let ConOverviewCoverBars = ConOverview.append('g').attr('id', 'ConOverviewCoverBars')
                .attr('transform', () => {
                    return 'translate(' + (ContainerOverviewWidth - ContainerOverviewMargin.left + (ContainerOverviewMargin.right / 5)) + ',' + (ContainerOverviewMargin.top + ContainerItemsHeight * gap) + ')'})
                .append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 5)
                .attr('height', () => {return ContainerItemsHeight})
                .style('fill', 'white')

            

            this.ChartDetailInit({start: "2013-04-15 01:00:00", end: "2013-04-15 02:00:00"})
            


        //draw bottom axis
        },
        ChartDetailInit(TimePeriod){
            // data start time: "2013-04-10 07:05:00" 
            // data end time: "2013-04-15 10:00:00"
            // timesegment {'start': 2013-04-15 01:00:00, 'end': 2013-04-15 02:00:00}
            let self = this;

            //get container width height margin
            let ContainerOverview = d3.select('#TimelineGraph-Overview'),
                ContainerDetails = d3.select('#TimelineGraph-Details'),
                ContainerDetailsWidth = $('#TimelineGraph-Details').width(),
                ContainerDetailsHeight = $('#TimelineGraph-Details').height()

            let ContainerDetailsMargin = {'top': ContainerDetailsHeight * 0.05, 'bottom': ContainerDetailsHeight * 0.25, 'left': ContainerDetailsWidth * 0.05, 'right': ContainerDetailsWidth * 0.05}

            //svg container border
            let ConDetails = d3.select('#TimelineGraph-Details').append('svg')
                .attr('width', ContainerDetailsWidth)
                .attr('height', ContainerDetailsHeight - ContainerDetailsMargin.top)
                .attr('transform', () => {return 'translate(0' + ',' + ContainerDetailsMargin.top + ')'})
                .style('float', 'left')

            //CALCULATION
            //startIndex endIndex store source time index
            let startIndex = Math.abs(new Date(TimePeriod.start) - new Date(self.startTime)) / 300000,
                endIndex = Math.abs(new Date(TimePeriod.end) - new Date(self.startTime)) / 300000,
                linedata = []
            
            for(let i=startIndex; i<=endIndex; i++){
                linedata.push(self.timeline_datalist[i])
            }

            //ScaleX universal
            let ScaleXDetails = d3.scaleTime()
                .domain(d3.extent(self.timeline_dic.time, (d,i) => {if(startIndex <= i && i <= endIndex){return d3.timeParse("%Y-%m-%d %H:%M:%S")(d)}}))
                .range([0, ContainerDetailsWidth - ContainerDetailsMargin.left - ContainerDetailsMargin.right])

            // ScaleY customization & line container customization
            let ScaleYDetails = null,
                linelist = ['srcip_entropy', 'destip_entropy', 'srcport_entropy', 'destport_entropy'],
                linelistmax = 0,
                linelistmin = 0
            
            linelist.forEach((d,i) => {
                let max = Math.max.apply(Math, self.timeline_datalist.map(function(o) {return o[d]})),
                    min = Math.min.apply(Math, self.timeline_datalist.map(function(o) {return o[d]}))
                if(max > linelistmax){
                    linelistmax = max
                }
                if(min < linelistmin){
                    linelistmin = min
                }
            })

            ScaleYDetails = d3.scaleLinear().domain([linelistmin, linelistmax]).range([ContainerDetailsHeight - ContainerDetailsMargin.top - ContainerDetailsMargin.bottom, 0])

            //Add line
            let ContainerLineEntity = {},
                ConDetailsLines = ConDetails.append('g')
                    .attr('id', 'ConDetailsLines')
                    .attr('transform', 'translate(' + ContainerDetailsMargin.left + ',0)'),
                Linegenerator = d3.line()
                    .x((v) => {return ScaleXDetails(d3.timeParse("%Y-%m-%d %H:%M:%S")(v.x))})
                    .y((v) => {return ScaleYDetails(v.y)})
                    .curve(d3.curveMonotoneX)

            linelist.forEach((d,i) => {
                let drawdata = []
                linedata.forEach((v,i) => {
                    drawdata.push({'x': v['time'], 'y': v[d]})
                })
                ContainerLineEntity[d] = {}
                ContainerLineEntity[d]['line'] = ConDetailsLines.append('path')
                    .datum(drawdata)
                    .attr('d', Linegenerator)
                    .attr('fill', 'none')
                    .attr('stroke-width', 1.5)
                    .attr('stroke', self.listDict[d]['Color'])
            })
            //Add Axis
            let ConDetailsAxis = ConDetails.append('g').attr('id', 'ConDetailsAxis')
                .attr('transform', () => {return "translate(" + ContainerDetailsMargin.left +"," + (ContainerDetailsHeight - ContainerDetailsMargin.top - ContainerDetailsMargin.bottom) + ')'})
                .call(d3.axisBottom(ScaleXDetails))

            //Add text
            let ConDetailsText = ConDetails.append('g').attr('id', 'ConDetailsText')
                .attr('transform', 'translate(' + ( ContainerDetailsWidth - ContainerDetailsMargin.left + (ContainerDetailsMargin.right / 3) )  + ',' + ContainerDetailsHeight / 2 + ')')
                .append('text').text('Details')
                .style('font-size', 12)
                .style('fill', '#515a6e')
                .style('font-weight', 900)
            //Add beauty bar
            let ConDetailsBars = ConDetails.append('g')
                .attr('transform', 'translate(' + ( ContainerDetailsWidth - ContainerDetailsMargin.left + (ContainerDetailsMargin.right / 5) )  + ',' + ContainerDetailsMargin.top + ')')
                .append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 5)
                .attr('height', () => {return ContainerDetailsHeight - ContainerDetailsMargin.top - ContainerDetailsMargin.bottom})
                .style('fill', 'grey')
                
            

            
        },
        DataInit(){
            let self = this;

            d3.csv('static/timeline.csv', (d) => {
                //totalbytes,cpu_load,priority,status,NCon,NVol,srcip_entropy,destip_entropy,srcport_entropy,destport_entropy
                let keys = Object.keys(d),
                    val = Object.values(d),
                    obj = {}
                keys.forEach((v, j) => {
                    if(v == 'time'){
                        let date = d3.timeParse("%Y-%m-%d %H:%m:%s")(val[j])
                        self.timeline_dic[v].push(val[j]);
                        obj[v] = val[j]
                    } else {
                        //console.log(self.radar[v], val[j])
                        self.timeline_dic[v].push(+val[j]);
                        obj[v] = +val[j]
                    }
                })
                return obj
            }).then((data) => {
                self.startTime = data[0].time;
                self.endTime = data[data.length - 1].time;
                self.timeline_datalist = data;
                self.ChartOverviewInit(data)
            })
        },
        fnResize(){

        }
    }
};
</script>
<style>
#TimelineContainer {
    width: 100%;
    height: 25%;
    border: 2px solid grey;
}

#TimelineTitle{
    width: 100%;
    height: 5%;
    float: left;
}

#TimelineGraph {
    width: 100%;
    height: 95%;
    float: left;
}

#TimelineGraph-Overview {
    width: 100%;
    height: 70%;
    float: left;
}

#TimelineGraph-Details {
    width: 100%;
    height: 30%;
    float: left;
}

#TimelineContext {
    color: #555;
    font-size: 18px;

}
</style>
