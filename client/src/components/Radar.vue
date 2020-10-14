<template>
    <div>
        <!-- <div>雷达图</div> -->
        <div id="radarContainer"></div>
    </div>
</template>
<script>
import * as d3 from "d3";
export default {
    data(){
            return {
                filename:['语文','数学','外语','物理','化学','生物','政治','历史'],
                values:[100,70,30,40,50,60,70,80],
                radius :100,
                // 指标的个数，即fieldNames的长度
                total :6,
                // 需要将网轴分成几级，即网轴上从小到大有多少个正多边形
                level :4,
                // 网轴的范围，类似坐标轴
                rangeMin : 0,
                rangeMax :100,
                arc : 2 * Math.PI,
                onePiece :0,
                main:null,
                circles:[[100,70,30,40,50,60,70,80],[10,70,30,40,50,60,70,80],[10,7,50,40,50,60,70,80]]//测试数据
            };
    },
    methods:{
        getColor:function(idx) {
            var palette = [
                '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
                '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
                '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
                '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
                ]
                return palette[idx % palette.length];
        },
        AreaDatas:function(datas){//
            let that=this;
            that.onePiece=that.arc/that.total;
            // 计算雷达图表的坐标
            var areasData = [];
            var values = datas;
                var area = '',
                points = [];
                for(var k=0;k<that.total;k++) {
                    var r = that.radius * (values[k] - that.rangeMin)/(that.rangeMax - that.rangeMin);
                    var x = r * Math.sin(k * that.onePiece),
                        y = r * Math.cos(k * that.onePiece);
                    area += x + ',' + y + ' ';
                    points.push({
                        x: x,
                        y: y
                    })
                }
                areasData.push({
                    polygon: area,
                    points: points
                });
            
            return areasData;
        },
        drawcircle:function(){
            let that=this;
            let points=[];
            for(let i=0;i<that.circles.length;i++){
                var ps=that.AreaDatas(that.circles[i])[0].points;
                let x=0,y=0;
                for(let j=0;j<ps.length;j++){
                    x+=ps[j].x;
                    y+=ps[j].y;
                }
                points.push({x:x,y:y});
            }
            
            var circles = that.main.append("g")
                        .classed('circles', true);
                circles.selectAll('circle')
                .data(points)
                .enter()
                .append('circle')
                .attr('cx', function(d) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                })
                .attr('r', 3)
                .attr('stroke', function(d, index) {
                    return that.getColor(0);
                });
        },
        initchart:function(){
            let that=this;
            let width=document.getElementById("radarContainer").clientWidth;
            let height=document.getElementById("radarContainer").clientHeight;
            let svg=d3.select("#radarContainer")
                    .append("svg").attr("width","100%").attr("height","100%");
            that.main=svg.append("g")
                    .classed("main",true)
                    .attr('transform', "translate(" + width/4 + ',' + height/2 + ')');
           
            // 每项指标所在的角度
            that.onePiece = that.arc/that.total;
            // 计算网轴的正多边形的坐标
            var polygons = {
                webs: [],
            webPoints: []
            };
            for(var k=that.level;k>0;k--) {
                var webs = '',
                webPoints = [];
                var r = that.radius/that.level * k;
                for(var i=0;i<that.total;i++) {
                    var x = r * Math.sin(i *  that.onePiece),
                    y = r * Math.cos(i *  that.onePiece);
                    webs += x + ',' + y + ' ';
                    webPoints.push({
                    x: x,
                    y: y
                    });
                }
                polygons.webs.push(webs);
                polygons.webPoints.push(webPoints);
            }
            var webs = that.main.append('g')
                    .classed('webs', true);
                webs.selectAll('polygon')
                    .data(polygons.webs)
                    .enter()
                    .append('polygon')
                    .attr('points', function(d) {
                            return d;
                    });
            var lines = that.main.append('g')
                            .classed('lines', true);
                lines.selectAll('line')
                    .data(polygons.webPoints[0])
                    .enter()
                    .append('line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', function(d) {
                        return d.x;
                        })
                    .attr('y2', function(d) {
                        return d.y;
                    })
                    // .attr("stroke","gray");
            let areasData=that.AreaDatas(that.values);
            // 添加g分组包含所有雷达图区域
            var areas = that.main.append('g')
                        .classed('areas', true);
            // 添加g分组用来包含一个雷达图区域下的多边形以及圆点
                areas.selectAll('g')
                    .data(areasData)
                    .enter()
                    .append('g')
                    .attr('class',function(d, i) {
                        return 'area' + (i+1);
                    });
            for(var i=0;i<areasData.length;i++) {
                // 依次循环每个雷达图区域
            var area = areas.select('.area' + (i+1)),
            areaData = areasData[i];
            // 绘制雷达图区域下的多边形
            area.append('polygon')
                .attr('points', areaData.polygon)
                .attr('stroke', function(d, index) {
                    return that.getColor(i); })
                .attr('fill', function(d, index) {
                        return that.getColor(i);});
            // 绘制雷达图区域下的点
            // var circles = area.append('g')
            //             .classed('circles', true);
            //     circles.selectAll('circle')
            //     .data(areaData.points)
            //     .enter()
            //     .append('circle')
            //     .attr('cx', function(d) {
            //         return d.x;
            //     })
            //     .attr('cy', function(d) {
            //         return d.y;
            //     })
            //     .attr('r', 3)
            //     .attr('stroke', function(d, index) {
            //         return that.getColor(i);
            //     });
            }
            // 计算文字标签坐标
            var textPoints = [];
            var textRadius = that.radius ;
            for(var i=0;i<that.total;i++) {
            var x = textRadius * Math.sin(i *  that.onePiece),
            y = textRadius * Math.cos(i *  that.onePiece);
                    textPoints.push({
                    x: x,
                    y: y
                    });
            }
            // 绘制文字标签
            var texts = that.main.append('g')
            .classed('texts', true);
            texts.selectAll('text')
            .data(textPoints)
            .enter()
            .append('text')
            .attr('x', function(d) {
                return d.x;
            })
            .attr('y', function(d) {
                return d.y;
            })
            .text(function(d,i) {
                return that.filename[i];
            });
        }
        
    },
    mounted() {
         this.initchart();
         this.drawcircle();
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
#radarContainer{
    width: 100%;
    height: 100%;
}
.lines,.webs polygon {
fill: white;
fill-opacity: 0.5;
stroke: gray;
stroke-dasharray: 10 5;
}
.areas polygon {
fill-opacity: 0.5;
stroke-width: 3;
}
.areas circle {
fill: white;
stroke-width: 3;
}
</style>
