<template>
<div>
    <div id="rect_ip">
        
    </div>
</div> 
</template>
<script>
export default {
    data(){
        return{} ;
    },
    methods:{
        init_ip:function(){
            let width=document.getElementById("rect_ip").clientWidth;
            let height=document.getElementById("rect_ip").offsetHeight;
            let svg_ip=d3.select("#rect_ip")
                        .append("svg")
                        .attr("wdith",2.2*width/5)
                        .attr("height",height)
                        // .attr('transform', "translate(" + -(2*width/5.2) + ',' + 0 + ')');
            let ip_data=[{"link":"1-2",value:10},{"link":"1-3",value:7},{"link":"2-2",value:10},{"link":"3-1",value:10}];
            let yun_ip=new Map();
            let mu_ip=new Map();
            let y_index=0;
            let m_index=0;
            for(let i=0;i<ip_data.length;i++){
                let ips=ip_data[i].link.split("-");
               
                if(!yun_ip.get(ips[0])){
                    yun_ip.set(ips[0],y_index);
                    y_index+=1;
                }
                console.log(ips[1],mu_ip[ips[1]])
                if(!mu_ip.get(ips[1])){
                    mu_ip.set(ips[1],m_index);
                    m_index+=1;
                }
            }
            let op_scale=d3.scaleLinear()
                    .domain([0,
                    d3.max(ip_data, function(d) {
                                    return d.value;
                    })])
                    .range([0, 1])
            let rect_x=(2*width/10)/(mu_ip.size+1);
            let rect_y=height/(2*(yun_ip.size+1));
            svg_ip.append("g")
                //   
                  .selectAll("rect")
                  .data(ip_data)
                  .enter()
                  .append("rect")
                  .attr("x",function(d){
                      let ips=d.link.split("-");
                      return mu_ip.get(ips[1])*rect_x;
                  })
                  .attr("y",function(d){
                      let ips=d.link.split("-");
                      return yun_ip.get(ips[0])*rect_y;
                  })
                  .attr("height",rect_y)
                  .attr("width",rect_x)
                  .attr("fill",'#07a2a4')
                  .attr("opacity",function(d){
                      return op_scale(d.value)
                  })
                //   .attr('transform', "translate(" + -(rect_x) + ',' + 0 + ')')
        },
        init_port:function(){
            let width=document.getElementById("rect_ip").clientWidth;
            let height=document.getElementById("rect_ip").clientHeight;
            let svg_port=d3.select("#rect_ip")
                        .append("svg")
                        .attr("wdith",2.2*width/5)
                        .attr("height",height)
                        .attr('transform', "translate(" + (width/5.2) + ',' + 0 + ')');
            let port_data=[{"link":"1-2",value:10},{"link":"1-3",value:7},{"link":"2-2",value:10},{"link":"3-1",value:10}];
            let yun_port=new Map();
            let mu_port=new Map();
            let y_index=0;
            let m_index=0;
            for(let i=0;i<port_data.length;i++){
                let ports=port_data[i].link.split("-");
               
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
                    d3.max(port_data, function(d) {
                                    return d.value;
                    })])
                    .range([0, 1])
            let rect_x=(2*width/10)/(mu_port.size+1);
            let rect_y=height/(2*(yun_port.size+1));
            svg_port.append("g")
                //   
                  .selectAll("rect")
                  .data(port_data)
                  .enter()
                  .append("rect")
                  .attr("x",function(d){
                      let ports=d.link.split("-");
                      return mu_port.get(ports[1])*rect_x;
                  })
                  .attr("y",function(d){
                      let ports=d.link.split("-");
                      return yun_port.get(ports[0])*rect_y;
                  })
                  .attr("height",rect_y)
                  .attr("width",rect_x)
                  .attr("fill",'#07a2a4')
                  .attr("opacity",function(d){
                      return op_scale(d.value)
                  })
        }
    },
    mounted(){
        this.init_ip();
        this.init_port();
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
}
</style>
