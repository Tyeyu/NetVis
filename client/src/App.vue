
<template>
  <div id="app">
    <div id="control_panel">
      <div id="page_title">
        Multi-Source Network Data Visualization Analysis System
      </div>
    </div>
    <div id="container">
      <TimeLine></TimeLine>
      <Radar id="radar"></Radar>
      <Parallel id="parallel"></Parallel>
      <Net id="net"></Net>
      <Print id="print"></Print>
    </div>
  </div>
</template>

<script>
    import TimeLine from "./components/TimeLine";
    import Radar from "./components/Radar";
    import Parallel from "./components/Parallel";
    import Net from "./components/Net";
    import Print from "./components/Print";
    export default {
        name: "App",
        components: {
            TimeLine,
            Radar,
            Parallel,
            Net,
            Print
        },
        data () {
            return {
                showComponent: false,
                currentPagegroup: ""
            }
        },
        mounted(){
            let self = this;
            self.fnResize();
            window.onresize = function(){
                self.fnResize();
            }
        },
        methods: {
            fnResize(){
                let deviceHeight = $('#container').height()
                let deviceWidth = $('#container').width()
                d3.select('#container').style('width', deviceWidth)
                d3.select('#container').style('height', deviceHeight)
                let fontSize = deviceWidth / 1920 * 18
                let html = document.getElementsByTagName('html')[0]
                html.style.fontSize = fontSize + 'px';
                console.log('------')
                console.log('deviceHeight', deviceHeight)
                console.log('deviceWidth', deviceWidth)
                console.log('fontSize', fontSize)
                Date.prototype.format = function(fmt) {
                    var o = {
                        "M+" : this.getMonth()+1,                 //月份
                        "d+" : this.getDate(),                    //日
                        "h+" : this.getHours(),                   //小时
                        "m+" : this.getMinutes(),                 //分
                        "s+" : this.getSeconds(),                 //秒
                        "q+" : Math.floor((this.getMonth()+3)/3), //季度
                        "S"  : this.getMilliseconds()             //毫秒
                    };
                    if(/(y+)/.test(fmt)) {
                            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
                    }
                    for(var k in o) {
                        if(new RegExp("("+ k +")").test(fmt)){
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                        }
                    }
                    return fmt;
                }
            }
        }
    };
</script>

<style>
  #app {
    position: fixed;
    width: 100%;
    height: 100%;
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    /*color: #2c3e50;*/
    /*margin-top: 60px;*/
    overflow: hidden;
  }
  html,body{
    padding: 0;
    margin: 0;
    /*background: #2c3e50;*/
  }

  #control-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4%;
    z-index: 999;
  }
  #page_title{
    font-size: 24px;
    font-weight: 600;
  }
  #container {
    position: absolute;
    width: 100%;
    height: 96%;
    top:4%;
  }

  #parallel{
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 38%;
    /*background-color: #2c3e50;*/
  }
</style>
