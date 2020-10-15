
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
    </div>
  </div>
</template>

<script>
    import TimeLine from "./components/TimeLine";
    import Radar from "./components/Radar";
    import Parallel from "./components/Parallel";
    import Net from "./components/Net";
    export default {
        name: "App",
        components: {
            TimeLine,
            Radar,
            Parallel,
            Net,
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
    color: #2c3e50;
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
    background-color: #2c3e50;
  }
</style>
