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
                        .attr('transform', "translate(" + -(width/21) + ',' + 0 + ')');
            
            let yun_ip=new Map();
            let mu_ip=new Map();
            let y_index=0;
            let m_index=0;
            for(let i=0;i<this.ip_data.length;i++){
                let ips=this.ip_data[i].link.split('-');
               
                if(!yun_ip.get(ips[0])){
                    yun_ip.set(ips[0],y_index);
                    y_index+=1;
                }
               
                if(!mu_ip.get(ips[1])){
                    mu_ip.set(ips[1],m_index);
                    m_index+=1;
                }
            }
            let op_scale=d3.scaleLinear()
                    .domain([d3.min(this.ip_data,function(d){return parseInt(d.value)}),
                    d3.max(this.ip_data, function(d) {
                                    return parseInt(d.value);
                    })])
                    .range([0, 1])
            let rect_x=((width-20)/2.2)/(mu_ip.size+2);
            let rect_y=(height-10)/((yun_ip.size+1));
            svg_ip.append("g")
                //   
                  .selectAll("rect")
                  .data(this.ip_data)
                  .enter()
                  .append("rect")
                  .attr("x",function(d){
                      let ips=d.link.split("-");
                      return (mu_ip.get(ips[1]))*rect_x+10;
                  })
                  .attr("y",function(d){
                      let ips=d.link.split("-");
                      return (yun_ip.get(ips[0])+1)*rect_y+10;
                  })
                  .attr("height",rect_y)
                  .attr("width",rect_x)
                  .attr("fill",'#07a2a4')
                  .attr("stroke","gray")
                  .on("click",function(e,d){
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
                    console.log(that.port_data)
                    that.init_port();
                  })
                  .attr("opacity",function(d){
                      
                       if(d.value<=20){
                         return 0.25
                     }
                     else{
                         if(d.value>20&&d.value<=50){
                             return 0.5
                         }
                         else{
                             return 1;
                         }
                     }
                  })
                  
                //   .attr('transform', "translate(" + -(rect_x) + ',' + 0 + ')')
        },
        init_port:function(){
            d3.select("#rect_ip").select(".rect_port").remove();
            let width=document.getElementById("rect_ip").clientWidth;
            let height=document.getElementById("rect_ip").clientHeight;
            let svg_port=d3.select("#rect_ip")
                        .append("svg")
                        .attr("width",width/2.2)
                        .attr("height",height)
                        .classed("rect_port",true)
                        .attr('transform', "translate(" + (width/21) + ',' + 0 + ')');
            
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
                    .domain([0,
                    d3.max(this.port_data, function(d) {
                                    return d.value;
                    })])
                    .range([0, 1])
            let rect_x=(width/3)/(mu_port.size+1);
            let rect_y=height/((yun_port.size+1));
            if(mu_port.size<20){
                rect_x=(width/25)
            }
            if(yun_port.size<20){
                 rect_y=(height/25)
            }
            svg_port.append("g")
                //   
                  .selectAll("rect")
                  .data(this.port_data)
                  .enter()
                  .append("rect")
                  .attr("x",function(d){
                      let ports=d.link.split("-");
                      return (mu_port.get(ports[1])*rect_x+10);
                  })
                  .attr("y",function(d){
                      let ports=d.link.split("-");
                      return (yun_port.get(ports[0])*rect_y+5*yun_port.get(ports[0]));
                  })
                  .attr("height",rect_y)
                  .attr("width",rect_x)
                  .attr("fill",'#07a2a4')
                  .attr("stroke","gray")
                  .attr("stroke-opacity", 1)
                  .attr("stroke-width",0.5)
                  .attr("opacity",function(d){
                     if(d.value<=20){
                         return 0.25
                     }
                     else{
                         if(d.value>20&&d.value<=50){
                             return 0.5
                         }
                         else{
                             return 1;
                         }
                     }
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
            this.ip_time_data=newv;
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
    width: 69%;
    height: 35%;
    background-color: #e8e9f0;
    stroke-width: 0.1;
    stroke-opacity: 0.1;
}
</style>
