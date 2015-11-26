/**
 * Movian plugin to watch bs.to streams 
 *
 * Copyright (C) 2015 BuXXe
 *
 *     This file is part of bs.to Movian plugin.
 *
 *  bs.to Movian plugin is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  bs.to Movian plugin is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with bs.to Movian plugin.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Download from : https://github.com/BuXXe/movian-bs-plugin
 *
 */
   var html = require('showtime/html');

(function(plugin) {

  var PLUGIN_PREFIX = "bs.to:";

  // INFO: Helpful Post Data reader: http://www.posttestserver.com/
  // Resolver-info: 
  // Streamcloud -> resolver working / video working
  // Vivo -> resolver working / video not working (perhaps due to mp4 file format which has also shown bad performance at cloudtime)
  // FlashX -> resolver working / video working -> seems to have only english episodes?
  // Powerwatch -> resolver working / video working
  // Cloudtime -> resolver working / video working (Mobile mp4 version in code had bad performance)
  // Movshare -> resolver working / video working
  // NowVideo -> resolver working / video working
  // VideoWeed -> resolver working / video working
  // YouWatch -> resolver not working 
  // Novamov -> resolver working / video working
  // Ecostream -> resolver working / video working
  // Shared -> resolver working / video working
  // Filenuke -> resolver working / video not working 
  
  
  	// Create / Get the storage for favorite series
	var store = plugin.createStore('personalStorage', true)
	
	// Favorite series  
	if (!store.favorites) {
        store.favorites = "[]";
    }
  
  //---------------------------------------------------------------------------------------------------------------------
  
  // returns list [link, filelink] or null if no valid link
  function resolveStreamcloudeu(StreamSiteVideoLink)
  {
	  	var postdata;
	  	var validentries = false;
	  	
    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink);
    	var pattern = new RegExp('<input type="hidden" name="op" value="(.*?)">[^<]+<input type="hidden" name="usr_login" value="(.*?)">[^<]+<input type="hidden" name="id" value="(.*?)">[^<]+<input type="hidden" name="fname" value="(.*?)">[^<]+<input type="hidden" name="referer" value="(.*?)">[^<]+<input type="hidden" name="hash" value="(.*?)">[^<]+<input type="submit" name="imhuman" id="btn_download" class="button gray" value="(.*?)">');
	    var res = pattern.exec(getEmissionsResponse.toString());
	    
	    // File Not Found (404) Error 
	    if(res != null)
	    {
	    	postdata = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
	    	validentries = true;
	    }
	    
	    if(!validentries)
	      	return null;
	    
	    // POST DATA COLLECTED
	    // WAIT 11 SECONDS
	    for (var i = 0; i < 12; i++) {
	    	showtime.notify("Waiting " + (11-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(StreamSiteVideoLink, { postdata: postdata, method: "POST" });
		    	
    	var videopattern = new RegExp('file: "(.*?)",');
    	var res2 = videopattern.exec(postresponse.toString());
     	
    	return [StreamSiteVideoLink,res2[1]];
  }
 
  //returns list [link, filelink] or null if no valid link
  function resolveVivosx(StreamSiteVideoLink)
  {
	  	var postdata;
	  	var validentries = false;
	  	
	  	// get form
    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink);
    	
    	var dom = html.parse(getEmissionsResponse.toString());
		
    	try{
    		var hash = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
    		var timestamp = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[1].attributes.getNamedItem("value").value;
    	}catch(e)
    	{
    		// there was an error so no valid links?
    		return null
    	}
    	
	    postdata = {hash: hash, timestamp: timestamp};
	    
	    // POST DATA COLLECTED
	    // WAIT 8 SECONDS
	    for (var i = 0; i < 9; i++) {
	    	showtime.notify("Waiting " + (8-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(StreamSiteVideoLink, { postdata: postdata, method: "POST" });
		    	
	    dom = html.parse(postresponse.toString());
	    var link = dom.root.getElementByClassName('stream-content')[0].attributes.getNamedItem("data-url").value;
	    // TODO: perhaps take the data-name attribute as first entry cause it shows the original filename
	    
    	return [StreamSiteVideoLink,link];
  }
 
  //returns list [link, filelink] or null if no valid link
  function resolveFlashxtv(StreamSiteVideoLink)
  {
	  	var postdata;
	  	
    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink);
    	var dom = html.parse(getEmissionsResponse.toString());
    	var res = [];
    	
    	try
    	{
	    	res[1] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
	    	res[2] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[1].attributes.getNamedItem("value").value;
	    	res[3] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[2].attributes.getNamedItem("value").value;
	    	res[4] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[3].attributes.getNamedItem("value").value;
	    	res[5] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[4].attributes.getNamedItem("value").value;
	    	res[6] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[5].attributes.getNamedItem("value").value;
	    	res[7] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[6].attributes.getNamedItem("value").value;
    	}
    	catch(e)
    	{
    		// seems like the file is not available
    		return null
    	}

    	postdata = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
	    
	    // POST DATA COLLECTED
	    // WAIT 7 SECONDS
	    for (var i = 0; i < 8; i++) {
	    	showtime.notify("Waiting " + (7-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(StreamSiteVideoLink, { postdata: postdata, method: "POST" });
	     
	    dom = html.parse(postresponse.toString());
	    
	    // put vid link together
	    // get cdn server number and luq4 hash
	    var cdn = dom.root.getElementById('vplayer').getElementByTagName("img")[0].attributes.getNamedItem("src").value;
	    cdn = /.*thumb\.(.*)\.fx.*/gi.exec(cdn)[1]    	    	   
	    var luqhash = /\|luq4(.*)\|play/gi.exec(postresponse.toString())[1];
	    var finallink = "http://play."+cdn+".fx.fastcontentdelivery.com/luq4"+luqhash+"/normal.mp4";
    	
	    return [StreamSiteVideoLink,finallink];
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolvePowerwatchpw(StreamSiteVideoLink)
  {
	  	var postdata;
	  	
    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink);
    	var dom = html.parse(getEmissionsResponse.toString());
    	var res = [];
    	
    	try
    	{
	    	res[1] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
	    	res[2] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[1].attributes.getNamedItem("value").value;
	    	res[3] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[2].attributes.getNamedItem("value").value;
	    	res[4] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[3].attributes.getNamedItem("value").value;
	    	res[5] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[4].attributes.getNamedItem("value").value;
	    	res[6] = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[5].attributes.getNamedItem("value").value;
    	}
    	catch(e)
    	{
    		// seems like the file is not available
    		return null
    	}

    	postdata = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6]};
	    
	    // POST DATA COLLECTED
	    // WAIT 7 SECONDS
	    for (var i = 0; i < 8; i++) {
	    	showtime.notify("Waiting " + (7-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(StreamSiteVideoLink, { postdata: postdata, method: "POST" });
	     
	    var finallink = /file:"(.*)",label/gi.exec(postresponse.toString())
	    
	    return [StreamSiteVideoLink,finallink[1]];
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveCloudtimeto(StreamSiteVideoLink)
  {
	  	// This gets the mobile version of the video file (mp4)
	  	// due to bad performance this is not used
	  	/*var videohash= StreamSiteVideoLink.split("/");
	  	videohash = videohash[videohash.length-1];
  		getEmissionsResponse = showtime.httpGet("http://www.cloudtime.to/mobile/video.php?id="+videohash);
  	    var finallink = /<source src="(.*)" type="video\/mp4">/gi.exec(getEmissionsResponse.toString());
    	return [StreamSiteVideoLink,finallink[1]];*/
    	
    	// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
    	var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink,{noFollow:true,compression:true});
  		  	
    	try
    	{
	    	var cid = /flashvars.cid="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
	    	var key = /flashvars.filekey="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
	    	var file = /flashvars.file="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
    	}catch(e)
    	{
    		return null;
    	}
    	
	    var postresponse = showtime.httpReq("http://www.cloudtime.to/api/player.api.php", {method: "GET" , args:{
	    	user:"undefined",
	    		cid3:"bs.to",
	    		pass:"undefined",
	    		cid:cid,
	    		cid2:"undefined",
	    		key:key,
	    		file:file,
	    		numOfErrors:"0"
	    }});
		    
	    var finallink = /url=(.*)&title/.exec(postresponse.toString());
	        	
    	return [StreamSiteVideoLink,finallink[1]];
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveMovsharenet(StreamSiteVideoLink)
  {
	  	// OLD Resolver
	  	/*// it seems like the links to movshare miss the www
	  	// we add this here cause otherwise the request would fail due to noFollow 
	  	var correctedlink = StreamSiteVideoLink.replace("http://","http://www.");
	  	
	  	// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
    	var getEmissionsResponse = showtime.httpReq(correctedlink,{noFollow:true,compression:true});
    	try
    	{
	    	var cid = /flashvars.cid="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
	    	var key = /flashvars.filekey="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
	    	var file = /flashvars.file="(.*)";/gi.exec(getEmissionsResponse.toString())[1];
    	}catch(e)
    	{
    		return null;
    	}
    	
	    var postresponse = showtime.httpReq("http://www.movshare.net/api/player.api.php", {method: "GET" , args:{
	    	user:"undefined",
	    		cid3:"bs.to",
	    		pass:"undefined",
	    		cid:cid,
	    		cid2:"undefined",
	    		key:key,
	    		file:file,
	    		numOfErrors:"0"
	    }});
		    
	    var finallink = /url=(.*)&title/.exec(postresponse.toString());
	        	
    	return [StreamSiteVideoLink,finallink[1]];*/
		// it seems like the links to Movshare miss the www
	  	// we add this here cause otherwise the request would fail due to noFollow 
	  	var correctedlink = StreamSiteVideoLink.replace("http://","http://www.");
	  	var postdata;

	  	// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
	  	var getEmissionsResponse = showtime.httpReq(correctedlink,{noFollow:true,compression:true});
	  	
	  	var dom = html.parse(getEmissionsResponse.toString());
	  	var stepkey;
	  	
	  	try
	  	{
	  		stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
	  	}
	  	catch(e)
	  	{
	  		// seems like the file is not available
	  		return null
	  	}
	
	  	postdata = {stepkey:stepkey};
		     
		    // POSTING DATA
		    var postresponse = showtime.httpReq(correctedlink, {noFollow:true,compression:true,postdata: postdata, method: "POST" });
		    
		    try
	  	{
		    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
		    	var key = /flashvars.filekey="(.*)";/gi.exec(postresponse.toString())[1];
		    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
	  	}catch(e)
	  	{
	  		return null;
	  	}
	  	
		    var postresponse = showtime.httpReq("http://www.movshare.net/api/player.api.php", {method: "GET" , args:{
		    	user:"undefined",
		    		cid3:"bs.to",
		    		pass:"undefined",
		    		cid:cid,
		    		cid2:"undefined",
		    		key:key,
		    		file:file,
		    		numOfErrors:"0"
		    }});
			    
		    var finallink = /url=(.*)&title/.exec(postresponse.toString());
		        	
	  	return [StreamSiteVideoLink,finallink[1]];
	  
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveNowvideoto(StreamSiteVideoLink)
  {
	  	// it seems like the links to nowvideo miss the www
	  	// we add this here cause otherwise the request would fail due to noFollow 
	  	var correctedlink = StreamSiteVideoLink.replace("http://","http://www.");
	  	var postdata;

	  	// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
    	var getEmissionsResponse = showtime.httpReq(correctedlink,{noFollow:true,compression:true});
    	
    	var dom = html.parse(getEmissionsResponse.toString());
    	var stepkey;
    	
    	try
    	{
    		stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
    	}
    	catch(e)
    	{
    		// seems like the file is not available
    		return null
    	}

    	postdata = {stepkey:stepkey};
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(correctedlink, {noFollow:true,compression:true,postdata: postdata, method: "POST" });
	    
	    try
    	{
	    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
	    	var key = /var fkzd="(.*)";/gi.exec(postresponse.toString())[1];
	    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
    	}catch(e)
    	{
    		return null;
    	}
    	
	    var postresponse = showtime.httpReq("http://www.nowvideo.to/api/player.api.php", {method: "GET" , args:{
	    	user:"undefined",
	    		cid3:"bs.to",
	    		pass:"undefined",
	    		cid:cid,
	    		cid2:"undefined",
	    		key:key,
	    		file:file,
	    		numOfErrors:"0"
	    }});
		    
	    var finallink = /url=(.*)&title/.exec(postresponse.toString());
	        	
    	return [StreamSiteVideoLink,finallink[1]];
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveVideoweedes(StreamSiteVideoLink)
  {
	  	// it seems like the links to videoweed miss the www
	  	// we add this here cause otherwise the request would fail due to noFollow
	  	var correctedlink = StreamSiteVideoLink.replace("http://","http://www.");
    	
	  	// The Request needs to have specific parameters, otherwise the response object is the mobile version of the page
    	var getEmissionsResponse = showtime.httpReq(correctedlink,{noFollow:true,compression:true});
    	
    	var dom = html.parse(getEmissionsResponse.toString());
    	var stepkey;
    	
    	try
    	{
    		stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
    	}
    	catch(e)
    	{
    		// seems like the file is not available
    		return null
    	}

    	postdata = {stepkey:stepkey};
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(correctedlink, {noFollow:true,compression:true,postdata: postdata, method: "POST" });

    	try
    	{
	    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
	    	var key = /flashvars.filekey="(.*)";/gi.exec(postresponse.toString())[1];
	    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
    	}catch(e)
    	{
    		return null;
    	}
    	
	    var postresponse = showtime.httpReq("http://www.videoweed.es/api/player.api.php", {method: "GET" , args:{
	    	user:"undefined",
	    		cid3:"bs.to",
	    		pass:"undefined",
	    		cid:cid,
	    		cid2:"undefined",
	    		key:key,
	    		file:file,
	    		numOfErrors:"0"
	    }});
		    
	    var finallink = /url=(.*)&title/.exec(postresponse.toString());
	        	
    	return [StreamSiteVideoLink,finallink[1]];
  }
    
  //returns list [link, filelink] or null if no valid link
  function resolveYouwatchorg(StreamSiteVideoLink)
  {
	  	// TODO: Does not work because the streaming site uses iframes to integrate the videoplayer
	    // for some reason, the iframe link cannot be requested and leads to a http error -1 in movian
	  	var hash = StreamSiteVideoLink.split("/");
	  	hash = hash[hash.length -1];
    	
    	var getEmissionsResponse = showtime.httpReq("http://youwatch.org/embed-"+hash+".html",{noFollow:true,compression:true});
    	showtime.trace(getEmissionsResponse.toString());

    	var dom = html.parse(getEmissionsResponse.toString());
    	var link = dom.root.getElementByTagName("iframe")[0].attributes.getNamedItem("src").value;
    	var number = link.split("?")[1];
    	link = link.split("?")[0];

    	getEmissionsResponse = showtime.httpReq(link,{noFollow:true,compression:true});
    	showtime.trace(getEmissionsResponse.toString());
    	return null;
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveNovamowcom(StreamSiteVideoLink)
  {
	  	// it seems like the links to novamov miss the www
	  	// we add this here cause otherwise the request would fail due to noFollow 
	  	var correctedlink = StreamSiteVideoLink.replace("http://","http://www.");
	  	var postdata;
    	var getEmissionsResponse = showtime.httpReq(correctedlink,{noFollow:true,compression:true});
    	
    	var dom = html.parse(getEmissionsResponse.toString());
    	var stepkey;
    	
    	try
    	{
    		stepkey = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
    	}
    	catch(e)
    	{
    		// seems like the file is not available
    		return null
    	}

    	postdata = {stepkey:stepkey};
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(correctedlink, {noFollow:true,compression:true,postdata: postdata, method: "POST" });
	    
	    try
    	{
	    	var cid = /flashvars.cid="(.*)";/gi.exec(postresponse.toString())[1];
	    	var key = /flashvars.filekey="(.*)";/gi.exec(postresponse.toString())[1];
	    	var file = /flashvars.file="(.*)";/gi.exec(postresponse.toString())[1];
    	}catch(e)
    	{
    		return null;
    	}
    	
	    var postresponse = showtime.httpReq("http://www.novamov.com/api/player.api.php", {method: "GET" , args:{
	    	user:"undefined",
	    		cid3:"bs.to",
	    		pass:"undefined",
	    		cid:cid,
	    		cid2:"undefined",
	    		key:key,
	    		file:file,
	    		numOfErrors:"0"
	    }});
		    
	    var finallink = /url=(.*)&title/.exec(postresponse.toString());
	        	
    	return [StreamSiteVideoLink,finallink[1]];
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveEcostreamtv(StreamSiteVideoLink)
  {
	  	var postdata;
    	var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink,{noFollow:true,compression:true});
    	var dom = html.parse(getEmissionsResponse.toString());
    	
    	var dataid= dom.root.getElementById('play').attributes.getNamedItem("data-id").value;
    	var footerhash = /var footerhash='(.*)';/gi.exec(getEmissionsResponse.toString())[1];
    	var superslots = /var superslots='(.*)';/gi.exec(getEmissionsResponse.toString())[1];
    	
    	postdata = {id:dataid,tpm:footerhash+superslots};

	    // POSTING DATA
    	// Important thing here: we need the header addition otherwise we get a 404
	    var postresponse = showtime.httpReq("http://www.ecostream.tv/xhr/videos/wOIriO01", {headers:{'X-Requested-With':'XMLHttpRequest'},compression:true,postdata: postdata, method: "POST" });
	    
	    // we are getting json back
	    var finallink = "http://www.ecostream.tv"+showtime.JSONDecode(postresponse.toString()).url;
	        	
    	return [StreamSiteVideoLink,finallink];
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveSharedsx(StreamSiteVideoLink)
  {
	  	var postdata;
	  	
    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink);
    	var dom = html.parse(getEmissionsResponse.toString());
    	
    	try {
	    	var hash = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[0].attributes.getNamedItem("value").value;
		    var expires = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[1].attributes.getNamedItem("value").value;
		    var timestamp = dom.root.getElementByTagName('form')[0].getElementByTagName("input")[2].attributes.getNamedItem("value").value;
    	}catch(e)
	    {
	    	return null;
	    }
    	
    	postdata = {hash:hash,expires:expires, timestamp:timestamp};
	    
	    // POST DATA COLLECTED
	    // WAIT 12 SECONDS
	    for (var i = 0; i < 13; i++) {
	    	showtime.notify("Waiting " + (12-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	     
	    // POSTING DATA
	    var postresponse = showtime.httpReq(StreamSiteVideoLink, { postdata: postdata, method: "POST" });
	    dom = html.parse(postresponse.toString());
	    
	    var finallink = dom.root.getElementByClassName('stream-content')[0].attributes.getNamedItem("data-url").value

    	return [StreamSiteVideoLink,finallink];
  }
  
  //returns list [link, filelink] or null if no valid link
  function resolveFilenukecom(StreamSiteVideoLink)
  {
    	var getEmissionsResponse = showtime.httpReq(StreamSiteVideoLink,{noFollow:true,compression:true});
    	var dom = html.parse(getEmissionsResponse.toString());
    	var link= dom.root.getElementById('go-next').attributes.getNamedItem("href").value;
    	var postresponse = showtime.httpReq("http://filenuke.com"+link, {noFollow:true,compression:true});
	    var finallink = /var lnk234 = '(.*)';/gi.exec(postresponse.toString())[1];
    	return [StreamSiteVideoLink,finallink];
  }
  
  var availableResolvers=["Streamcloud","Vivo", "FlashX","PowerWatch","CloudTime","MovShare","NowVideo","VideoWeed","Novamov","Ecostream","Shared","FileNuke"];
  
  
  function resolveHoster(link, hostername)
  {
		var FinalLink;
		
		// Streamcloud.eu
		if(hostername == "Streamcloud")
		{
			FinalLink = resolveStreamcloudeu(link);
		}
		// Vivo.sx
		if(hostername == "Vivo")
		{
			FinalLink = resolveVivosx(link);
		}
		// FlashX.tv
		if(hostername == "FlashX")
		{
			FinalLink = resolveFlashxtv(link);
		}
		// Powerwatch.pw
		if(hostername == "PowerWatch")
		{
			FinalLink = resolvePowerwatchpw(link);
		}
		// Cloudtime.to
		if(hostername == "CloudTime")
		{
			FinalLink = resolveCloudtimeto(link);
		}
		// Movshare.net
		if(hostername == "MovShare")
		{
			FinalLink = resolveMovsharenet(link);
		}
		// NowVideo.to
		if(hostername == "NowVideo")
		{
			FinalLink = resolveNowvideoto(link);
		}
		// VideoWeed.es
		if(hostername == "VideoWeed")
		{
			FinalLink = resolveVideoweedes(link);
		}
		// Novamov.com
		if(hostername == "Novamov")
		{
			FinalLink = resolveNovamowcom(link);
		}
		// Ecostream.tv
		if(hostername == "Ecostream")
		{
			FinalLink = resolveEcostreamtv(link);
		}
		// Shared.sx
		if(hostername == "Shared")
		{
			FinalLink = resolveSharedsx(link);
		}
		// FileNuke.com
		if(hostername == "FileNuke")
		{
			FinalLink = resolveFilenukecom(link);
		}
		
		return FinalLink;
  }
  
  
  // resolves the hoster link and gives the final link to the stream file
  plugin.addURI(PLUGIN_PREFIX + ":EpisodesHandler:(.*):(.*)", function(page,episodeLink, hostername){
	  	page.type = 'directory';

		var getHosterLink = showtime.httpGet("http://bs.to/"+episodeLink);
		var dom = html.parse(getHosterLink.toString());
		var directlink = dom.root.getElementById('video_actions').getElementByTagName("a")[0].attributes.getNamedItem("href").value;

		var vidlink = resolveHoster(directlink, hostername)
		if(vidlink == null)
    		page.appendPassiveItem('video', '', { title: "File is not available"  });
		else
		page.appendItem(vidlink[1], 'video', { title: vidlink[0] });
  });
  
  // check if the resolver for the given hoster is implemented
  function checkResolver(hostername)
  {
	  if(availableResolvers.indexOf(hostername) > -1)
	  {
		  return " <font color=\"009933\">[Working]</font>";
	  }
	  else{
		  return " <font color=\"CC0000\">[Not Working]</font>";
	  }
  }
  
  plugin.addURI(PLUGIN_PREFIX + ":ShowHostsForEpisode:(.*)", function(page,episodeLink){
	  page.type = 'directory';

	  	var getHosterLink = showtime.httpGet("http://bs.to/"+episodeLink);
		var dom = html.parse(getHosterLink.toString());
	  	
		// we have the episodes page and the li with class "current" which is the current season and the other is current episode
		var hosters = dom.root.getElementByClassName('current')[1].getElementByTagName("a");
	  	
		// first anchor is the current episode, the rest are hoster links
		for(var k=1; k< hosters.length; k++)
	    {
	    	var hostname = hosters[k].attributes.getNamedItem("class").value.replace("v-centered icon ","");
	    	var hosterlink  = hosters[k].attributes.getNamedItem("href").value;
	    	
	    	var resolverstatus = checkResolver(hostname);
	    	
	    	if(resolverstatus.indexOf("Not Working")>1)
	    	{
	    		page.appendPassiveItem('video', '', { title: new showtime.RichText(hostname + resolverstatus)  });
	    	}
	    	else
	    	{
				page.appendItem(PLUGIN_PREFIX + ":EpisodesHandler:" + hosterlink+":"+hostname , 'directory', {
					  title: new showtime.RichText(hostname + resolverstatus) 
				  });
	    	}
	    }
  });
  
  // Lists the available episodes for a given season
  plugin.addURI(PLUGIN_PREFIX + ":SeasonHandler:(.*)", function(page,seasonLink){
	  page.type = 'directory';
	  
	  var SeasonResponse = showtime.httpGet("http://bs.to/"+seasonLink);
	  var dom = html.parse(SeasonResponse.toString());
	  var tablerows = dom.root.getElementById('sp_left').getElementByTagName("table")[0].getElementByTagName("tr");
	  
	  // ignore first header row
	  for (var i = 1; i < tablerows.length;i++)
	  {
		  var episodeNumber = tablerows[i].getElementByTagName("td")[0].textContent;
		  var episodeLink = tablerows[i].getElementByTagName("td")[1].getElementByTagName("a")[0].attributes.getNamedItem("href").value;
		  
		  // TODO: use real entry instead of create from href. Problem so far: <strong> and <span> tags 
		  var episodename = episodeLink.split("/")[episodeLink.split("/").length-1];
		  
		  page.appendItem(PLUGIN_PREFIX + ":ShowHostsForEpisode:" + episodeLink , 'directory', {
			  title: "Episode " + episodename
		  });
	  }
  });
  
  // Series Handler: show seasons for given series link
  plugin.addURI(PLUGIN_PREFIX + ':SeriesSite:(.*)', function(page, series) {
	  	page.loading = false;
	  	page.type = 'directory';
	  	page.metadata.title = series.split("serie/")[1];

	    var seriespageresponse = showtime.httpGet('http://bs.to/'+series);
	  	var dom = html.parse(seriespageresponse.toString());
	  	var pages = dom.root.getElementById('sp_left').getElementByClassName("pages")[0].getElementByTagName("li");
	  	
	  	// INFO: all entries are seasons except for the last one which is a random episode link
    	for (var k = 0; k< pages.length-1; k++)
    	{	
    		var ancor = pages[k].getElementByTagName("a")[0];
    		var seasonNumber = ancor.textContent;
    		var seasonLink = ancor.attributes.getNamedItem("href").value;
    		
    		page.appendItem(PLUGIN_PREFIX + ":SeasonHandler:"+ seasonLink, 'directory', {
    			  title: "Season " + seasonNumber
    			});
    	}
		page.loading = false;
	});
  
  // Shows a list of all series alphabetically 
  plugin.addURI(PLUGIN_PREFIX + ':Browse', function(page) {
	  	page.type = "directory";
	    page.metadata.title = "bs.to series list";
	    
	  	var BrowseResponse = showtime.httpGet("http://bs.to/serie-alphabet");
	  	var dom = html.parse(BrowseResponse.toString());
	  	 
	  	var entries =  dom.root.getElementById('series-alphabet-list').getElementByTagName("li");
	  	
	  	for(var k=0; k< entries.length; k++)
	    {
	    	var ancor = entries[k].getElementByTagName("a")[0];
	    	var streamLink  = ancor.attributes.getNamedItem("href").value;
	    	var title = ancor.textContent;
   	
	    	var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ streamLink, 'directory', { title: title });
	    	
			item.addOptAction("Add series '" + title + "' to favorites", k);
		    item.onEvent(k, function(item) 
    		{
    			var obj = showtime.JSONDecode(store.favorites);
    			var ancor = entries[item].getElementByTagName("a")[0];
    	    	var streamLink  = ancor.attributes.getNamedItem("href").value;
    	    	var title = ancor.textContent;
    			
    			obj.push({link:streamLink, title:title});
    			store.favorites = showtime.JSONEncode(obj);
    		});
	    }
  });
  
//Search param indicates the search criteria: Artist, Album, Track
  plugin.addURI(PLUGIN_PREFIX+":Search", function(page) {
	  page.type="directory";
  
	  var res = showtime.textDialog("What series do you want to search for?", true,true);
	  
	  // check for user abort
	  if(res.rejected)
		  page.redirect(PLUGIN_PREFIX+"start");
	  else
	  {
		  page.metadata.title = "Search for series containing: "+ res.input;
		  var noEntry = true;
		  var BrowseResponse = showtime.httpGet("http://bs.to/serie-alphabet");
		  var dom = html.parse(BrowseResponse.toString());
		  	 
		  var entries =  dom.root.getElementById('series-alphabet-list').getElementByTagName("li");

		  for(var k=0; k< entries.length; k++)
		  {
			  var ancor = entries[k].getElementByTagName("a")[0];
			  var title = ancor.textContent;
			  if(title.toLowerCase().indexOf(res.input.toLowerCase())<0)
				  continue;
			  
			  var streamLink  = ancor.attributes.getNamedItem("href").value;
			  var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ streamLink, 'directory', { title: title });
			  noEntry=false;
			  
			  item.addOptAction("Add series '" + title + "' to favorites", k);
			  item.onEvent(k, function(item) 
					  {
						var obj = showtime.JSONDecode(store.favorites);
						var ancor = entries[item].getElementByTagName("a")[0];
						var streamLink  = ancor.attributes.getNamedItem("href").value;
						var title = ancor.textContent;
						
						obj.push({link:streamLink, title:title});
						store.favorites = showtime.JSONEncode(obj);
					  });
		  }
		  		  
		  if(noEntry == true)
			  page.appendPassiveItem('video', '', { title: 'The search gave no results' });
		  
		page.loading = false;
	  }
  });
  
  
  // Displays the favorite artists / albums / tracks
  plugin.addURI(PLUGIN_PREFIX + ':DisplayFavorites', function(page) {
	  	page.type = "directory";
	    page.metadata.title = "Favorite series";
	    	
	    var list = showtime.JSONDecode(store.favorites);
        if (!list || !list.toString()) {
           page.error("Favorites list is empty");
           return;
        }
        
        for (var i in list) 
        {
        	var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ list[i].link, 'directory', { title: list[i].title });
		    item.addOptAction("Remove '" + list[i].title + "' from My Favorites", i);
		    item.onEvent(i, function(item) 
    		{
    			var obj = showtime.JSONDecode(store.favorites);
    	   		obj.splice(item, 1);
    	   		store.favorites = showtime.JSONEncode(obj);
    			page.flush();
    			page.redirect(PLUGIN_PREFIX + ':DisplayFavorites');
    		});
            
        }
  });


  // Register a service (will appear on home page)
  var service = plugin.createService("bs.to", PLUGIN_PREFIX+"start", "video", true, plugin.path + "bs.png");
  
  // Register Start Page
  plugin.addURI(PLUGIN_PREFIX+"start", function(page) {
    page.type = "directory";
    page.metadata.title = "bs.to Main Menu";
    page.appendItem(PLUGIN_PREFIX + ':Browse', 'directory',{title: "Browse"});
    page.appendItem(PLUGIN_PREFIX + ':DisplayFavorites','item',{ title: "Favorites", });
    page.appendItem(PLUGIN_PREFIX + ':Search','item',{ title: "Search...", });
	page.loading = false;
  });

})(this);