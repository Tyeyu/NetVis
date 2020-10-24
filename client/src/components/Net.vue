<template>
<div>
    <div id="rect_ip">
        
    </div>
</div> 
</template>
<script>
import Readcsv from "../ToolJs/Readcsv"
export default {
    data(){
        return{
            ip_time_data:null,
            allLinkmap:null,
            ip_data:null,
            port_data:[]
        } ;
    },
    methods:{
        init_ip:function(){
            let that=this;
            d3.select("#rect_ip").select(".rect_ip").remove();
            let width=document.getElementById("rect_ip").offsetWidth;
            let height=document.getElementById("rect_ip").offsetHeight;
            let svg_ip=d3.select("#rect_ip")
                        .append("svg")
                        .attr("width",width/2.2)
                        .attr("height",height)
                        .classed("rect_ip",true)
                        .attr('transform', "translate(" + -(width/22) + ',' + 0 + ')');
            
            let yun_ip=new Map();
            let mu_ip=new Map();
            
            let y_index=0;
            let m_index=0;

            // let y_ip=[],m_ip=[];
            // console.log(this.ip_data)
            for(let i=0;i<this.ip_data.length;i++){
                let ips=this.ip_data[i].link.split('-');
               
                if(!yun_ip.get(ips[0])){
                    yun_ip.set(ips[0],y_index);
                    y_index+=1;
                    // y_ip.push()
                }
               
                if(!mu_ip.get(ips[1])){
                    mu_ip.set(ips[1],m_index);
                    m_index+=1;
                }
            }
            let op_scale=d3.scaleLinear()
                    // .domain([d3.min(this.ip_data,function(d){return parseInt(d.value)}),
                    // d3.max(this.ip_data, function(d) {
                        
                    //                 return parseInt(d.value);
                    // })])
                    .domain([0,200])
                    .range([0.05, 1]);

            svg_ip.append("g").append("text").attr("x",width/5).attr("y",10).text("Source IP");
            svg_ip.append("g").append("text").attr("x",height/5).attr("y",0).text("Destination IP").attr("transform","translate(0 ,0)rotate(90)")


            let rect_x=((width-20)/2.2)/(mu_ip.size+2);
            let rect_y=(height-10)/((yun_ip.size+1));
            rect_x=((width-20)/2.2-50)/50;
            rect_y=(height-10-50)/50;
            //背景边框
            svg_ip.append("g")
            .append("rect")
            .attr("x",10)
            .attr("y",10)
            .attr("width",(width-20)/2.2)
            .attr("height",(height-10))
            .attr("fill","white")
            // .attr("opacity",0)
            .attr("z-index",-1)
            .attr("stroke","gray")
            .attr("stroke-width",0.1)
            let toolarry=[];
            for(let i=0;i<48*50;i++){
                 let j=i%50;
                 let k=parseInt(i/50);
                 let value=0;
                 let link="";
                for(let m=0;m<that.ip_data.length;m++){
                          let ips=that.ip_data[m].link.split('-');
                        //   console.log(mu_ip.get(ips[1]),yun_ip.get(ips[0]),j,k)
                          if(mu_ip.get(ips[1])===k&&yun_ip.get(ips[0])===j){
                              value=that.ip_data[m].value;
                              link=that.ip_data[m].link;
                            //    console.log(that.ip_data[m].value)
                              break;
                          }
                      }
                toolarry.push({value:value,link:link});
            }
            // console.log(yun_ip.keys(),mu_ip.keys());
            svg_ip.append("g")
                //   
                  .selectAll("rect")
                  .data(toolarry)
                  .enter()
                  .append("rect")
                  .attr("x",function(d,i){
                    //   let ips=d.link.split("-");
                    //   return (mu_ip.get(ips[1]))*(rect_x+1)+10;
                    return parseInt(i%50)*(rect_x+1)+10;
                  })
                  .attr("y",function(d,i){
                    //   let ips=d.link.split("-");
                    //   return (yun_ip.get(ips[0])+1)*(rect_y+1)+10;
                    return parseInt(i/50)*(rect_y+1)+10;
                  })
                  .attr("height",rect_y)
                  .attr("width",rect_x)
                  .attr("fill",function(d){
                      if(d.value>0){return '#07a2a4'}
                      return "gray";
                  })
                  .attr("index",function(d,i){return i;})
                  .attr("stroke-width",1)
                  .attr("stroke","gray")
                  .on("click",function(e,d){
                      that.$store.commit("setprintStr",d.link);
                      let ports=that.allLinkmap.get(d.link).port;
                      let portmap=new Map();
                      for(let i=0;i<ports.length;i++){
                          for(let j=0;j<ports[i].length;j++){
                               if(!portmap.get(ports[i][j].link)){
                                   portmap.set(ports[i][j].link,ports[i][j].value)
                               }
                               else{
                                   portmap.set(ports[i][j].link,portmap.get(ports[i][j].link)+ports[i][j].value)
                               }
                          }
                         
                      }
                      that.port_data=[];
                      for(let key of portmap.keys()){
                        that.port_data.push({link:key,value:portmap.get(key)});
                        }
                    
                    that.init_port();
                  })
                  .attr("opacity",function(d,i){
                    //   let j=i%50;
                    //   let k=parseInt(i/50);
                      let value=d.value;
                    if(value==0)return 0.05;
                    return op_scale(value);
                    
                  })
                  .append("title").text(function(d){
                      return d.link+":"+d.value;
                  })
                  
                //   .attr('transform', "translate(" + -(rect_x) + ',' + 0 + ')')
        },
        init_port:function(){
            let that=this;
            d3.select("#rect_ip").select(".rect_port").remove();
            let width=document.getElementById("rect_ip").clientWidth;
            let height=document.getElementById("rect_ip").clientHeight;
            let svg_port=d3.select("#rect_ip")
                        .append("svg")
                        .attr("width",width/2.2)
                        .attr("height",height)
                        .classed("rect_port",true)
                        .attr('transform', "translate(" + (width/30) + ',' + 0 + ')')


            svg_port.append("g").append("text").attr("x",width/5).attr("y",10).text("Source Port");
            svg_port.append("g").append("text").attr("x",height/5).attr("y",0).text("Destination Port").attr("transform","translate(0 ,0)rotate(90)")            

            let yun_port=new Map();
            let mu_port=new Map();
            let y_index=0;
            let m_index=0;
            for(let i=0;i<this.port_data.length;i++){
                let ports=this.port_data[i].link.split("-");
               
                if(!yun_port.get(ports[0])){
                    yun_port.set(ports[0],y_index);
                    y_index+=1;
                }
                
                if(!mu_port.get(ports[1])){
                    mu_port.set(ports[1],m_index);
                    m_index+=1;
                }
            }
            let op_scale=d3.scaleLinear()
                    // .domain([0,
                    // d3.max(this.port_data, function(d) {
                    //                 return d.value;
                    // })])
                    .domain([0,10])
                    .range([0.05, 1])
            let rect_x=(width/3)/(mu_port.size+1);
            let rect_y=height/((yun_port.size+1));
            // if(mu_port.size<20){
            //     rect_x=(width/25)
            // }
            // if(yun_port.size<20){
            //      rect_y=(height/25)
            // }
            rect_x=((width-20)/2.2-40)/40;
            rect_y=(height-10-30)/30;
            let toolarry=[];
            for(let i=0;i<44*50;i++){
                 let j=i%40;
                 let k=parseInt(i/40);
                 let value=0;
                 let link="";
                for(let m=0;m<that.port_data.length;m++){
                          let ports=that.port_data[m].link.split('-');
                        //   console.log(mu_ip.get(ips[1]),yun_ip.get(ips[0]),j,k)
                          if(mu_port.get(ports[1])===k&&yun_port.get(ports[0])===j){
                              value=that.port_data[m].value;
                              link=that.port_data[m].link;
                            //    console.log(that.ip_data[m].value)
                              break;
                          }
                      }
                toolarry.push({value:value,link:link});
            }




            svg_port.append("g")
                //   
                  .selectAll("rect")
                  .data(toolarry)
                  .enter()
                  .append("rect")
                  .attr("x",function(d,i){
                    //   let ports=d.link.split("-");
                    //   return (mu_port.get(ports[1])*(rect_x+5)+10);
                     return parseInt(i%40)*(rect_x+1)+10;
                  })
                  .attr("y",function(d,i){
                    //   let ports=d.link.split("-");
                    //   return (yun_port.get(ports[0])*rect_y+5*yun_port.get(ports[0]));
                    return parseInt(i/40)*(rect_y+1)+10;
                  })
                  .attr("height",rect_y)
                  .attr("width",rect_x)
                  .attr("fill",function(d){
                      if(d.value>0){return '#07a2a4'}
                      return "gray";
                  })
                  .attr("stroke","gray")
                  .attr("stroke-opacity", 1)
                  .attr("stroke-width",0.5)
                  .attr("opacity",function(d){
                    if(d.value==0)return 0.05;
                    return op_scale(d.value)
                  })
                  .append("title").text(function(d){
                      return d.link+":"+d.value;
                  })
                  
        },
        detail_data:function(timedata){
            this.allLinkmap=new Map(); 
            this.ip_data=[];
            for(let i=0;i<timedata.length;i++){
                let iplinks=eval('(' + timedata[i].ipPair + ')');
                for(let j=0;j<iplinks.length;j++){
                    if(!this.allLinkmap.get(iplinks[j].link)){
                        let ports=[];
                        ports.push(iplinks[j].port)
                        this.allLinkmap.set(iplinks[j].link,{value:iplinks[j].value,port:ports})
                    }
                    else{
                        let ports=this.allLinkmap.get(iplinks[j].link).port;
                        // console.log(ports)
                        ports.push(iplinks[j].port);
                        let value=iplinks[j].value+this.allLinkmap.get(iplinks[j].link).value;
                        this.allLinkmap.set(iplinks[j].link,{value:value,port:ports})
                    }
                }
                // console.log(iplinks)
            }
            // let keys=allLinkmap.keys();
            // console.log(keys)
            for(let key of this.allLinkmap.keys()){
                this.ip_data.push({link:key,value:this.allLinkmap.get(key).value});
            }
        }
    },
    mounted(){
       
        // this.init_port();
        let selectTime=this.$store.getters.getSelectTime;
        let start=selectTime[0],end=selectTime[1];
        Readcsv.Getips(start,end)
    },
    computed:{
        SelectTime(){
            return this.$store.getters.getSelectTime;
        },
        ipsdata(){
            return this.$store.getters.getipsdata;
        },
        radarTime(){
            return this.$store.getters.getradarTime;
        }
    },
    watch:{
        SelectTime:function(newv,oldv){
            let start=newv[0],end=newv[1];
            Readcsv.Getips(start,end)
        },
        ipsdata:function(newv,oldv){
            // JSON.stringify(newv[0].ipPair)
            let times=this.$store.getters.getSelectTime;
            var startdate=new Date(times[0]);
            var enddate=new Date(times[1]);
            this.ip_time_data=[];
            for(var i=0;i<newv.length;i++){
                var currentime=new Date(newv[i].time)
                if(currentime>=startdate&&currentime<=enddate){
                    this.ip_time_data.push(newv[i])
                }
            }
            // console.log(this.ip_time_data);
            this.detail_data(this.ip_time_data);
            // console.log(this.ip_data)
            this.init_ip();
            this.init_port();
        //    let test=new Array(newv[0].ipPair)
        //     console.log(eval('(' + newv[0].ipPair + ')'));
        },
        radarTime:function(newv,oldv){
            for(let i=0;i<this.ip_time_data.length;i++){
                if(this.ip_time_data[i].time===newv){
                    let time_data=[];
                    time_data.push(this.ip_time_data[i]);
                    // console.log(this.ip_time_data[i])
                    this.detail_data(time_data);
                    this.init_ip();
                    this.init_port();
                    break;
                }
            }
            // console.log(this.ip_time_data)
            //  this.detail_data();
        }
    }
};
</script>

<style>
#rect_ip{
    width: 100%;
    height: 100%;
}
#net{
    position: absolute;
    top: 25.7%;
    left: 31%;
    width: 59%;
    height: 35%;
    /* background-color: #e8e9f0; */
    stroke-width: 0.2;
    stroke-opacity: 0.5;
    
}
</style>
