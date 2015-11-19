/**
 * Showtime plugin to watch kinox.to streams 
 *
 * Copyright (C) 2015 BuXXe
 *
 *     This file is part of bs.to Showtime plugin.
 *
 *  bs.to Showtime plugin is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  bs.to Showtime plugin is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with kinox.to Showtime plugin.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Download from : NOT YET AVAILABLE
 *
 */
   var html = require('showtime/html');

(function(plugin) {

  var PLUGIN_PREFIX = "bs.to:";
  
  
  
  
  
  //TODO: do a check if any of the files in online and do the post request only if there are online ones
  //TODO: exchange httpget to httpreq
  // INFO: Helpful Post Data reader: http://www.posttestserver.com/
  
  // HOSTER RESOLVER
  

  function resolveVodLockercom(StreamSiteVideoLink)
  {	  
	  var postdatas = [];
	  	var validentries = false;
	  	
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	showtime.trace(getEmissionsResponse.toString());
    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var hiddenfields =  dom.root.getElementByTagName('Form')[1].getElementByTagName("input");
		  	
	    	res = [];
	    	
	    	for(var k = 0; k < hiddenfields.length; k++)
	    	{
	    		res[res.length] = hiddenfields[k].attributes.getNamedItem("value").value;
	    		showtime.trace(res[k]);
	    	}
	    	
	    	showtime.trace(res.length);
	    	
		    
		    // File Not Found (404) Error 
		    if(res != null)
		    {
		    	postdatas[postdatas.length] = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
	    }
	    
	    var ListOfLinks = [];
	    
	    if(!validentries)
	    {
	    	return ListOfLinks;
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 2 SECONDS
	    for (var i = 0; i < 3; i++) {
	    	showtime.notify("Waiting " + (3-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	    
	    // POSTING DATA
	    for (var index = 0; index < postdatas.length; index++) 
	    {
	    	// check if valid entry
	    	if(postdatas[index] != null)
	    	{
		    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
		    	{
			    	postdata:  postdatas[index],
			    	method: "POST"
			    });
		    	
		    	var videopattern = new RegExp('file: "(.*?)",');
		    	var res2 = videopattern.exec(postresponse.toString());
		        showtime.trace(res2);
		    	showtime.trace(res2.length);
		    	
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  function resolvePromptfilecom(StreamSiteVideoLink)
  {
		postdatas = [];
	  // Posts chash
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var form =  dom.root.getElementByTagName('form')[0];
		  	var chash = form.getElementByTagName('input')[0].attributes.getNamedItem("value").value;
	    	postdatas[postdatas.length] = chash;
	    }
	    
	    var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    	{
		    	// Example: http://primeshare.tv/download/B78A79EA24
	    		postdata:  {chash: postdatas[index]},
		    	method: "POST"
		    });

	    	if(postresponse != null)
	    	{	
		    	var videopattern = new RegExp("url: '(.*?)',");
			  	var vidLink = videopattern.exec(postresponse.toString())[1];
			  	    	
		    	showtime.trace(vidLink);
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],vidLink];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  // NOT WORKING RIGHT NOW
  function resolveMoosharebiz(StreamSiteVideoLink)
  {
	  // Wait 5 Seconds
	  // seems to be closely related to streamcloud.eu
	  // same post data right?
	  
	  var postdatas = [];
	  	var validentries = false;
	  	
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	showtime.trace(getEmissionsResponse.toString());
	    	
	    	//var pattern = new RegExp('<input type="hidden" name="op" value="(.*?)">[^<]+<input type="hidden" name="usr_login" value="(.*?)">[^<]+<input type="hidden" name="id" value="(.*?)">[^<]+<input type="hidden" name="fname" value="(.*?)">[^<]+<input type="hidden" name="referer" value="(.*?)">[^<]+<input type="hidden" name="hash" value="(.*?)">[^<]+<input type="submit" name="imhuman" value="(.*?)" id="btn_download">');
	    	//var res = pattern.exec(getEmissionsResponse.toString());
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var hiddenfields =  dom.root.getElementByTagName('Form')[1].getElementByTagName("input");
		  	
	    	res = [];
	    	
	    	for(var k = 0; k < hiddenfields.length; k++)
	    	{
	    		res[res.length] = hiddenfields[k].attributes.getNamedItem("value").value;
	    		showtime.trace(res[k]);
	    	}
	    	
	    	showtime.trace(res.length);
	    	
		    
		    // File Not Found (404) Error 
		    if(res != null)
		    {
		    	postdatas[postdatas.length] = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
	    }
	    
	    var ListOfLinks = [];
	    
	    if(!validentries)
	    {
	    	return ListOfLinks;
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 5 SECONDS
	    for (var i = 0; i < 5; i++) {
	    	showtime.notify("Waiting " + (5-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	    
	   
	    
	    // POSTING DATA
	    for (var index = 0; index < postdatas.length; index++) 
	    {
	    	// check if valid entry
	    	if(postdatas[index] != null)
	    	{
		    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
		    	{
			    	postdata:  postdatas[index],
			    	method: "POST"
			    });
		    	var postresponse2 = showtime.httpReq("http://posttestserver.com/post.php", 
				    	{
					    	postdata:  postresponse.toString(),
					    	method: "POST"
					    });
		    	
		    	
		    	
		    	showtime.trace(postresponse2.toString());
		    	
		    	showtime.trace(postresponse.toString());
		    	var videopattern = new RegExp('file: "(.*?)",');
		    	var res2 = videopattern.exec(postresponse.toString());
		        showtime.trace(res2);
		    	showtime.trace(res2.length);
		    	
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  // NOT WORKING
  // two problems seem to occur: some weird problem to get the response correctly and you cannnot use the direct link to the video file
  function resolveNowvideosx(StreamSiteVideoLink)
  {
	  var getdatas = [];
	  
	  for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	
	    	// TODO: Check for 404
	    	// http://www.nowvideo.sx/api/player.api.php?user=undefined&cid3=kinox%2Etv&pass=undefined&cid=1&cid2=undefined&key=131%2E234%2E64%2E55%2D0a60aa35dd7363b48587e1fd591d4201&file=c06733f4f10e9&numOfErrors=0
	    	var fkzdpattern = new RegExp('fkzd="(.*?)";');
	    	var fkzd = fkzdpattern.exec(getEmissionsResponse.toString());
	    	var filepattern = new RegExp('flashvars.file="(.*?)";');
	    	var fileentry = filepattern.exec(getEmissionsResponse.toString());
	    	var cid3pattern = new RegExp('flashvars.cid3="(.*?)";');
	    	var cid3entry = cid3pattern.exec(getEmissionsResponse.toString());
	    	var cidpattern = new RegExp('flashvars.cid="(.*?)";');
	    	var cidentry = cidpattern.exec(getEmissionsResponse.toString());
	    		
	    	getdatas[getdatas.length] = {user: "undefined" , cid3: cid3entry , pass:  "undefined", cid : cidentry, cid2: "undefined", key:fkzd,file:fileentry,numOfErrors:"0"};
		    	
	    }
	    
	  	var ListOfLinks = [];
	    
	    // GET DATA Request
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	if(getdatas[index] != null)
	    	{
	    		var getresponse = showtime.httpReq("http://www.nowvideo.sx/api/player.api.php", 
	    		
		    	{
		    		args:   getdatas[index]
		    		
			    });
	
		    	if(getresponse != null)
		    	{	
		    		showtime.trace(getresponse.toString());
//		    		var dom = html.parse(postreponse.toString());
//				  	var videoentry =  dom.root.getElementByClassName('stream-content')[0].getNamedItem("data-url").value;
//				  	
//				  	showtime.trace(videoentry);
//			    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],videoentry];
		    	}
	    	}
	    }
	    
	  return ListOfLinks;
	  
  }
  
  // NOT WORKING
  function resolveSharedsx(StreamSiteVideoLink)
  {
	  // 12 Seconds Waiting time
	  // seems to be the only <form> in the page
	  // take the form and get info
	  //	<form method="POST">
	  //		<input type="hidden" name="hash" value="poDUFv4ipFbYoKe-2uOdlg" />
	  //		<input type="hidden" name="expires" value="1429199570" />
	  //		<input type="hidden" name="timestamp" value="1429185170" />
	  //		<button id="access" class="btn btn-large btn-info btn-continue" type="submit" disabled>Continue to file</button>
	  //	</form>
	  
	  // TODO: Problem with the POST Request! The website checks for HTML5 support and deletes the video link if no support is given.
	  // Therefor: the Link cannot be extracted right now. 
	  // There is a project which uses shared.sx and does the same. it has something to do with the requests from the ps3 / movian....
	  // http://xstream-addon.square7.ch/showthread.php?tid=84
	  
	  var postdatas = [];
	  
	  for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    	
	    	var dom = html.parse(getEmissionsResponse.toString());
		  	var form =  dom.root.getElementByTagName('form')[0];
		  	var entries = form.getElementByTagName('input');
		  	
		  	
	  		// hash expires timestamp
		  	// File Not Found (404) Error 
		    if(entries != null)
		    {
		    	var ha = entries[0].attributes.getNamedItem("value").value;
		    	var ex = entries[1].attributes.getNamedItem("value").value;
		    	var ts = entries[2].attributes.getNamedItem("value").value;
		    	
		    	showtime.trace(ha);
		    	showtime.trace(ex);
		    	showtime.trace(ts);
		    	
		    	postdatas[postdatas.length] = {hash: ha , expires: ex, timestamp:  ts};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
		    
	    	
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 12 SECONDS
	    for (var i = 0; i < 13; i++) {
	    	showtime.notify("Waiting " + (13-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }	
	  
	  	var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	if(postdatas[index] != null)
	    	{
	    		var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    		
		    	{
		    		postdata:   {hash: postdatas[0] , expires: postdatas[1], timestamp:  postdatas[2]},
			    	method: "POST"
			    });
	
		    	if(postresponse != null)
		    	{	
		    		var dom = html.parse(postresponse.toString());
				  	var videoentry =  dom.root.getElementByClassName('stream-content')[0];
				  	
				  	videoentry = videoentry.attributes.getNamedItem("data-url").value;
				  	
				  	showtime.trace(videoentry);
			    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],videoentry];
		    	}
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  
  function resolveFilenukecom(StreamSiteVideoLink)
  {
	  	// it seems that the only thing that is posted is:
	  	// method_free: "Free"
	  	var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    	{
		    	postdata:  {method_free: "Free"},
		    	method: "POST"
		    });
	    	
	    	if(postresponse != null)
	    	{
		    	var videopattern = new RegExp("var lnk234 = '(.*?)';");
		    	var res2 = videopattern.exec(postresponse.toString());
		    	
		    	showtime.trace(res2[1]);
		        
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    return ListOfLinks;
  }
  
  function resolvePrimesharetv(StreamSiteVideoLink)
  {
	  	// 8 Seconds Wait Time
	  	// Post: hash: {part of the URL} (Example hash : 40027F9C38)
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	showtime.trace(StreamSiteVideoLink[index]);
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 8 SECONDS
	    for (var i = 0; i < 9; i++) {
	    	showtime.notify("Waiting " + (9-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }	
	  
	  	var ListOfLinks = [];
	    
	    // POSTING DATA
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
	    	{
		    	// Example: http://primeshare.tv/download/B78A79EA24
	    		postdata:  {hash: StreamSiteVideoLink[index].split("/download/")[1]},
		    	method: "POST"
		    });

	    	if(postresponse != null)
	    	{	
		    	// TODO: The PS3 seems to have problems with this file format
		    	// The links do not give away the fileformat and therefor the PS3 has to probe it
		    	// this results in some waiting time before the video playback starts
		    	// Perhaps the filetype / videotype can be passed through to the playback system?
		    	var videopattern = new RegExp("'http://j.primeshare.tv(.*?)'");
			  	var linewithvars = videopattern.exec(postresponse.toString());
			  	var vidLink = "http://j.primeshare.tv" + linewithvars[1] ;
		    	
		    	showtime.trace(vidLink);
		        
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],vidLink];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  
  
  
  function resolveStreamcloudeu(StreamSiteVideoLink)
  {
	  	var postdatas = [];
	  	var validentries = false;
	  	
	    for (var index = 0; index < StreamSiteVideoLink.length; index++) 
	    {
	    	var getEmissionsResponse = showtime.httpGet(StreamSiteVideoLink[index]);
	    	
	    	showtime.trace(StreamSiteVideoLink[index]);

	    	var pattern = new RegExp('<input type="hidden" name="op" value="(.*?)">[^<]+<input type="hidden" name="usr_login" value="(.*?)">[^<]+<input type="hidden" name="id" value="(.*?)">[^<]+<input type="hidden" name="fname" value="(.*?)">[^<]+<input type="hidden" name="referer" value="(.*?)">[^<]+<input type="hidden" name="hash" value="(.*?)">[^<]+<input type="submit" name="imhuman" id="btn_download" class="button gray" value="(.*?)">');
		    var res = pattern.exec(getEmissionsResponse.toString());
		    
		    // File Not Found (404) Error 
		    if(res != null)
		    {
		    	postdatas[postdatas.length] = {op:res[1], usr_login:res[2], id: res[3],fname:res[4],referer: res[5],hash:res[6],imhuman:res[7]};
		    	validentries = true;
		    }
		    else{
		    	showtime.trace("XXXXXXXXXXXXXXXXXX STREAM NOT AVAILABLE ANYMORE XXXXXXXXXXXXXXXXX")
		    	postdatas[postdatas.length] = null;
		    }
	    }
	    
	    var ListOfLinks = [];
	    
	    if(!validentries)
	    {
	    	return ListOfLinks;
	    }
	    
	    // POST DATA COLLECTED
	    // WAIT 11 SECONDS
	    for (var i = 0; i < 12; i++) {
	    	showtime.notify("Waiting " + (11-i).toString() +" Seconds",1);
	        showtime.sleep(1);
	    }
	    
	   
	    
	    // POSTING DATA
	    for (var index = 0; index < postdatas.length; index++) 
	    {
	    	// check if valid entry
	    	if(postdatas[index] != null)
	    	{
		    	var postresponse = showtime.httpReq(StreamSiteVideoLink[index], 
		    	{
			    	postdata:  postdatas[index],
			    	method: "POST"
			    });
		    	
		    	var videopattern = new RegExp('file: "(.*?)",');
		    	var res2 = videopattern.exec(postresponse.toString());
		        
		    	ListOfLinks[ListOfLinks.length] = [StreamSiteVideoLink[index],res2[1]];
	    	}
	    }
	    
	    return ListOfLinks;
  }
  // HOSTER RESOLVER END
  
  
  
  
  
  //TODO: Use HTML Parser
  // extract direct link from response
  function getStreamSiteLink(response)
  {
	  	var text = response.toString().replace(/\\/g,'');
	  	return text.match(/<a href="(.*)" target=/)[1];
  }
  
  
   
  // Lists the available episodes for a given season
  plugin.addURI(PLUGIN_PREFIX + ":SeasonHandler:(.*)", function(page,seasonLink){
	  page.type = 'directory';
	  
	  var SeasonResponse = showtime.httpGet("http://bs.to/"+seasonLink);
	  
	  
	  var dom = html.parse(SeasonResponse.toString());
	  var seriesentry =  dom.root.getElementById('sp_left');
	  var tablerows = seriesentry.getElementByTagName("table")[0].getElementByTagName("tr");
	  
	  // first row is header row
	  
	  
	  for (var i=1;i < tablerows.length;i++)
	  {
		  try {
			  var episodeNumber = tablerows[i].getElementByTagName("td")[0].textContent;
		  
  			
  			// TODO: right now: only streamcloud implemented 
  			var streamcloudlink = tablerows[i].getElementByClassName("Streamcloud")[0].attributes.getNamedItem("href").value;
		  
		  	page.appendItem(PLUGIN_PREFIX + ":EpisodesHandler:" + streamcloudlink , 'directory', {
  			  title: "Episode " + streamcloudlink.split("/")[streamcloudlink.split("/").length-2]
  			});
		  }catch(e)
		  {
		    	showtime.trace("One Episode is bad");
		  }
	  }
  });
  
 
  // TODO: gives list of available hosts for given episode
  plugin.addURI(PLUGIN_PREFIX + ":EpisodesHandler:(.*)", function(page,episodeLink){
	  page.type = 'directory';

	  	var getHosterLink = showtime.httpGet("http://bs.to/"+episodeLink);

	    var directlink = new RegExp('href="http://streamcloud.eu(.*?)"');
		var linewithlink = directlink.exec(getHosterLink.toString());
		
		
	  	var vidlink = resolveStreamcloudeu(["http://streamcloud.eu"+linewithlink[1]]);
	    
	  	page.appendItem(vidlink[0][1], 'video', {
			  title: vidlink[0][0]
			});
  });
  
  
  //Play Episode gives the final list of direct links for a specific host
  // here we also need the info about the count of mirrors
  // http://kinox.to/aGET/Mirror/Two_and_a_Half_Men&Hoster=30&Mirror=2&Season=4&Episode=1
  // MERGE THIS ONE WITH LinksForMovieHost
  // Only differences: the args for the get request and the resolve of maxmirror

  // Introducing a Series Flag: If the flag is equal to 0 we only use hosterid and URLname
  // If the flag is 1 we have a series and need maxmirrors, season, episode too.
  
  // Here we have one specific Hoster selected and need to handle their links
  plugin.addURI(PLUGIN_PREFIX + ":PlayEpisode:(.*):(.*):(.*):(.*):(.*):(.*)", function(page, URLname, hosterid, seriesflag, maxmirror, season, episode){
	  	page.type = 'directory';

	  	if(seriesflag == 0)
	  		var maxmirror = getMaxMirror("/Stream/"+URLname+".html",hosterid);
	  	
	    var hosteridnumber = hosterid.split("_")[1];
	    var StreamSiteVideoLink = [];

	    for (var index = 1; index <= maxmirror; index++) 
		{
	    	var args;
	    	if(seriesflag == 1)
	    		args = {Hoster:hosteridnumber , Mirror: index, Season:season, Episode:episode};
	    	else
	    		args = {Hoster:hosteridnumber , Mirror: index};
	    		
	    	var getMirrorLink = showtime.httpGet("http://kinox.to/aGET/Mirror/"+URLname, args );
		  
	    	// TODO: check if available!
	    	StreamSiteVideoLink[StreamSiteVideoLink.length] = getStreamSiteLink(getMirrorLink);
		}
	  
	    // Here we handle the Hoster specific resolution
	    HosterResolutionAndDisplay(page,hosteridnumber, StreamSiteVideoLink)
});
	  
  
  
  // function which gives available hosts for given response
  function getHostsForMovies(page, response, URLname)
  {
		var dom = html.parse(response.toString());
	  	var HosterList =  dom.root.getElementById('HosterList');
	  	
	  	var entries = HosterList.getElementByTagName("li");
	  	
	  	for (var k=0;k<entries.length;k++)
	  	{
	  		// Hoster Name
    		var hostname = entries[k].getElementByClassName("Named")[0].textContent;
    		
    		// hoster id
    		var id = entries[k].attributes.getNamedItem("id").value
    		
    		// get information if this hoster is implemented
    		var resolverstatus = checkResolver(id); 
    		
    		// give the effective links for a specific host
    		// the attachment ":0:-1:X:X" is necessary to allow the use of the same page for series and movies
    		page.appendItem(PLUGIN_PREFIX + ":PlayEpisode:"+ URLname + ":" + id + ":0:-1:X:X"  , 'directory', {
    			  title: new showtime.RichText(hostname + resolverstatus)
    			});
	  	}
  }
  
  function checkResolver(hosterid)
  {
	  var hosternumber = hosterid.split("_")[1];
	  
	  if(availableResolvers.indexOf(hosternumber) > -1)
	  {
		  return " <font color=\"009933\">[Working]</font>";
	  }
	  else{
		  return " <font color=\"CC0000\">[Not Working]</font>";
	  }
	  
  }
  
  function getMaxMirror(movie,hosterid)
  {
	    var moviepageresponse = showtime.httpGet('http://kinox.to'+movie);
	  
	    var getmirrorcountpattern = new RegExp('<li id="'+hosterid+'"(.*?)li>');
		var linewithhost = getmirrorcountpattern.exec(moviepageresponse.toString());
	    var mirrorcount = linewithhost[1].match(/<b>Mirror<\/b>: (.*)<br/);
		  
	    // got the mirror count in format x/y
	    return mirrorcount[1].split("/")[1];
  }
  
  
  
  function HosterResolutionAndDisplay(page, hosternumber, StreamSiteVideoLink)
  {
	    // List of tuples of streamlink and direct video link
  		var FinalLinks=[];
	    
	    // Streamcloud.eu
	    if(hosternumber == 30)
	    {
	    	FinalLinks = resolveStreamcloudeu(StreamSiteVideoLink);
	    }
	    // Filenuke.com
	    else if (hosternumber == 34)
    	{
	    	FinalLinks = resolveFilenukecom(StreamSiteVideoLink);
    	}
	    // NowVideo.sx
	    else if(hosternumber == 40)
    	{
	    	// NOT WORKING RIGHT NOW
	    	// Request does not give correct link back and even if, the link cannot be used directly somehow
	    	// FinalLinks = resolveNowvideosx(StreamSiteVideoLink);
	    	showtime.trace("Hoster resolution not working");
    	}
	    // Primeshare.tv
	    else if (hosternumber == 45)
	    {
	    	FinalLinks = resolvePrimesharetv(StreamSiteVideoLink);
    	}
	    // MooShare.biz
	    else if (hosternumber == 49)
	    {
	    	// NOT WORKING RIGHT NOW
	    	// Request does not give correct site back
	    	// FinalLinks = resolveMoosharebiz(StreamSiteVideoLink);
	    	showtime.trace("Hoster resolution not working");
    	}
	    // Shared.sx
	    else if (hosternumber == 52)
	    {
	    	// NOT WORKING DUE TO HTML5 AND POST REQUEST PROBLEM
	    	// FinalLinks = resolveSharedsx(StreamSiteVideoLink);
	    	showtime.trace("Hoster resolution not working");
	    }
	    // Promptfile.com
	    else if( hosternumber == 56)
	    {
	    	FinalLinks = resolvePromptfilecom(StreamSiteVideoLink);
	    }
	    // VodLocker.com
	    else if(hosternumber == 65)
    	{
	    	FinalLinks = resolveVodLockercom(StreamSiteVideoLink);
    	}
	    // Default part to catch unimplemented hosters
	    else
	    {
	    	page.appendPassiveItem("label", null, { title: "Hoster not yet implemented"});
	    }
	    

	    if(FinalLinks.length == 0)
	    {
	    	
	    	page.appendPassiveItem("label", null, { title: "No Valid Links Available"});
	    }
	    else
	    {
		    // A Hoster Resolution provides the final links to the files + the original hoster links as a list of lists
		    // this list is then used to fill the page
		    for(var index = 0; index < FinalLinks.length; index++)
		    {
		    	page.appendItem(FinalLinks[index][1], 'video', {
				  title: FinalLinks[index][0]
				});
		    }
	    }
  }
  
  
  // Handles the effective series site
  // We get the /serie//XXX Link
  // Show Seasons
  plugin.addURI(PLUGIN_PREFIX + ':SeriesSite:(.*)', function(page, series) {
	  	page.loading = false;
	  	page.type = 'directory';
	  	page.metadata.title = series.split("serie/")[1];
	  	
	    // Series Page selected
	    var seriespage = 'http://bs.to/'+series;
	    var seriespageresponse = showtime.httpGet(seriespage);
	    
	    
	  	var dom = html.parse(seriespageresponse.toString());
	  	var seriesentry =  dom.root.getElementById('sp_left');
	  	var pages = seriesentry.getElementByClassName("pages")[0].getElementByTagName("li");
	  	
	  	// INFO: all entries are seasons except for the last one which is a random episode link
    	
    	for (var k = 0; k< pages.length-1; k++)
    	{	
    		var ancor = pages[k].getElementByTagName("a")[0];
    		
    		// Season as number
    		var seasonNumber = ancor.textContent;
    		
    		// get Season Link
    		var seasonLink = ancor.attributes.getNamedItem("href").value;
    		
    		page.appendItem(PLUGIN_PREFIX + ":SeasonHandler:"+ seasonLink, 'directory', {
    			  title: "Season " + seasonNumber
    			});
    	}


		page.loading = false;
	});

  
  // Register a service (will appear on home page)
  var service = plugin.createService("bs.to", PLUGIN_PREFIX+"start", "video", true, plugin.path + "bs.png");
  
  // Shows a list of all series alphabetically 
  plugin.addURI(PLUGIN_PREFIX + ':Browse', function(page) {
	  
	  	page.type = "directory";
	    page.metadata.title = "bs.to series list";
	    
	  	var BrowseResponse = showtime.httpGet("http://bs.to/serie-alphabet");
	  	
	  	var dom = html.parse(BrowseResponse.toString());
	  	
	  	var serSeries =  dom.root.getElementById('series-alphabet-list')
	  	
	  	var entries = serSeries.getElementByTagName("li");
	  	
	    for(var k=0; k< entries.length; k++)
	    {
	    	var ancor = entries[k].getElementByTagName("a")[0];
	    	
	    	// get stream link
	    	var streamLink  = ancor.attributes.getNamedItem("href").value;

	    	// get title
	    	var title = ancor.textContent;
	    	
	    	page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ streamLink, 'video', {
				  title: title,
				});
	    }
  });

  
  
  
  // Register Start Page
  // Should Show a Main Menu with Functionalities:
  // Browse all series alphabetically
  // TODO: Check if Search works
  plugin.addURI(PLUGIN_PREFIX+"start", function(page) {
    page.type = "directory";
    page.metadata.title = "bs.to Main Menu";
  
    page.appendItem(PLUGIN_PREFIX + ':Browse', 'directory',{
		  title: "Browse",
		});
    
//    page.appendItem(PLUGIN_PREFIX + ':', 'directory',{
//		  title: "Law and Order",
//		});
    
//    page.appendItem(PLUGIN_PREFIX + ':Search','item',{
//		  title: "Search...",
//	});
//    
	page.loading = false;
	   
  });

})(this);
    
          
    
//  setTimeout(function(){
//  	showtime.message("after sleep",true,false);
//  	page.loading = false;
//  	}, 10000);
//  
