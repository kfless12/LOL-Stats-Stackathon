const { ipcRenderer } = require('electron')
const axios = require('axios')
const path = require('path')




window.addEventListener('DOMContentLoaded', async ()=>{
    
    const button = document.getElementById('getInfo')
    button.addEventListener("click", async function(event){
        
        const SummonerName = document.getElementById("SummonerName")
        if(SummonerName.value){
            let data = SummonerName.value
            ipcRenderer.send('getInfo', data)
        }
    })
            
}) 
