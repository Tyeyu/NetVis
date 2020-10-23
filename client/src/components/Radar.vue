<template>
    <div>
        <!-- <div>雷达图</div> -->
        <div id="radarcontainer"></div>
    </div>
</template>
<script>
import * as d3 from "d3";
import Readcsv from "../ToolJs/Readcsv"
export default {
    data(){
            return {
                filename:['NCon (The Number of Connections)','NVol (Network Traffic Volume)','EntropySIP','EntropyDIP','EntropySPort','EntropyDPort'],
                color:["#27823B","#2857A8","#1E90FF","#70A1FF","#2ED573","#7BED9F"],
                barcolor:["#38CCCB","#EED11A"],
                values:[],
                radius :80,
                // 指标的个数，即fieldNames的长度
                total :6,
                // 需要将网轴分成几级，即网轴上从小到大有多少个正多边形
                level :1,
                // 网轴的范围，类似坐标轴
                rangeMin : 0,
                rangeMax :80,
                arc : 2 * Math.PI,
                onePiece :0,
                main:null,
                areas:null,
                 
                srcipScale:null,
                destipScale:null,
                srcportScale:null,
                destportScale:null,
                NConScale:null,
                NVolScale:null,
                drawcircledata:[],
                allcircledata:[],
                circles:[],//测试数据,
                allbardata:[],
                barscale:null,
                svgs:null
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
            d3.select('.circles').remove();
            let that=this;
            let points=[];
            for(let i=0;i<that.circles.length;i++){
                
                var ps=that.AreaDatas(that.circles[i])[0].points;
                // console.log(ps)
                let x=0,y=0;
                for(let j=0;j<ps.length;j++){
                    x+=ps[j].x;
                    y+=ps[j].y;
                }
               
                if(Math.abs(x)>that.radius)
                  x=x/Math.abs(x)*that.radius
                if(Math.abs(y)>that.radius)
                  y=y/Math.abs(y)*that.radius
                if(Math.sqrt(x*x+y*y)>that.radius)
                    points.push({x:x*4/5,y:y*4/5});
                else{
                     points.push({x:x,y:y});
                }
            }
            // console.log(that.radius)
            // console.log(points)
            var circles = that.main.append("g")
                        .classed('circles', true);
                circles.selectAll('circle')
                .data(points)
                .enter()
                .append('circle')
                .attr("index",function(d,i){
                    return i;
                })
                .attr('cx', function(d,i) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                })
                .on("mousemove",function(e,d){
                    let index=d3.select(this).attr("index")
                    that.drawradar(that.circles[index])
                    // console.log(that.drawcircledata[index])
                    // console.log()
                })
                .on("mouseout",function(e,d){
                    // console.log(d);
                    d3.selectAll(".area1").remove();
                })
                .on("click",function(e,d){
                    let index=d3.select(this).attr("index")
                    // console.log(that.drawcircledata[index].time)
                    that.$store.commit("setradarTime",that.drawcircledata[index].time)
                })
                .attr('r', 3)
                .attr('stroke', function(d, index) {
                    return that.getColor(0);
                })
                .append('title')
                .classed("tooltip",true)
                .text(function(d,i){
                    //NCon,NVol,srcip,destip,srcport,destport
                    //'NCon ','NVol (Network Traffic Volume)','EntropySIP','EntropyDIP','EntropySPort','EntropyDPort'
                    return "NCon:"+that.drawcircledata[i].NCon+"\n"
                            +"NVol:"+that.drawcircledata[i].NVol+"\n"
                            +"EntropySIP:"+that.drawcircledata[i].srcip+"\n"
                            +"EntropyDIP:"+that.drawcircledata[i].destip+"\n"
                            +"EntropySPort:"+that.drawcircledata[i].srcport+"\n"
                            +"EntropyDPort:"+that.drawcircledata[i].destport;
                       
                });
        },
        drawradar:function(data){
            let that=this;
            let areasData=that.AreaDatas(data);
            // 添加g分组用来包含一个雷达图区域下的多边形以及圆点
                that.areas.selectAll('g')
                    .data(areasData)
                    .enter()
                    .append('g')
                    .attr('class',function(d, i) {
                        return 'area' + (i+1);
                    });
            for(var i=0;i<areasData.length;i++) {
                // 依次循环每个雷达图区域
            var area = that.areas.select('.area' + (i+1)),
            areaData = areasData[i];
            // 绘制雷达图区域下的多边形
            area.append('polygon')
                .attr('points', areaData.polygon)
                .attr('stroke', function(d, index) {
                    return that.getColor(i); })
                .attr('fill', function(d, index) {
                        return that.getColor(i);});
                        }
        },
        initchart:function(){
            let that=this;
            let width=document.getElementById("radarcontainer").offsetWidth;
            let height=document.getElementById("radarcontainer").offsetHeight;
            let svg=d3.select("#radarcontainer")
                    .append("svg").attr("width","100%").attr("height","100%");
            this.svgs=svg;
            that.main=svg.append("g")
                    .classed("main",true)
                    .attr('transform', "translate(" + width/2.5 + ',' + height/2 + ')');
            that.radius=height/2-height/8;
            that.rangeMax=height/2-height/8;
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
                var r = k*(that.radius+20)/that.level ;
                // console.log(r);
                for(var i=0;i<that.total;i++) {
                    var x = r * Math.sin(i *  that.onePiece),
                    y = r * Math.cos(i *  that.onePiece);
                    webs += x + ',' + y + ' ';
                    webPoints.push({
                    x: x,
                    y: y
                    });
                }
                // console.log(webPoints)
                polygons.webs.push(webs);
                polygons.webPoints.push(webPoints);
            }
            // var webs = that.main.append('g')
            //         .classed('webs', true);
            //     webs.selectAll('polygon')
            //         .data(polygons.webs)
            //         .enter()
            //         .append('polygon')
            //         .attr('points', function(d) {
            //                 return d;
            //         });
            //绘制圆形边框
            that.main.append("g")
            .append("circle")
            .attr("cx",0)
            .attr("cy",0)
            .attr("r",(that.radius+20))
            .attr("fill","white")
            // .attr("opacity",0)
            .attr("z-index",-1)
            .attr("stroke","gray")
            .attr("stroke-width",0.1)

            //绘制半径
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
                    .attr("stroke",function(d,i){
                        return that.color[i];
                    })
                    .attr("stroke-width",3);
            
            // 添加g分组包含所有雷达图区域
            that.areas = that.main.append('g')
                        .classed('areas', true);
            
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
            // var texts = that.main.append('g')
            // .classed('texts', true);
            // texts.selectAll('text')
            // .data(textPoints)
            // .enter()
            // .append('text')
            // .attr('x', function(d) {
            //     return d.x;
            // })
            // .attr('y', function(d) {
            //     return d.y;
            // })
            // .text(function(d,i) {
            //     return that.filename[i];
            // })
            // .attr("font-size",8);
        },
      
        sipScale:function(){
            let Scales=d3.scaleLinear()
                    .domain([d3.min(this.allcircledata, function(d) {
                                return parseFloat(d.srcip);
                    }),
                    d3.max(this.allcircledata, function(d) {
                                    return parseFloat(d.srcip);
                    })]).range([this.rangeMin, this.rangeMax])
            return Scales;
        },
        dipSclse:function(){
            let Scales=d3.scaleLinear()
                    .domain([d3.min(this.allcircledata, function(d) {
                                return parseFloat(d.destip);
                    }),
                    d3.max(this.allcircledata, function(d) {
                                    return parseFloat(d.destip);
                    })]).range([this.rangeMin, this.rangeMax])
            return Scales;
         },
        sportScale:function(){
             let Scales=d3.scaleLinear()
                    .domain([d3.min(this.allcircledata, function(d) {
                                return parseFloat(d.srcport);
                    }),
                    d3.max(this.allcircledata, function(d) {
                                    return parseFloat(d.srcport);
                    })]).range([this.rangeMin, this.rangeMax])
            return Scales;
        },
        dportScale:function(){
             let Scales=d3.scaleLinear()
                    .domain([d3.min(this.allcircledata, function(d) {
                                return parseFloat(d.destport);
                    }),
                    d3.max(this.allcircledata, function(d) {
                                    return parseFloat(d.destport);
                    })]).range([this.rangeMin, this.rangeMax])
            return Scales;
        },
        NCScale:function(){
            let Scales=d3.scaleLinear()
                    .domain([d3.min(this.allcircledata, function(d) {
                                return parseFloat(d.NCon);
                    }),
                    d3.max(this.allcircledata, function(d) {
                                    return parseFloat(d.NCon);
                    })]).range([this.rangeMin, this.rangeMax])
            return Scales;
        },
        NVScale:function(){
            let Scales=d3.scaleLinear()
                    .domain([d3.min(this.allcircledata, function(d) {
                                return parseFloat(d.NVol);
                    }),
                    d3.max(this.allcircledata, function(d) {
                                    return parseFloat(d.NVol);
                    })]).range([this.rangeMin, this.rangeMax])
            return Scales;
        },
        BScale:function(data){
            
             let Scales=d3.scaleLinear()
                    .domain([0,
                    d3.max(data, function(d) {
                                    return (parseInt(d.info)+parseInt(d.warning));
                    })]).range([0, 2*this.radius/10])
            // console.log(Scales(1000))
            return Scales;
        },
        circledata:function(){
            let selectTime=this.$store.getters.getSelectTime;
            this.circles=[]
            var startdate=new Date(selectTime[0]);
            var enddate=new Date(selectTime[1]);
            this.drawcircledata=[];
             for(let i=0;i<this.allcircledata.length;i++){
                var currentime=new Date(this.allcircledata[i].time)
                if(currentime>=startdate&&currentime<=enddate){
                    this.drawcircledata.push(this.allcircledata[i]);
                    let x=[];
                     //NCon,NVol,srcip,destip,srcport,destport
                    //['totalbytes','cpu_load','priority','status','NCon','NVol']
                    x.push(this.NConScale(parseFloat(this.allcircledata[i]['NCon'])));
                    x.push(this.NVolScale(parseFloat(this.allcircledata[i]['NVol'])));
                    x.push(this.srcipScale(parseFloat(this.allcircledata[i]['srcip'])));
                    x.push(this.destipScale(parseFloat(this.allcircledata[i]['destip'])));
                    x.push(this.srcportScale(parseFloat(this.allcircledata[i]['srcport'])));
                    x.push(this.destportScale(parseFloat(this.allcircledata[i]['destport'])));
                    this.circles.push(x);
                }
            }
        },
        zb:function(length,i,r){
            let that=this;
            if(length<29)
                length=29;
            let barpeace=this.arc/(length+1);
            // console.log(that.radius,that.barscale(parseInt(r)),that.radius+10+that.barscale(parseInt(r)))
            return {x:(that.radius+20+that.barscale(parseInt(r))) * Math.sin(i *  barpeace),
                    y:(that.radius+20+that.barscale(parseInt(r))) * Math.cos(i *  barpeace)};
        },
        drawbar:function(){
        d3.select("#radarcontainer").select(".b_circle").remove();
        let that=this;

        let selectTime=this.$store.getters.getSelectTime;
        let testdata=[]    
        let startdate=new Date(selectTime[0]);
        let enddate=new Date(selectTime[1]);
        
        for(let i=0;i<that.allbardata.length;i++){
            let currentime=new Date(that.allbardata[i].time);
           
            if(currentime>=startdate&&currentime<=enddate){
                testdata.push({info:that.allbardata[i].Info,warning:that.allbardata[i].Warning});
            }
        }
       this.barscale=this.BScale(testdata);
        console.log( 2*this.radius/10)
        const colorArray = this.barcolor;
        let stack=d3.stack().keys(["info","warning"]).order(d3.stackOrderNone).offset(d3.stackOffsetNone);
        let series=stack(testdata);
        let index=0;
        this.main.append("g")
        .classed("b_circle",true)
        .selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .attr("fill",function(d,i){return colorArray[i]})
        .attr("class",function(d){return d.key})
        .selectAll("path")
        .data(function(d){
            return d;
        })
        .enter()
        .append("path")
        .attr("stroke","gray")
        .attr("d",function(d,i){
            
            index+=1;
            let startp=that.zb(testdata.length,i,d[0]);
            let second=that.zb(testdata.length,(i+1),d[0]);
            let three=that.zb(testdata.length,(i+1),d[1]);
            let four=that.zb(testdata.length,i,d[1]);
            // console.log(startp,second,three,four,that.radius)
            if(index==1)
            {
                return "M"+startp.x+" "+startp.y+" A "
            +(that.radius+d[0])+" "+(that.radius+d[0]) +" 0 0 0 "+second.x
            +" "+second.y+" L" +three.x
            +" "+three.y+" L"+four.x+" "+four.y+" Z";
            }
            else{
                  return "M"+startp.x+" "+startp.y+" L "+second.x
            +" "+second.y+" L" +three.x
            +" "+three.y+" L"+four.x+" "+four.y+" Z";
            }
            
        })
        },
        drawlabes:function(){
           let width=document.getElementById("radarcontainer").offsetWidth;
           let height=document.getElementById("radarcontainer").offsetHeight;
           this.svgs.append("g").append("text").attr("x",10).attr("y",10).text("Radar View");
           let labes= this.svgs
            .append("g")
            .classed("labes",true)
            .attr("font-size",7)
            .attr('transform', "translate(" + width/1.4 + ',' + (height-100) + ')');

            //熵标签
            labes.append("g")
            .selectAll("rect")
            .data(this.color)
            .enter()
            .append("rect")
            .attr("x",0)
            .attr("y",function(d,i){return 10*i})
            .attr("width",5)
            .attr("height",5)
            .attr("fill",function(d){return d});
            labes.append("g")
            .selectAll("text")
            .data(this.filename)
            .enter()
            .append("text")
            .attr("x",10)
            .attr("y",function(d,i){return 10*i+5})
            .text(function(d,i) {
                return d;
            })
           //info warining
           labes.append("g")
            .selectAll("rect")
            .data(this.barcolor)
            .enter()
            .append("rect")
            .attr("x",0)
            .attr("y",function(d,i){return 10*i+60})
            .attr("width",5)
            .attr("height",5)
            .attr("fill",function(d){return d});

            labes.append("g")
            .selectAll("text")
            .data(["Normal","Warning"])
            .enter()
            .append("text")
            .attr("x",10)
            .attr("y",function(d,i){return 10*i+5+60})
            .text(function(d,i) {
                return d;
            })
        }
    },
    mounted() {
       
        Readcsv.Read_radarcsv();
       
        this.initchart();
        // this.drawcircle();
        this.drawlabes()
        
        
    },
    computed:{
        Radardata(){
            return this.$store.getters.getRadardata;
        },
        SelectTime(){
            return this.$store.getters.getSelectTime;
        }
    },
    watch:{
        Radardata:function(newval,oldval){
            this.allcircledata=newval.radar1;
            this.allbardata=newval.radar2;
            //初始化比例尺
             //NCon,NVol,srcip,destip,srcport,destport
            this.srcipScale=this.sipScale();
            this.destipScale=this.dipSclse();
            this.srcportScale=this.sportScale();
            this.destportScale=this.dportScale();
            this.NConScale=this.NCScale();
            this.NVolScale=this.NVScale();
            this.circledata();
            // this.drawcircle();
            
            
            // this.drawbar()
        },
        SelectTime:function(newval,oldval){
            this.circledata();
            this.drawcircle();
            this.drawbar();
        }
    }
}
</script>
<style>
#radar{
    position: absolute;
    top: 25.7%;
    width: 30%;
    height: 35%;
    /* background-color: #e8e9f0; */
    
}
#radarcontainer{
    width: 100%;
    height: 100%;
}
.lines,.webs polygon {
fill: white;
fill-opacity: 0.5;
stroke: gray;
/* stroke-dasharray: 10 5; */
}
.areas polygon {
fill-opacity: 0.5;
stroke-width: 1;
}
.areas circle {
fill: white;
stroke-width: 1;

}
.tooltip{
font-family:simsun;
/* font-size:16px; */
width:120;
height:auto;
position:absolute; 
text-align:center;
border-style:solid;
border-width:1px;
/* background-color:white; */
border-radius:5px;
opacity: 0.1;	
}

</style>
