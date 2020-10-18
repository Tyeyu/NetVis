import * as d3 from "d3";
import store from "../vuex/store";
const readcsv = {
    Read_radarcsv: function() {
        d3.csv("../../static/data/radar.csv")
      .then(radardata=>{
          d3.csv("../../static/data/radar2.csv")
          .then(function(radar2){
          store.commit("setRadardata",{radar1:radardata,radar2:radar2});
          })
      })
      .catch(function(error) {});
    }
}
export default readcsv;