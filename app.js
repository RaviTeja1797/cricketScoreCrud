const express = require("express");
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const expressAppInstance = express();

expressAppInstance.use(express.json());

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let dataBaseConnectionObject = null;



const initializeDBAndServer = async()=>{
    
    try {
            dataBaseConnectionObject = await open({
                filename:dbPath,
                driver:sqlite3.Database
            })

            expressAppInstance.listen(3000, ()=>{
                console.log("Server initialized on http://localhost:3000/")
            })    
    }catch(e){
        console.log(`Database error ${e.message}`)
    }
    
}

initializeDBAndServer();

//API-1 getPlayersList

expressAppInstance.get("/players/", async(request, response)=>{
    const getPlayerListQuery = `SELECT player_id as playerId, player_name as playerName FROM player_details`;
    try{
        const arrayOfPlayerObjects = await dataBaseConnectionObject.all(getPlayerListQuery);
        response.send(arrayOfPlayerObjects);
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
})


//API-2 getSinglePlayer

expressAppInstance.get("/players/:playerId/", async(request, response)=>{
    let {playerId} = request.params;
    playerId= parseInt(playerId)
    
    const getSinglePlayerQuery = `SELECT player_id AS playerId, player_name AS playerName FROM player_details WHERE player_id = ${playerId}`
    try{
        const playerObject = await dataBaseConnectionObject.get(getSinglePlayerQuery);
        response.send(playerObject);
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
})

//API-3 updatePlayerName

expressAppInstance.put("/players/:playerId/", async(request, response)=>{
    let {playerId} = request.params;
    playerId = parseInt(playerId);
    
    const playerObject = request.body;
    const {playerName} = playerObject;
    
    
    const updatePlayerNameQuery = `UPDATE player_details SET player_name = "${playerName}" WHERE player_id = ${playerId}`
    try{
        await dataBaseConnectionObject.run(updatePlayerNameQuery);
        response.send("Player Details Updated")

    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
    
})


//API-4 getMatchDetails 

expressAppInstance.get("/matches/:matchId/", async(request, response)=>{
    let {matchId} = request.params;
    matchId= parseInt(matchId)
    
    const getMatchDetailsQuery = `SELECT match_id AS matchId, match, year FROM match_details WHERE match_id = ${matchId}`
    try{
        const matchObject = await dataBaseConnectionObject.get(getMatchDetailsQuery);
        response.send(matchObject);
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
})


//API-5 getMatchesOfAPlayer
//Returns a list of all the matches of a player

expressAppInstance.get("/players/:playerId/matches/", async(request, response)=>{
    let {playerId} = request.params;
    playerId = parseInt(playerId)

    const getMatchesOfAPlayerQuery = `SELECT match_id AS matchId, match, year FROM
    match_details NATURAL JOIN player_match_score WHERE player_id = ${playerId}`

    try{
        const arrayOfMatches = await dataBaseConnectionObject.all(getMatchesOfAPlayerQuery)
        response.send(arrayOfMatches)
    }catch(e){
        console.log(`Database error ${e.message}`)
    }    
})

//API-6  getPlayerDetailsOfAMatch
//Returns a list of players of a specific match

expressAppInstance.get("/matches/:matchId/players", async(request, response)=>{
    let {matchId} = request.params;
    matchId = parseInt(matchId)

    const getPlayerDetailsOfAMatchQuery = `SELECT player_id AS playerId, player_name AS playerName
    FROM player_match_score NATURAL JOIN player_details WHERE match_id = ${matchId}`

    try{
        const arrayOfPlayerObjects = await dataBaseConnectionObject.all(getPlayerDetailsOfAMatchQuery)
        response.send(arrayOfPlayerObjects)
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
})

//API-7  getScoreStatsOfAPlayer

expressAppInstance.get("/players/:playerId/playerScores/", async(request, response)=>{
    let {playerId} = request.params;
    playerId = parseInt(playerId)

    const getScoresStatsOfPlayerQuery = `SELECT player_id AS playerId, player_name AS playerName, SUM(score) AS totalScore, SUM(fours) AS totalFours, SUM(sixes) AS totalSixes
    FROM player_match_score NATURAL JOIN player_details GROUP BY player_id HAVING player_id=${playerId}`

    try{
        const arrayOfPlayerScoreObjects = await dataBaseConnectionObject.get(getScoresStatsOfPlayerQuery)
        response.send(arrayOfPlayerScoreObjects)
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
})

module.exports = expressAppInstance