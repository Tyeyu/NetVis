<template> 
    <div id='TimelineContainer'>
        <div id='TimelineTitle'>
            <div id='TimelineContext'> Overview </div>
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
            //get width height
        let self = this;
        let ContainerGraphWidth = $('#TimelineGraph').width(),
            ContainerGraphHeight = $('#TimelineGraph').height(),
            ContainerOverview = d3.select('#TimelineGraph-Overview'),
            ContainerDetails = d3.select('#TimelineGraph-Details'),
            
            ContainerOverviewWidth = $('#TimelineGraph-Overview').width(),
            ContainerOverviewHeight = $('#TimelineGraph-Overview').height(),

            ContainerDetailsWidth = $('#TimelineGraph-Details').width(),
            ContainerDetailsHeight = $('#TimelineGraph-Details').height(),

            ContainerItemsHeight = ContainerOverviewHeight / 9

        let ConOverview = d3.select('#TimelineGraph-Overview').append('svg').attr('width', ContainerOverviewWidth).attr('height', ContainerOverviewHeight),
            ConDetails = d3.select('TimelineGraph-Details').append('svg').attr('width', ContainerDetailsWidth).attr('height', ContainerDetailsHeight)

        let ContainerOverviewBorder = {'top': ContainerOverviewHeight * 0.1, 'bottom': ContainerOverviewHeight * 0.1, 'left': ContainerOverviewWidth * 0.1, 'Width': ContainerOverviewWidth * 0.1},
            ContainerDetailsBorder = {'top': ContainerDetailsHeight * 0.1, 'bottom': ContainerDetailsHeight * 0.1, 'left': ContainerDetailsWidth * 0.1, 'Width': ContainerDetailsWidth * 0.1}
        

        let ScaleXOverview = d3.scaleTime()
            .domain(d3.extent(self.timeline_dic.time, (d) => {return d3.timeParse("%Y-%m-%d %H:%M:%S")(d) }))
            .range([0, ContainerOverviewWidth]),
            ScaleXDetails = d3.scaleTime()

        
        //scaleY
        let linelist = ['status', 'priority', 'cpu_load', 'totalbytes', 'srcip_entropy', 'destip_entropy', 'srcport_entropy', 'destport_entropy']
        let ScaleY = {}
        let ContainerLineEntity = {}

        linelist.forEach((d,i) => {
            ScaleY[d] = {}
            ScaleY[d]['ScaleY'] = {}
            ScaleY[d]['ScaleY']['name'] = d
            ScaleY[d]['ScaleY']['entity'] = d3.scaleLinear().domain([d3.min(self.timeline_dic[d]), d3.max(self.timeline_dic[d])]).range([ContainerItemsHeight, 0])

            ContainerLineEntity[d] = {}
            ContainerLineEntity[d]['container'] = ConOverview.append('g').attr('id', () => {return 'Container-line-' + d}).attr('width', ContainerOverviewWidth).attr('height', ContainerItemsHeight).style('border', '2px solid grey')
        })


        //line container position calculation


        for(let i=0; i<9; i++){
            let order = i;
            if(i == 4) continue;
            if(i < 4){
                order = i;
            } else if (i > 4){
                order = i-1
            }
            let line = d3.line()
                .x((v) => {return ScaleXOverview(d3.timeParse("%Y-%m-%d %H:%M:%S")(v.x))})
                .y((v) => {return ScaleY[linelist[order]]['ScaleY']['entity'](v.y)})
                .curve(d3.curveMonotoneX)

            ContainerLineEntity[linelist[order]]['container'].attr('transform', () => {return "translate(0," +  (order * ContainerItemsHeight ) + ")"})

                //draw bottom axis
            ContainerLineEntity[linelist[order]]['axis'] = ContainerLineEntity[linelist[order]]['container']
                .append('g').attr('transform', () => {return 'translate(0,' + ContainerItemsHeight + ')'}).call(ScaleXOverview)
                
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
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr("d", line)
                .attr('class', () => {return 'ov-line-' + linelist[order]})
        }

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
    height: 67%;
    float: left;
}

#TimelineGraph-Details {
    width: 100%;
    height: 33%;
    float: left;
}


</style>
