const { ipcRenderer } = require("electron");
const axios = require("axios");
const { Kayn, REGIONS, KaynRequest } = require("kayn");
const listofchampinfo = require("./GameAssets/11.10.1/data/en_US/champion.json");
const championlist = Object.values(listofchampinfo.data);
const listofsumspells = require("./GameAssets/11.10.1/data/en_US/summoner.json");
const sumspelllist = Object.values(listofsumspells.data);
const  blankhtml = require('./blankhtml')
const perklist = require("./GameAssets/11.10.1/data/en_US/runesReforged.json")

let statmods = {5004: 'StatModsAdaptiveForceIcon.png', 5003: 'StatModsMagicResIcon.png', 5009: 'StatModsCDRScalingIcon.png', 5002: 'StatModsArmorIcon.png' , 5008: 'StatModsAdaptiveForceIcon.png' , 5001: 'StatModsHealthScalingIcon.png', 5007: 'StatModsCDRScalingIcon.png', 5005: 'StatModsAttackSpeedIcon.png', 5010: 'StatModsAdaptiveForceIcon.png', 5006: 'StatModsAdaptiveForceIcon.png'}

function getperkimages(style, substyle, arrayperk){
	let arr = []
	let Aperk = perklist.find(e=> e.id === style)
	arr.push(`../GameAssets/img/${Aperk.icon}`)
	let Bperk = perklist.find(e=> e.id === style)
	arr.push(`../GameAssets/img/${Bperk.icon}`)
	arrayperk.forEach((e, i)=>{
		if(i>5){
			arr.push(`../GameAssets/img/perk-images/StatMods/${statmods[`${Bperk.slots[i-6]}`]}`)
		}else if(i>3){
			arr.push(`../GameAssets/img/${Bperk.slots.map(slot => slot.runes.find(rune=> rune.id === e)).icon}`)
		}
		else{
			arr.push(`../GameAssets/img/${Aperk.slots.map(slot => slot.runes.find(rune=> rune.id === e)).icon}`)
		}

	})
	return arr
}


function champinfobyID(id) {
	for (let i of championlist) {
		if (i.key === `${id}`) {
			return i;
		}
	}
}
function sumspellinfobyID(arr) {
    let retarr = []
    arr.forEach(e=>{
        const spell = sumspelllist.find(spell => spell.key === `${e}`)
        const name = `../GameAssets/11.10.1/img/spell/${spell.image.full}`
        retarr.push(name)

    })
    return retarr
}
function itemsbyid(arr){
    let retarr = []
    arr.forEach(e=>{
        if(e>0){
            retarr.push(`../GameAssets/11.10.1/img/item/${e}.png`)
        }
    })
    return retarr

}

axios.defaults.headers.common["X-Riot-Token"] = process.env.RGAPI_KEY;

function caseAdjust(str) {
	const lower = str.toLowerCase();
	return str.charAt(0).toUpperCase() + lower.slice(1);
}

const kayn = Kayn(process.env.RGAPI_KEY)({
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
        cache: null,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {},
        },
    },
});


window.addEventListener("DOMContentLoaded", async () => {
	await ipcRenderer.invoke("dark-mode");
});

