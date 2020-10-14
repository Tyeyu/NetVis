import * as d3 from "d3";
import store from "../vuex/store";
const readcsv = {
    Read_radarcsv: function() {
        d3.csv("../../static/data/radar.csv")
      .then(function(data) {
          store.commit("setRadardata",data);
      })
      .catch(function(error) {});
    }
}
export default readcsv;