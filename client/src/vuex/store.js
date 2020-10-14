import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
const store= new Vuex.Store({
    state:{
        Radardata:null,
        SelectTime:["2013-04-10 07:05:00","2013-04-10 10:45:00"]
    },
    mutations:{
        setRadardata:function(state,data){
            state.Radardata=data;
        },
        setSelectTime:function(state,times){
            state.SelectTime=times;
        }
    },
    getters:{
        getRadardata:state=>{
            return state.Radardata;
        },
        getSelectTime:state=>{
            return state.SelectTime;
        }
    }
})
export default store;