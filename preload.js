const { ipcRenderer } = require('electron')
const axios = require('axios')
const { Kayn, REGIONS, KaynRequest } = require('kayn')


axios.defaults.headers.common['X-Riot-Token'] = 'RGAPI-10ddacbd-7437-47ff-9643-c4190ec04c08'

function caseAdjust(str){
    const lower = str.toLowerCase()
    return str.charAt(0).toUpperCase()+lower.slice(1)
}

const kayn = Kayn('RGAPI-10ddacbd-7437-47ff-9643-c4190ec04c08')({
    region: REGIONS.NORTH_AMERICA,
    apiURLPrefix: 'https://%s.api.riotgames.com',
    locale: 'en_US',
    debugOptions: {
        isEnabled: true,
        showKey: false,
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: true,
        shouldExitOn403: false,  
    },
    cacheOptions: {
        cache: false,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {},
        },
    },    
}
)

let DDragon, championIdMap
async function preloadDragonData(){
    DDragon = await kayn.DDragon.ProfileIcon.list()
    championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId()
}

preloadDragonData()





window.addEventListener('DOMContentLoaded', async ()=>{

    await ipcRenderer.invoke('dark-mode')



    
}) 

ipcRenderer.on('getSummonerName', async (event, message)=>{
    const { accountId, id, summonerLevel, profileIconId, puuid, name } = await kayn.Summoner.by.name(`${message}`)
    document.getElementById("summonerName").innerHTML = message
    const profileicon = document.getElementById("profileIcon")
    profileicon.setAttribute('src', `http://ddragon.leagueoflegends.com/cdn/11.10.1/img/profileicon/${DDragon.data[profileIconId].image.full}`)

    const { data } = await axios.get(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`)
    
    const solorank = document.getElementById('Solorank')
    solorank.innerHTML = `Solo Queue Rank: ${data[0].tier} ${data[0].rank}`;
    const solorankimage = document.createElement('img')
    solorankimage.setAttribute('src', `../GameAssets/ranked-emblems/Emblem_${caseAdjust(data[0].tier)}.png` )
    solorankimage.setAttribute('width', `120` )
    solorankimage.setAttribute('height', `120` )
    solorank.appendChild(solorankimage)

    document.getElementById('wins').innerHTML = `Solo Queue wins: ${data[0].wins}`
    document.getElementById('losses').innerHTML = `Solo Queue losses: ${data[0].losses}`
    document.getElementById('win loss ratio').innerHTML = `Solo Queue win/loss ratio: ${(parseInt(data[0].wins)/parseInt(data[0].losses)).toFixed(2)}`



    const champions = (await axios.get(`https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`)).data
    let top3champs = [champions[0], champions[1], champions[2] ]
    let top3wnames = []
    top3champs.forEach(e=>{top3wnames.push({...e, name: championIdMap.data[e.championId].name})})
    
    top3wnames.forEach(e=>{
        const achamp = document.createElement('img')
        achamp.setAttribute('src', `../GameAssets/img/champion/tiles/${e.name}_0.jpg` )
        achamp.setAttribute('height', 60)
        achamp.setAttribute('width', 60)
        document.getElementById('top3champs').appendChild(achamp)
    })


    // const processMatch = (championIdMap, summonerId, match) => {
    //     const { participantId } = match.participantIdentities.find(
    //         pi => pi.player.summonerId === summonerId,
    //     )
    //     const participant = match.participants.find(
    //         p => p.participantId === participantId,
    //     )
    //     const champion = championIdMap.data[participant.championId]
    //     return {
    //         gameCreation: match.gameCreation,
    //         seasonId: match.seasonId,
    //         didWin:
    //             participant.teamId ===
    //             match.teams.find(({ win }) => win === 'Win').teamId,
    //         championName: champion.name,
    //     }
    // }

    const main = async ()=> {
        const { matches } = await kayn.Matchlist.by
            .accountID(accountId)
            .query({ queue: 420 })
            console.log(matches)
        const gameIds = matches.slice(0, 10).map(({ gameId }) => gameId)
        const matchDtos = await Promise.all(gameIds.map(kayn.Match.get))
        // `processor` is a helper function to make the subsequent `map` cleaner.
        const processor = match => processMatch(championIdMap, id, match)
        const results = await Promise.all(matchDtos.map(processor))

    }
    
    const { matches } = await kayn.Matchlist.by.accountID(accountId)
    const gameIds = matches.slice(0, 10).map(({ gameId }) => gameId)
    const matchDtos = await Promise.all(gameIds.map(kayn.Match.get))
    console.log(matchDtos)



})



