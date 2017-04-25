/*
Pandora Web Client built using NodeJS, Bootstrap, and unofficially documented API JSON calls to Pandora's servers.

Written By Mitchell Urgero FROM URGERO.ORG

FOR EDUCATION ONLY. NOT TO BE USED TO ILLEGALLY DOWNLOAD, OR DISTRIBUTE UNLICENSED CONTENT!

*/

//Do not change these unless you know what you are doing!!!
var username = "";
var password = "";


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
            			"additionalAudioUrl": "HTTP_64_AACPLUS"
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
		case "login":
			if(username == "" || (username == req.body.user && password == req.body.password)){
				username = req.body.user;
				password = req.body.password;
				console.log("Login to pandora as user " + username);
				if(pandora == null){
						pandora = new Anesidora(username, password);
				}
				var iflogin = pandora.login(function(err) {
					if(err){
						console.log("Error login:");
						console.info(err);
						username = "";
						password = "";
						pandora = null;
						console.log("Could not login!");
						res.send("Could not login. If there is an error to display it will be below. <br> " + err);
						return false;
					} else {
						console.log("Logged in!");
						res.send("true");
						return true;
					}
				});
			} else {
				res.send("Someone is already logged in and the server only supports one session at a time! Please see server logs for details!");
			}
			break;
		case "logout":
			if(req.body.user == username && req.body.password == password && username != ""){
				username = "";
				password = "";
				pandora = null;
				res.send("true");
			} else {
				res.send("Already logged out!");
			}
			break;
		case "info":
			res.send(username + "'s Pandora :)");
			
			break;
	}
});
//login();
app.listen(8080, function() {
  console.log('Pandora Controls listening on 8080...');
});
function login(){
	if(pandora == null){
		pandora = new Anesidora(username, password);
	}
	var iflogin = pandora.login(function(err) {
		if(err){
			console.log("Error login:");
			console.info(err);
			username = "";
			password = "";
			pandora = null;
			console.log("Could not login!");
			res.send("Could not login. If there is an error to display it will be below. <br> " + err);
			return false;
		} else {
			console.log("Logged in!");
			res.send("true");
			return true;
		}
	});	
}