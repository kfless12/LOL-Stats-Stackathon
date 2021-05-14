const blankhtml =  `<!-- Tab links -->
<div class="tab">
  <button class="tablinks" onclick="openPage(event, 'Summoner Stats')">Summoner Stats</button>
  <button class="tablinks" onclick="openPage(event, 'Recent Matches')">Recent Matches</button>
  <button class="tablinks" onclick="openPage(event, 'Active Match')">Active Match</button>
  <button class="tablinks" onclick="openPage(event, 'Twitch')">twitch</button>
  <button class="tablinks" onclick="openPage(event, 'TFT Stats')">TFT Stats</button>
  <button class="tablinks" onclick="openPage(event, 'Valorant Stats')">Valorant Stats</button>
</div>

<!-- Tab content -->
<div id="Summoner Stats" class="tabcontent">
	<h1> Summoner Statistics and Information</h1>
  <h1 id="summonerName"></h1>
  <img id="profileIcon" src="" alt="Loading..." width="80" height="80" />
  <div id='left_right_container'>
    <div id='left_container'>
      <ul id = "Solorankstats">
        <p id="Solorank"></p>
        <p id="wins"></p>
        <p id="losses"></p>
        <p id="win loss ratio"></p>
      </ul>
      <h2>top 3 champions played</h2>
      <ul id="top3champs"></ul>
    </div>
    <div id='right_container'>
      <ul id='outer_rankedcontainer'>
      </ul>
    </div>
  </div>    
</div>

<div id="Recent Matches" class="tabcontent">
  <h1>Recent Matches</h1>
</div>


<div id="Active Match" class="tabcontent">
  <h3>Active Match</h3>
  <body id="activematchcontainer">
  </body>
 
</div>
<div id="Twitch" class="tabcontent">
  <h3>twitch</h3>
  <div id="twitch-embed"><iframe id="twitch-embedframe"width=1100 height=800></iframe></div>

  

    <!-- Create a Twitch.Embed object that will render within the "twitch-embed" element -->
    
 
</div>
<div id="TFT Stats" class="tabcontent">
  <h3>TFT Stats</h3>
 
</div>
<div id="Valorant Stats" class="tabcontent">
  <h3>Valorant Stats</h3>
 
</div>
<script src = 'windowhtml.js'></script>`

module.exports = blankhtml