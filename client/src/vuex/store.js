import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
const store= new Vuex.Store({
    state:{
        Radardata:null,
        SelectTime:["2013-04-10 07:05:00","2013-04-10 7:15:00"],
        ipsdata:null,
        //点击雷达图的圆选择时间段
        radarTime:null
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
        setradarTime:function(state,time){
            state.radarTime=time;
        }
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
        getradarTime:state=>{
            return state.radarTime;
        }
    }
})
export default store;