<template> 
    <div id='TimelineContainer'>
        <div>
            <div id='TimelineTitle'>
                
            </div>
            <div id='TimelineGraph'>
                <div id='TimelineGraph-Overview'></div>
                <div id='TimelineGraph-Details'></div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Timeline',
    data() {
        return {
            TimelineContainer: null,
            DetailsContainer: null,
            data: null,

        }
    },
    mounted(){
        
    },
    methods:{
        ChartInit(data_IPS, data_Overview){
            
        },
        GetData(){
            let that = this;
            d3.csv('./static/IPS_Entropy.csv').then((data_IPS) => {
                d3.csv('./static/Overview.csv').then((data_Overview) => {
                    that.ChartInit(data_IPS, data_Overview)
                    console.log('data_IPS', data_IPS)
                    console.log('data_Overview', data_Overview)
                })
            })
        }
    }
};
</script>
<style>
#TimelineContainer {
    width: 100%;
    height: 25%;
    border: 2px solid grey;
}

#TimelineTitle{
    width: 100%;
    height:15%;
    float: left;
}

#TimelineGraph {
    width: 100%;
    height: 85%;
    float: left;
}
</style>
