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
body{
  margin: 0.5%;
}

#app {
  position: absolute;
  width: 99%;
  height: 99%;
  overflow: hidden;

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
</style>