ipcRenderer.on("getSummonerName", async (event, message) => {
	document.getElementsByTagName('body')[0].innerHTML = blankhtml
	const { accountId, id, summonerLevel, profileIconId, puuid, name } =
		await kayn.Summoner.by.name(`${message}`);
	
	document.getElementById("summonerName").innerHTML = ` ${message}  <h5>Summoner level: ${summonerLevel} </h5>`;

	const profileicon = document.getElementById("profileIcon");
	profileicon.setAttribute(
		"src",
		`http://ddragon.leagueoflegends.com/cdn/11.10.1/img/profileicon/${profileIconId}.png`
	);

	const { data } = await axios.get(
		`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`
	);

	const solorank = document.getElementById("Solorank");
	solorank.innerHTML = `Solo Queue Rank: ${data[0].tier} ${data[0].rank}`;
	const solorankimage = document.createElement("img");
	solorankimage.setAttribute(
		"src",
		`../GameAssets/ranked-emblems/Emblem_${caseAdjust(data[0].tier)}.png`
	);
	solorankimage.setAttribute("width", `150`);
	solorankimage.setAttribute("height", `150`);
	document.getElementById('Solorankstats').insertBefore(solorankimage, solorank);

	document.getElementById(
		"wins"
	).innerHTML = `Solo Queue wins: ${data[0].wins}`;
	document.getElementById(
		"losses"
	).innerHTML = `Solo Queue losses: ${data[0].losses}`;
	document.getElementById(
		"win loss ratio"
	).innerHTML = `Solo Queue win/loss ratio: ${(
		parseInt(data[0].wins) / parseInt(data[0].losses)
	).toFixed(2)}`;

	const champions = (
		await axios.get(
			`https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`
		)
	).data;
	let top3champs = [champions[0], champions[1], champions[2]];
	let top3wnames = [];
	top3champs.forEach((e) => {
		const name = championlist.find(champ=>champ.key == `${e.championId}`)
		top3wnames.push({ ...e, name});
	});

	top3wnames.forEach((e) => {
		const achamp = document.createElement("img");
		achamp.setAttribute(
			"src",
			`../GameAssets/img/champion/tiles/${e.name.id.replace(/\s/g, '')}_0.jpg`
		);
		achamp.setAttribute("height", 60);
		achamp.setAttribute("width", 60);
		document.getElementById("top3champs").appendChild(achamp);
	});

	const { matches } = await kayn.Matchlist.by.accountID(accountId);
	const gameIds = matches.slice(0, 25).map(({ gameId }) => gameId);
	const matchDtos = await Promise.all(gameIds.map(kayn.Match.get));

    const recentmatches = matchDtos.slice(0, 3)

	
    // place top 3 matches in summoner stats view
	recentmatches.forEach((e) => {
		const div1 = document.createElement("div");
		div1.setAttribute("id", "mainplayerinfo");
		const div2 = document.createElement("div");
		div2.setAttribute("id", "additionplayerinfo");
		const head = document.createElement("h3");
		head.innerHTML = `GameType: ${e.gameMode}`;
		const mainchamppic = document.createElement("img");
		div1.appendChild(head);
		document.getElementById("outer_rankedcontainer").appendChild(div1);
		document.getElementById("outer_rankedcontainer").appendChild(div2);
		const losingteam = document.createElement("ul");
		losingteam.setAttribute("id", "losing side");
		const winningteam = document.createElement("ul");
		winningteam.setAttribute("id", "winning side");
		div2.appendChild(losingteam);
		div2.appendChild(winningteam);

		div1.setAttribute('onclick', `showNode(${e.gameId})`)
		div2.setAttribute('style', "display:none;")
		div2.setAttribute('class', `${e.gameId}`)

		let playerinfo = e.participants.map((part) => {
			const sumname = e.participantIdentities.find(
				(id) => id.participantId === part.participantId
			).player.summonerName;
			const champimg = champinfobyID(part.championId).image.full;
			return {
				summonername: sumname,
				championimg: champimg,
				teamId: part.teamId,
				role: part.timeline.lane,
				kda: `${part.stats.kills}/${part.stats.deaths}/${part.stats.assists}`,
				result: `${part.stats.win ? "Won" : "Lost"}`,
			};
		});

        let mainplayer = playerinfo.find((mainp) => mainp.summonername.toLowerCase() === message.toLowerCase())

		mainchamppic.setAttribute(
			"src",
			`../GameAssets/11.10.1/img/champion/${mainplayer.championimg}`
		);
		mainchamppic.setAttribute("height", 50);
		mainchamppic.setAttribute("width", 50);
		div1.appendChild(mainchamppic);
		let element = document.createElement("h4");
		element.innerHTML = `${mainplayer.result}`;
		div1.appendChild(element);
		element = document.createElement("h4");
		element.innerHTML = `K/D/A: ${mainplayer.kda}`;
		div1.appendChild(element);
		element = document.createElement("h4");
		element.innerHTML = `Role: ${mainplayer.role}`;
		div1.appendChild(element);

		playerinfo.forEach((player) => {
			if (player.result === "Won") {
				const div = document.createElement("div");
				div.setAttribute("id", "player");
				winningteam.appendChild(div);
				const list = document.createElement("ul");
				div.appendChild(list);
				let item = document.createElement("li");
				item.innerHTML = `Role: ${player.role}`;
				list.appendChild(item);
				item = document.createElement("li");
				item.innerHTML = `K/D/A: ${player.kda}`;
				list.appendChild(item);
				const img = document.createElement("img");
				img.setAttribute(
					"src",
					`../GameAssets/11.10.1/img/champion/${player.championimg}`
				);
				img.setAttribute("height", 25);
				img.setAttribute("width", 25);
				div.appendChild(img);
				item = document.createElement("h5");
				item.innerHTML = player.summonername;
				div.appendChild(item);
			} else {
				const div = document.createElement("div");
				div.setAttribute("id", "player");
				losingteam.appendChild(div);
				const list = document.createElement("ul");
				div.appendChild(list);
				let item = document.createElement("li");
				item.innerHTML = `Role: ${player.role}`;
				list.appendChild(item);
				item = document.createElement("li");
				item.innerHTML = `K/D/A: ${player.kda}`;
				list.appendChild(item);
				const img = document.createElement("img");
				img.setAttribute(
					"src",
					`../GameAssets/11.10.1/img/champion/${player.championimg}`
				);
				img.setAttribute("height", 25);
				img.setAttribute("width", 25);
				div.appendChild(img);
				item = document.createElement("h5");
				item.innerHTML = player.summonername;
				div.appendChild(item);
			}
		});
	});

    matchDtos.forEach(e=>{
        const matchcontainer = document.createElement('div')
        matchcontainer.setAttribute('id', "matchcontainer")
        const mainplayerdiv = document.createElement('div') 
        mainplayerdiv.setAttribute('id', "mainplayer" )
        const mainplayerlist = document.createElement('ul')
        const detailcontainer = document.createElement('div')
        detailcontainer.setAttribute('id', 'detailcontainer')
        const winners = document.createElement('div')
        winners.setAttribute('id', 'winners')
        winners.innerHTML = `<h3>Won</h3>`
        const losers = document.createElement('div')
        losers.setAttribute('id', 'losers')
        losers.innerHTML = `<h3>Lost</h3>`
        matchcontainer.appendChild(mainplayerdiv)
        matchcontainer.appendChild(detailcontainer)
        detailcontainer.appendChild(winners)
        detailcontainer.appendChild(losers)
        mainplayerdiv.appendChild(mainplayerlist)
        document.getElementById('Recent Matches').appendChild(matchcontainer)

		mainplayerlist.setAttribute('onclick', `showNode('A${e.gameId}')`)
		detailcontainer.setAttribute('style', "display:none;")
		detailcontainer.setAttribute('class', `A${e.gameId}`)

             playerinfo = e.participants.map((part) => {
			const sumname = e.participantIdentities.find(
				(id) => id.participantId === part.participantId
			).player.summonerName;
			const champimg = champinfobyID(part.championId).image.full;
            const items = itemsbyid([part.stats.item0, part.stats.item1, part.stats.item2, part.stats.item3, part.stats.item4, part.stats.item5, part.stats.item6])
			const sumspel = sumspellinfobyID([part.spell1Id, part.spell2Id])
            return {
				summonername: sumname,
				championimg: champimg,
                champlevel: part.stats.champLevel,
                goldEarned: part.stats.goldEarned,
                wardsPlaced: part.stats.wardsPlaced,
                itemimgs: items,
                spellimgs: sumspel,
				role: part.timeline.lane,
				kda: `${part.stats.kills}/${part.stats.deaths}/${part.stats.assists}`,
				result: `${part.stats.win ? "Won" : "Lost"}`,
			};
		});

        mainplayer = playerinfo.find((mainp) => mainp.summonername.toLowerCase() === message.toLowerCase())

        mainplayerlist.innerHTML = `
            <img src="../GameAssets/11.10.1/img/champion/${mainplayer.championimg}" />
            <li>${mainplayer.result}</li>
            <li>MatchType: ${e.gameMode}</li>
            <li>K/D/A: ${mainplayer.kda}</li>
            <li>${mainplayer.role}</li>
        `

        playerinfo.forEach(player=>{
            if(player.result === 'Won'){
                const playlist = document.createElement('ul')
                winners.appendChild(playlist)
                playlist.innerHTML= `
                <img src="../GameAssets/11.10.1/img/champion/${player.championimg}" width=50 height=50 />
                        <li>${player.summonername}</li>
                        <li><ul id="sumSpells"><img src='${player.spellimgs[0]}' width=25 height=25/><img src='${player.spellimgs[1]}' width=25 height=25/></ul></li>
                        <li>K/D/A: ${player.kda}</li>
                        <li>Gold: ${player.goldEarned}</li>
                        <li> Wards placed: ${player.wardsPlaced}</li>
                        <li><ul id='items'>${player.itemimgs.map(e=>{
                            return`<img src='${e}' width= 30 height=30 />`
                        }).join('')}</ul></li>
                    `
            } else{
                const playlist = document.createElement('ul')
                losers.appendChild(playlist)
                playlist.innerHTML= `
                        <img src="../GameAssets/11.10.1/img/champion/${player.championimg}" width=50 height=50 />
                        <li>${player.summonername}</li>
                        <li><ul id="sumSpells"><img src='${player.spellimgs[0]}' width=25 height=25/><img src='${player.spellimgs[1]}' width=25 height=25/></ul></li>
                        <li>K/D/A: ${player.kda}</li>
                        <li>Gold: ${player.goldEarned}</li>
                        <li> Wards placed: ${player.wardsPlaced}</li>
                        <li><ul id='items'>${player.itemimgs.map(e=>{
                            return`<img src='${e}' width= 25 height=25 />`
                        }).join('')}</ul></li>
                    `
            }
        })


    })

	try{
			const active = await axios.get(`https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${id}`)
			console.log(active)
			const bannedchamps = document.getElementById('banndeChamps')
			const maindiv = document.getElementById('activematchcontainer')
			const gameStats = document.createElement('div')
			gameStats.innerHTML=`<h3>Game Mode: ${active.data.gameMode}</h3><h3>Game Time: ${Math.floor(active.data.gameLength/60)}</h3>`
			maindiv.appendChild(gameStats)
			active.data.bannedChampions.forEach(champ =>{
				if(champ.championId > 0){
				console.log(champinfobyID(champ.championId))
				const bannedimg = champinfobyID(champ.championId).image.full;
				const newnode = document.createElement('img')
				newnode.setAttribute('src', `../GameAssets/11.10.1/img/champion/${bannedimg}`)
					bannedchamps.appendChild(newnode)
				}
			})
			active.data.participants.forEach(part=>{
				const champ = champinfobyID(part.championId).image.full;
				const spells = sumspellinfobyID([part.spell1Id, part.spell2Id])
				const player = document.createElement('ul')
				const perks = getperkimages(part.perks.perkStyle, part.perks.perkSubStyle, part.perks.perkIds)
				player.innerHTML = `<img src="../GameAssets/11.10.1/img/champion/${champ}" width=50 height=50 />
									<li>${part.summonerName}</li>
									<li><ul id="sumSpells"><img src='${spells[0]}' width=25 height=25/><img src='${spells[1]}' width=25 height=25/></ul></li>
									<li><ul id='perks'>${perks.map(perk=>`<img src='${perk}' width=25 height=25 />`).join('')}</ul></li>
								`
				document.getElementById(`${part.teamId}`).appendChild(player)
			})
		}catch(err){
			console.log(err)
			document.getElementById('activematchcontainer').innerHTML = `<h1>No Active Matches...</h1>`
		}



	document.getElementById("twitch-embedframe").setAttribute('src', `https://player.twitch.tv/?channel=${message}&parent=localhost&muted=true`)




});
