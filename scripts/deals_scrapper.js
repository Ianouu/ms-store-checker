/*
Commande pour executer le script
bin/phantomjs [phantom arguments]
*/
var DEBUG = true;
var system = require('system');
var fs = require('fs');
var lang = "";
var page = require("webpage").create();
var started_time = Date.now();
var uri = "";
//https://www.microsoft.com/it-it/store/collections/xboxdeals?icid=Cat-Sale-Xbox

if ( system.args.length > 1) {
	lang = system.args[1];
	uri = "https://www.microsoft.com/" + lang + "/store/collections/xboxdeals?icid=Cat-Sale-Xbox";
	DEBUG && console.log("Begin : deal " + lang );
	DEBUG && console.log("|-> " + uri );

	page.open(uri, function(status) {
		if(status === "success") {
			
			try {
				fs.write("./scripts/tmp/deals/deals_" + lang + ".html", page.content, 'w');
				started_time = Date.now() - started_time;
				DEBUG && console.log("Write on : " + "./tmp/deals/deals_"+lang+".html - " + (started_time  / 1000) + " sec.");
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
