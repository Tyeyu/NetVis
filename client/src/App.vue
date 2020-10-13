<template>
  <div id="app">
    <TimeLine id="timeLine"></TimeLine>
    <Radar id="radar"></Radar>
    <Parallel id="parallel"></Parallel>
    <Net id="net"></Net>
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
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
