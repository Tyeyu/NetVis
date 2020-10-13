<template>
    <div>
        <!-- <div>雷达图</div> -->
        <div id="container"></div>
    </div>
</template>
<script>
import * as d3 from "d3";
export default {
    methods:{
        data(){
            return {
                filename:['语文','数学','外语','物理','化学','生物','政治','历史'],
                value:[10,20,30,40,50,60,70,80]
            }
        },
        initchart:function(){
            let width=document.getElementById("container").clientWidth;
            let height=document.getElementById("container").clientHeight;
            let svg=d3.select("#container")
                    .append("svg").attr("width","100%").attr("height","100%");
            let main=svg.append("g")
                    .classed("main",true)
                    .attr('transform', "translate(" + width/2 + ',' + height/2 + ')');
            // 设定一些方便计算的常量
            var radius = 100,
            // 指标的个数，即fieldNames的长度
            total = 6,
            // 需要将网轴分成几级，即网轴上从小到大有多少个正多边形
            level = 4,
            // 网轴的范围，类似坐标轴
            rangeMin = 0,
            rangeMax = 100,
            arc = 2 * Math.PI;
            // 每项指标所在的角度
            var onePiece = arc/total;
            // 计算网轴的正多边形的坐标
            var polygons = {
                webs: [],
            webPoints: []
            };
            for(var k=level;k>0;k--) {
                var webs = '',
                webPoints = [];
                var r = radius/level * k;
                for(var i=0;i<total;i++) {
                    var x = r * Math.sin(i * onePiece),
                    y = r * Math.cos(i * onePiece);
                    webs += x + ',' + y + ' ';
                    webPoints.push({
                    x: x,
                    y: y
                    });
                }
                polygons.webs.push(webs);
                polygons.webPoints.push(webPoints);
            }
            var webs = main.append('g')
                    .classed('webs', true);
                webs.selectAll('polygon')
                    .data(polygons.webs)
                    .enter()
                    .append('polygon')
                    .attr('points', function(d) {
                            return d;
                    });
        }
    },
    mounted() {
         this.initchart();
    },
}
</script>
<style>
#radar{
    position: absolute;
    top: 25.7%;
    width: 30%;
    height: 35%;
    background-color: #e8e9f0;
    
}
#container{
    width: 100%;
    height: 100%;
}
.webs polygon {
fill: white;
fill-opacity: 0.5;
stroke: gray;
stroke-dasharray: 10 5;
}
</style>
