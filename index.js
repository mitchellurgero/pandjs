/*
Pandora Web Client built using NodeJS, Bootstrap, and unofficially documented API JSON calls to Pandora's servers.

Written By Mitchell Urgero FROM URGERO.ORG

FOR EDUCATION ONLY. NOT TO BE USED TO ILLEGALLY DOWNLOAD, OR DISTRIBUTE UNLICENSED CONTENT!

*/

//Configuration Options:
var username = "username@domain.com";
var password = "SomeSuperSecretPasswordThatNoOneCanGuess!"; //Might at some point change this to a login page. who knows.


/*
DO NOT TOUCH PAST THIS POINT, THIS IS THE MEAT OF THE WEB UI FOR PANDORA - IT HANDLES ERRORS, ETC. SHOULD NOT BE TOUCH UNLESS YOU KNOW PANDORA API.
*/
var connect = require('connect');
var serveStatic = require('serve-static');
var Anesidora = require("anesidora");
var pandora = new Anesidora(username, password);
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var currentStation = 0;
var curStationToken;
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static('www'));
app.post('/controls', function(req, res) {
	console.info(req.body);
	switch(req.body.type){
		case "next":
			var pandora_data;
			try{
				pandora.request("user.getStationList", function(err, stationList) {
					if(err){
						console.log("Error next:");
						console.info(err);
						res.send("Below is an error from Pandora: <br />" + err.toString());
						pandora = new Anesidora(username, password);
						login();
						return;
					}
					for(i = 0; i < stationList.stations.length; i++){
						if(stationList.stations[i].stationToken == curStationToken){
							currentStation = i;
						}
					}
        			var station = stationList.stations[currentStation];
        			pandora.request("station.getPlaylist", {
	            		"stationToken": station.stationToken,
            			"additionalAudioUrl": "HTTP_64_AACPLUS" //change to HTTP_64_AACPLUS for higher quality?
        			}, function(err, playlist) {
        				if(err){
							console.log("Error next['station.getPlaylist']:");
							console.info(err);
							res.send("Below is an error from Pandora: <br />" + err.toString());
							pandora = new Anesidora(username, password);
							login();
							return;
						}
            			var track = playlist.items[0];
            			console.log("Playing '" + track.songName + "' by " + track.artistName);
            			console.log(track.additionalAudioUrl);
            			res.send("Playing '" + track.songName + "' by " + track.artistName + ":::" + track.additionalAudioUrl);
        			});
    			});	
			}catch(ex){
				res.send("Unable to play song! :(<br />" + ex.Message);
			}
			break;
		case "stations":
			console.log("Sending stations...");
			try{
				var stations;
				pandora.request("user.getStationList", function(err, stationList) {
					if(err){
						console.log("Error stations:");
						console.info(err);
						res.send("Below is an error from Pandora: <br />" + err.toString());
						pandora = new Anesidora(username, password);
						login();
						return;
					}
	        		res.send(JSON.stringify(stationList.stations));
    			});
			}catch(ex){
				res.send("Unable to get stations!");
			}
			break;
		case "set":
			curStationToken = req.body.token;
			console.log("Changing Station to " + curStationToken + "...");
			res.send("Changing Station to " + curStationToken + "...");
			break;
		case "reset":
			login();
			break;
		case "info":
			res.send(username + "'s Pandora :)");
			
			break;
	}
});
login();
app.listen(8080, function() {
  console.log('Pandora Controls listening on 8080...');
});

function login(){
	console.log("Login to pandora as user " + username);
	pandora.login(function(err) {
    	if(err){
    		console.log("Error login:");
    		console.info(err);
    		return;
    	}
	});
}

	