/*
Commande pour executer le script
bin/phantomjs [phantom arguments]
*/
var DEBUG = false;
var system = require('system');
var fs = require('fs');
var lang = "";
var page = require("webpage").create();
var started_time = Date.now();
var uri = "";
// xbox deals 	https://www.microsoft.com/fr-fr/store/collections/xboxdealsfr-fr?icid=Cat-Sales-LinkNav-2-XboxDeals-022018 					->ok
// consoles		https://www.microsoft.com/fr-fr/store/collections/xboxconsoles/pc?cat0=devices&icid=Cat-Xbox-Nav-1-Consoles-042517-fr_FR  	->ok
// https://www.microsoft.com/it-it/store/collections/xboxconsoles?icid=Cat-Xbox-Nav-1-Consoles

if ( system.args.length > 1) {
	lang = system.args[1];
	uri = "https://www.microsoft.com/" + lang +"/store/collections/xboxconsoles";
	DEBUG && console.log("Begin : xbox " + lang );
	DEBUG && console.log("|-> " + uri );

	page.open(uri, function(status) {
		if(status === "success") {
			
			try {
				fs.write("./scripts/tmp/xbox/xbox_" + lang + ".html", page.content, 'w');
				started_time = Date.now() - started_time;
				DEBUG && console.log("Write on : " + "./tmp/xbox/xbox_"+lang+".html - " + (started_time  / 1000) + " sec.");
				phantom.exit();
			} catch (e) {
				DEBUG && console.log(e);
				phantom.exit();
			}
		} else {
			DEBUG && console.log("ERROR. Ending...");
			phantom.exit();
		}
	});
} else {
	DEBUG && console.log("INVALID ARGS. Ending...");
	phantom.exit();
}
