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
                destport_entropy: []
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
        ChartInit(data){
            //get container width height
            let self = this;
            let ContainerGraphWidth = $('#TimelineGraph').width(),
                ContainerGraphHeight = $('#TimelineGraph').height(),
                ContainerOverview = d3.select('#TimelineGraph-Overview'),
                ContainerDetails = d3.select('#TimelineGraph-Details'),

                ContainerOverviewWidth = $('#TimelineGraph-Overview').width(),
                ContainerOverviewHeight = $('#TimelineGraph-Overview').height(),

                ContainerDetailsWidth = $('#TimelineGraph-Details').width(),
                ContainerDetailsHeight = $('#TimelineGraph-Details').height()
        
            let ContainerOverviewMargin = {'top': ContainerOverviewHeight * 0.05, 'bottom': ContainerOverviewHeight * 0.05, 'left': ContainerOverviewWidth * 0.05, 'right': ContainerOverviewWidth * 0.05},
                ContainerDetailsMargin = {'top': ContainerDetailsHeight * 0.05, 'bottom': ContainerDetailsHeight * 0.05, 'left': ContainerDetailsWidth * 0.05, 'right': ContainerDetailsWidth * 0.05}
            
            //line container space number / line container high
            let ContainerSpace = 10,
                ContainerItemsHeight = (ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom) / ContainerSpace

            //svg container border
            let ConOverview = d3.select('#TimelineGraph-Overview').append('svg')
                .attr('width', ContainerOverviewWidth - ContainerOverviewMargin.right)
                .attr('height', ContainerOverviewHeight - ContainerOverviewMargin.top - ContainerOverviewMargin.bottom)
                .attr('transform', () => {return 'translate(0' + ',' + ContainerOverviewMargin.top + ')'})
                .style('float', 'left'),
                ConDetails = d3.select('TimelineGraph-Details').append('svg')
                .attr('width', ContainerDetailsWidth - ContainerDetailsMargin.right)
                .attr('height', ContainerDetailsHeight - ContainerDetailsMargin.top - ContainerDetailsMargin.bottom)
                .attr('transform', () => {return 'translate(0' + ',' + ContainerDetailsMargin.top + ')'})
                .style('float', 'left')

            //ScaleX universal
            let ScaleXOverview = d3.scaleTime()
                .domain(d3.extent(self.timeline_dic.time, (d) => {return d3.timeParse("%Y-%m-%d %H:%M:%S")(d)}))
                .range([0, ContainerOverviewWidth - ContainerOverviewMargin.left - ContainerOverviewMargin.right]),
                ScaleXDetails = d3.scaleTime()

            // ScaleY customization & line container customization
            let linelist = ['status', 'priority', 'cpu_load', 'totalbytes', 'srcip_entropy', 'destip_entropy', 'srcport_entropy', 'destport_entropy'],
                listDict = {
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
                ScaleY = {},
                ContainerLineEntity = {}

            linelist.forEach((d,i) => {
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
                    .y((v) => {return ScaleY[linelist[order]]['ScaleY']['entity'](v.y)})
                    .curve(d3.curveMonotoneX)
                // line container position
                ContainerLineEntity[linelist[order]]['container'].attr('transform', () => {return "translate(" + ContainerOverviewMargin.left +"," +  (i * ContainerItemsHeight ) + ")"})
                //draw AxisX
                ContainerLineEntity[linelist[order]]['axis'] = ContainerLineEntity[linelist[order]]['container']
                    .append('g').attr('transform', () => {return "translate(0" +"," + ContainerItemsHeight + ')'}).call(AxisXtemp)
                //draw line
                ContainerLineEntity[linelist[order]]['line'] = ContainerLineEntity[linelist[order]]['container']
                    .append('path')
                    .datum(() => {
                        let data = [],
                            key = linelist[order]
                        self.timeline_datalist.forEach((d) => {
                            data.push({'x': d['time'], 'y': d[key]})
                        })
                        return data
                    })
                    .attr('type', linelist[order])
                    .attr('fill', 'none')
                    .attr('stroke', () => {
                        return listDict[linelist[order]]['Color']
                    })
                    .attr('stroke-width', 1.5)
                    .attr("d", line)
                    .attr('class', () => {return 'ov-line-' + linelist[order]})

                 ContainerLineEntity[linelist[order]]['text'] = ContainerLineEntity[linelist[order]]['container']
                 .append('text')
                 .text(() => {
                     return listDict[linelist[order]]['Title']
                 })
                 .style('fill', '#515a6e')
                 .attr('transform', () => {return "translate(" + (-(ContainerOverviewMargin.left / 1.5)) + ',' + (ContainerItemsHeight) + ')'})
            }

            //not display axis line
            d3.select('#TimelineGraph-Overview').selectAll('.domain').style('opacity', 0)



        //draw bottom axis
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

                self.timeline_datalist = data;
                self.ChartInit(data)
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
    height:15%;
    float: left;
}

#TimelineGraph {
    width: 100%;
    height: 85%;
    float: left;
}

#TimelineGraph-Overview {
    width: 100%;
    height: 80%;
    float: left;
}

#TimelineGraph-Details {
    width: 100%;
    height: 20%;
    float: left;
}

#TimelineContext {
    color: #555;
    font-size: 18px;

}
</style>
