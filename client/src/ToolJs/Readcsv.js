import * as d3 from "d3";
import store from "../vuex/store";
import axios from "axios";
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
    },
    Getips:function(startT,endT){
        let result=axios.get("http://127.0.0.1:3000/queryAll",{params:{start:startT,end:endT}});
        result.then(function(data){
            store.commit("setipsdata",data.data.data)
        })
    },
  GetParallel_data:function(startT,endT){
    let result=axios.get("http://127.0.0.1:3000/parallel",{params:{start:startT,end:endT}});
    result.then(function(data){
      store.commit("setParallelData",data.data)
    })
  }
}
export default readcsv;
