<template>
    <div id='TimelineContainer'>
        <div id='TimelineTitle'>
            <div id='TimelineContext'>Event Timeline </div>
            <div id="TimeLabel"> Time Range: </div>
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
            //duration
            d3.select('#TimelineGraph-Overview').style('opacity', 1).transition(300).style('opacity', 0)
            d3.select('#TimelineGraph-Overview').html('')
            d3.select('#TimelineGraph-Overview').style('opacity', 0).transition(300).style('opacity', 1)
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

            //Init time table
            /*
            d3.select('#TimeLabel')
            .style('position', 'absolute')
            .style('transform', () => {
                return 'translate(' + (ContainerOverviewWidth * 0.8) + ',' + (-(ContainerOverviewMargin.top * 0.85)) + ')'
            })
            d3.select('#TimeLabel').style('opacity', 0).transition(300).style('opacity', 1)
            */
            
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

            // ScaleY customization & brushed & line container customization
            let ScaleY = {},
                ContainerLineEntity = {},
                brushX = d3.brushX().extent([[0,0],[ContainerOverviewWidth - ContainerOverviewMargin.left - ContainerOverviewMargin.right, ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom]])
                    .on("end", brushended),
                ConOverviewAllLine = ConOverview.append('g')
                    .attr('height', ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom)
                    .attr('width', () => { return ContainerOverviewWidth - ContainerOverviewMargin.left - ContainerOverviewMargin.right})
                    .attr('transform', () => {return 'translate('+ ContainerOverviewMargin.left + ',0)'})
                    .attr('id', 'ConOverviewAllLine')
                    .call(brushX)
            
            function brushended(event) {
                const selection = event.selection;
                if (!event.sourceEvent || !selection) return;
                let [x0, x1] = selection.map(d => ScaleXOverview(DateConvert5Min(ScaleXOverview.invert(d))))
                d3.select(this).transition().call(brushX.move, [x0, x1]);
                
                self.ChartDetailInit({start: new Date(DateConvert5Min(ScaleXOverview.invert(selection[0]))), end: new Date(DateConvert5Min(ScaleXOverview.invert(selection[1])))})
            }

            function DateConvert5Min(date){
                return Math.floor(date.getTime() / 300000) * 300000
            }

            // Add selected time
            let ConOverviewSelectTime = ConOverview.append('g')
                .attr('id', 'ConOverviewSelectTime')
                .attr('transform', 'translate(1000,0)')
                .append('text')
                .text('111')
                .attr('id', 'ConOverviewSelectTimeText')
                .style('font-size', 12)
                .style('fill', '#515a6e')
                .style('font-weight', 900)
                
            
            self.linelist.forEach((d,i) => {
                ScaleY[d] = {}
                ScaleY[d]['ScaleY'] = {}
                ScaleY[d]['ScaleY']['name'] = d
                ScaleY[d]['ScaleY']['entity'] = d3.scaleLinear().domain([d3.min(self.timeline_dic[d]), d3.max(self.timeline_dic[d])]).range([ContainerItemsHeight, 0])

                ContainerLineEntity[d] = {}
                ContainerLineEntity[d]['container'] = ConOverview.append('g').attr('id', () => {return 'Container-line-' + d})
                    .attr('width', ContainerOverviewWidth - ContainerOverviewMargin.left - ContainerOverviewMargin.right)
                    .attr('height', ContainerItemsHeight)
                    .style('border', '2px solid grey')
            })

            //line container position calculation
            let gap = Math.floor((ContainerSpace - 2) / 2),
                ConOverviewLineTitle = ConOverview.append('g').attr('id', 'ConOverviewLineTitle')
                    .attr('transform', 'translate(0,' + ContainerOverviewMargin.top + ')')
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

                 ContainerLineEntity[self.linelist[order]]['title'] = ConOverviewLineTitle.append('g')
                    .attr('transform', () => {return "translate(" + ((ContainerOverviewMargin.left / 5)) + ',' + ((i * ContainerItemsHeight) + ContainerOverviewMargin.top) + ')'})
                
                ContainerLineEntity[self.linelist[order]]['title']
                 .append('rect')
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('width', 6)
                 .attr('height', 6)
                 .style('fill', () => {
                     return self.listDict[self.linelist[order]]['Color']
                 })
                 .attr('transform', () => {return "translate(0," + (-(ContainerOverviewMargin.top / 1.66)) +')'})
                
                 ContainerLineEntity[self.linelist[order]]['title']
                 .append('text')
                 .text(() => {
                     return self.listDict[self.linelist[order]]['Title']
                 })
                 .style('fill', '#515a6e')
                 .style('font-size', 11)
                 .attr('transform', () => {return "translate(" + ((ContainerOverviewMargin.left / 5)) + ',0)'})
                 
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
            // clear container
            d3.select('#TimelineGraph-Details').style('opacity', 1).transition(300).style('opacity', 0)
            d3.select('#TimelineGraph-Details').html('')
            d3.select('#TimelineGraph-Details').style('opacity', 0).transition(300).style('opacity', 1)
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

            //svg drag
            let brushX = d3.brushX().extent([[0,0],[ContainerDetailsWidth - ContainerDetailsMargin.left - ContainerDetailsMargin.right, ContainerDetailsHeight - ContainerDetailsMargin.top - ContainerDetailsMargin.bottom]])
                    .on("end", brushended),
                ConDetailsAllLine = ConDetails.append('g')
                    .attr('height', ContainerDetailsHeight - ContainerDetailsMargin.top - ContainerDetailsMargin.bottom)
                    .attr('width', () => { return ContainerDetailsWidth - ContainerDetailsMargin.left - ContainerDetailsMargin.right})
                    .attr('transform', () => {return 'translate('+ ContainerDetailsMargin.left + ',0)'})
                    .attr('id', 'ConDetailsAllLine')
                    .call(brushX)

            function DateConvert5Min(date){
                return Math.floor(date.getTime() / 300000) * 300000
            }
            
            function brushended(event) {
                const selection = event.selection;
                if (!event.sourceEvent || !selection) return;
                let [x0, x1] = selection.map(d => ScaleXDetails(DateConvert5Min(ScaleXDetails.invert(d))))
                d3.select(this).transition().call(brushX.move, [x0, x1]);
                let t0 = new Date(DateConvert5Min(ScaleXDetails.invert(selection[0]))).format("yyyy-MM-dd hh:mm:ss"),
                    t1 = new Date(DateConvert5Min(ScaleXDetails.invert(selection[1]))).format("yyyy-MM-dd hh:mm:ss")
                self.$store.commit('setSelectTime', [t0, t1])
                //self.ChartDetailInit({start: new Date(DateConvert5Min(ScaleXDetails.invert(selection[0]))), end: new Date(DateConvert5Min(ScaleXDetails.invert(selection[1])))})
            }

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
        updateTimeLaebl(time){
            let text = 'Time Range: ' + time.starttime + ' - ' + time.endtime
            d3.select('#TimeLabel').style('opacity', 1).transition(300).style('opacity', 0)
            d3.select('#TimeLabel').html(text).style('opacity', 0).transition(300).style('opacity', 1)
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
#TimeLabel{
    position: absolute;
    opacity: 0;
}
</style>
