import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
const store= new Vuex.Store({
  state:{
    Radardata:null,
    SelectTime:["2013-04-10 07:05:00","2013-04-10 7:15:00"],
    ipsdata:null,
    parallel_data:null
  },
  mutations:{
    setRadardata:function(state,data){
      state.Radardata=data;
    },
    setSelectTime:function(state,times){
      state.SelectTime=times;
    },
    setipsdata:function(state,data){
      state.ipsdata=data;
    },
    setParallelData:function(state,data){
      state.parallel_data=data;
    },
  },
  getters:{
    getRadardata:state=>{
      return state.Radardata;
    },
    getSelectTime:state=>{
      return state.SelectTime;
    },
    getipsdata:state=>{
      return state.ipsdata;
    },
    getParallelData:state=>{
      return state.parallel_data;
    }
  }
})
export default store;
