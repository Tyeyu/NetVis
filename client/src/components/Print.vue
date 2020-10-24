<template>
    <div>
        <div>Detail</div>
        <div id="divContainer" >
            
        </div>
    </div>
</template>
<script>
import * as d3 from "d3";
export default {
    methods:{
        scroll:function(str){
            let string=d3.select("#divContainer").text();
            d3.select("#divContainer").text(string+"\n"+str)
            var div = document.getElementById('divContainer');
            div.scrollTop = div.scrollHeight;
        }
    },
    mounted(){
        // this.scroll();
    },
    computed:{
        printStr(){
            return this.$store.getters.getprintStr;
        }
    },
    watch:{
        printStr:function(newv,oldv){
           console.log(newv);
            this.scroll(newv);
        }
    }
}
</script>
<style>
#print{
    position: absolute;
    top: 25.7%;
    left: 90%;
    width: 9.9%;
    height: 35%;
    /* background-color: #e8e9f0; */
    stroke-width: 0.2;
    stroke-opacity: 0.5;
    border:1px solid gray;
    stroke: gray;
    
}
#divContainer {
  overflow: auto;
  height: 90%;
  width: 100%;
  /* background-color:red; */
  overflow-y: scroll;
}

#divContainer::-webkit-scrollbar {
	border-width:1px;
}
</style>