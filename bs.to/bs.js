/**
 * Movian plugin to watch bs.to streams 
 *
 * Copyright (C) 2015-2017 BuXXe
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
   var resolvers = require('./libs/hoster-resolution-library/hrl');
   
(function(plugin) {

	var PLUGIN_PREFIX = "bs.to:";
 
  	// Create / Get the storage for favorite series
	var store = plugin.createStore('personalStorage', true)

	// Create / Get the history
	var historystore = plugin.createStore('history', true)
	
	// Favorite series  
	if (!store.favorites) {
        store.favorites = "[]";
    }
	
	// History  
	if (!historystore.history) {
		historystore.history = "[]";
    }

	// set icon, title and type of a page
	function setPageSettings(page,title)
	{
		page.metadata.icon = Plugin.path + 'bs.png';	
		page.type = 'directory';
		page.metadata.title = title;
	}
	
	// add series to history
	function addToHistory(episodeLink,maintitle)
	{
		var obj = showtime.JSONDecode(historystore.history);
		var serieslink = episodeLink.split("/")[0] + "/" + episodeLink.split("/")[1];
		obj.unshift({link:serieslink, title:encode_utf8(maintitle)});
		obj=obj.slice(0, 25);
		historystore.history = showtime.JSONEncode(obj);
	}
	
	// generate a remove function for given index and page reference  
	function removeFavoriteEntryFunction(index,page)
	{
	  	return function(){
		  	var obj = showtime.JSONDecode(store.favorites);
	 		obj.splice(index, 1);
	 		store.favorites = showtime.JSONEncode(obj);
			page.flush();
			page.redirect(PLUGIN_PREFIX + ':DisplayFavorites');
	  	}
	}
	
	// generate an addToFavorites function for given seriesLink and title
	function addToFavorites(streamLink,title)
	{
		return function()
		{
			var obj = showtime.JSONDecode(store.favorites);
			obj.push({link:streamLink, title:title});
			store.favorites = showtime.JSONEncode(obj);
			showtime.notify("Added "+ decode_utf8(title) +" to Favorites",3);
		}
	}
	
	// generates a download function for given episodelink and vidlink
	function downloadfunction(episodeLink,vidlink,hostername)
	{
		return function()
		{
			if(showtime.message("IMPORTANT: The download will progress in the background! You will be notified when it is done. It CANNOT be aborted and no progress can be seen. Furthermore, the plugin will be BLOCKED for the duration of the download. Proceed?",true,true))
			{
				var pf=plugin.path.replace("zip:","file:").replace(/installedplugins.*/,"plugins/" + plugin.getDescriptor().id + "/copy/").replace("file://","");
				var maintitle = episodeLink.split("/")[1] + " - Season "+episodeLink.split("/")[2]+ " - Episode "+episodeLink.split("/")[3] + " ("+hostername+")";

				// Create series folder
			   	var Seriesfolder = pf+ episodeLink.split("/")[1];
			   	require('native/fs').mkdirs(Seriesfolder);
		   		var movefrom = pf + maintitle;
		   		var moveto = Seriesfolder +'/'+ maintitle;
				showtime.notify("Download started. Notified when done",5);
				
				// try to get final file size and display
				try{
					var response = showtime.httpReq(vidlink,{headRequest: true});
					var finalfilesize = (response.headers)["Content-Length"];
					showtime.notify("Filesize (MB): " + (parseFloat(finalfilesize) / 1024 / 1024).toFixed(2).toString() ,5);
				}catch(e)
				{
					showtime.trace(e.message);
				}
				try{
					var h = plugin.copyFile(vidlink, maintitle);
					require('native/fs').rename(movefrom,moveto);
	    			showtime.message("Download completed. Use Plugin Main Menu / Downloaded Content to access it. Full-Path: " + Seriesfolder,true,false);
				}catch(e)
				{
					showtime.notify("Download FAILED. See log for info",5);
					showtime.trace(e.message);
				}
			}
		}
	}
	
  // resolves the hoster link and gives the final link to the stream file
  plugin.addURI(PLUGIN_PREFIX + ":EpisodesHandler:(.*):(.*)", function(page,episodeLink, hostername){
	  // get the series title, season and episode number
	  // seasonlink is serie/seriesname/seasonnumber/episodename
	  var maintitle = episodeLink.split("/")[1] + " - Season "+episodeLink.split("/")[2]+ " - Episode "+episodeLink.split("/")[3] + " ("+hostername+")";
	  setPageSettings(page,maintitle);
		
	  var getHosterLink = showtime.httpGet("http://bs.to/"+episodeLink);
	  var dom = html.parse(getHosterLink.toString());
	  var directlink = dom.root.getElementByClassName('hoster-player')[0].attributes.getNamedItem("href").value;
		
	  var vidlink = resolvers.resolve(directlink, hostername)
	  if(vidlink == null)
		  page.appendPassiveItem('video', '', { title: "File is not available"  });
	  else
	  {
		  // The video has been resolved and seems to be available
		  // we will use this situation here as the criterion for the history 
		  // the history entries will lead to the series site
		  addToHistory(episodeLink,maintitle);
			
		  var videntry = page.appendItem(vidlink[1], 'video', { title: vidlink[0] });
			
		  // Add download function
		  // The addOptAction function changed over the movian versions.
		  // the specific version number is not known right now
		  // now: everything under 5.XXX will use "old" onevent style.
		  if(showtime.currentVersionInt < 50000000) 
		  {
			  videntry.addOptAction("Download","downloadhandler");
			  videntry.onEvent("downloadhandler", downloadfunction(episodeLink,vidlink[1],hostername) );
		  }else
		  {
			  videntry.addOptAction("Download", downloadfunction(episodeLink,vidlink[1],hostername) );
		  }
	  }
  });
  
  plugin.addURI(PLUGIN_PREFIX + ":ShowHostsForEpisode:(.*)", function(page,episodeLink){
	  // get the series title, season and episode number
	  // seasonlink is serie/seriesname/seasonnumber/episodename
	  var maintitle = episodeLink.split("/")[1] + " - Season "+episodeLink.split("/")[2]+ " - Episode "+episodeLink.split("/")[3]; 
	  setPageSettings(page,maintitle);
	  
	  var getHosterLink = showtime.httpGet("http://bs.to/"+episodeLink);
	  var dom = html.parse(getHosterLink.toString());
		
	  var hosters = dom.root.getElementByClassName('hoster-tabs')[0].getElementByTagName("li");
		
	  for(var k=0; k< hosters.length; k++)
	  {
		  var hostname = hosters[k].getElementByTagName("span")[0].attributes.getNamedItem("class").value.replace("icon ","");
		  var hosterlink  = hosters[k].getElementByTagName("a")[0].attributes.getNamedItem("href").value;
			
		  var resolverstatus = resolvers.check(hostname);
		  var statusmessage = resolverstatus ? " <font color=\"009933\">[Working]</font>":" <font color=\"CC0000\">[Not Working]</font>";
			
		  if(resolverstatus)
		  {
			  page.appendItem(PLUGIN_PREFIX + ":EpisodesHandler:" + hosterlink+":"+hostname , 'directory', {
				  title: new showtime.RichText(hostname + statusmessage) 
			  });
		  }
		  else
		  {
			  page.appendPassiveItem('directory', '', { title: new showtime.RichText(hostname + statusmessage)  });
		  }
	  }
  });
  
  // Lists the available episodes for a given season
  plugin.addURI(PLUGIN_PREFIX + ":SeasonHandler:(.*)", function(page,seasonLink){
	  // get the series title and season
	  // seasonlink is serie/seriesname/seasonnumber
	  var maintitle = seasonLink.split("/")[1] + " - Season "+seasonLink.split("/")[2]; 
	  setPageSettings(page,maintitle);
	  
	  var SeasonResponse = showtime.httpGet("http://bs.to/"+seasonLink);
	  var dom = html.parse(SeasonResponse.toString());
	  var tablerows = dom.root.getElementByClassName('episodes')[0].getElementByTagName("tr");
	  
	  for (var i = 0; i < tablerows.length;i++)
	  {
		  var episodeNumber = tablerows[i].getElementByTagName("td")[0].getElementByTagName("a")[0].textContent;
		  var episodeLink = tablerows[i].getElementByTagName("td")[0].getElementByTagName("a")[0].attributes.getNamedItem("href").value;
		   
		  // Titles:
		  // strong tag for german 
		  // i tag for english
		  var a=undefined;
		  var b=undefined;
		  try{
			  a = tablerows[i].getElementByTagName("td")[1].getElementByTagName("strong")[0].textContent;
		  }catch(e)
		  {a=undefined;}
		  try{
			  b = tablerows[i].getElementByTagName("td")[1].getElementByTagName("i")[0].textContent;
		  }catch(e)
		  {b=undefined;}
		 
		  var Titles = a ? (b? a + " - " + b : a) : b;
		  
		  page.appendItem(PLUGIN_PREFIX + ":ShowHostsForEpisode:" + episodeLink , 'directory', {
			  title: "Episode " + episodeNumber + " " + Titles
		  });
	  }
  });
  
  // Series Handler: show seasons for given series link
  plugin.addURI(PLUGIN_PREFIX + ':SeriesSite:(.*)', function(page, series) {
	  page.loading = false;
	  setPageSettings(page,series.split("serie/")[1]);

	  var seriespageresponse = showtime.httpGet('http://bs.to/'+series);
	  var dom = html.parse(seriespageresponse.toString());
	  var seasons = dom.root.getElementById('seasons').getElementByTagName("a");
	  	
	  var seriestitle = /id="sp_left">[\S\s]*<h2>\s*([\S\s]*)<small>/g.exec(seriespageresponse.toString())[1].trim();
	  	
	  for (var k = 0; k< seasons.length; k++)
	  {	
		  var seasonNumber = seasons[k].textContent;
		  var seasonLink = seasons[k].attributes.getNamedItem("href").value;
    		
		  page.appendItem(PLUGIN_PREFIX + ":SeasonHandler:"+ seasonLink, 'directory', {
			  title: "Season " + seasonNumber
		  });
	  }
    	
	  // addOptAction context menu can not be accessed to add a series to the favorites.
	  // This serves as a workaround which will be deleted as soon as addoptaction works 
	  // on directories in movian 5 again
	  if(showtime.currentVersionInt >= 50000000) 
	  {
		  page.appendAction("Add series to My Favorites", addToFavorites(series,encode_utf8(seriestitle)) );
	  }
		
	  page.loading = false;
  });
  
  // Shows a list of all series alphabetically 
  plugin.addURI(PLUGIN_PREFIX + ':Browse', function(page) {
	    setPageSettings(page,"bs.to series list");

	    var BrowseResponse = showtime.httpGet("http://bs.to/serie-alphabet");
	  	var dom = html.parse(BrowseResponse.toString());
	  	 
	  	var entries = dom.root.getElementById('seriesContainer').getElementByTagName("li");
	  	
	  	for(var k=0; k< entries.length; k++)
	    {
	    	var ancor = entries[k].getElementByTagName("a")[0];
	    	var streamLink  = ancor.attributes.getNamedItem("href").value;
	    	var title = ancor.textContent;
   	
	    	var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ streamLink , 'directory', { title: title });

			item.addOptAction("Add series '" + title + "' to favorites", k);
		    item.onEvent(k, addToFavorites(streamLink,encode_utf8(title)) );
	    }
  });
  
  plugin.addURI(PLUGIN_PREFIX+":Search", function(page) {
	  setPageSettings(page,"");
	  
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
		  	 
		  var entries = dom.root.getElementById('seriesContainer').getElementByTagName("li");

		  for(var k=0; k< entries.length; k++)
		  {
			  var ancor = entries[k].getElementByTagName("a")[0];
			  var title = ancor.textContent;
			  if(title.toLowerCase().indexOf(res.input.toLowerCase())<0)
				  continue;
			  
			  var streamLink  = ancor.attributes.getNamedItem("href").value;
			  var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ streamLink , 'directory', { title: title });
			  noEntry=false;
			  
			  item.addOptAction("Add series '" + title + "' to favorites", k);
			  item.onEvent(k, addToFavorites(streamLink,encode_utf8(title)) );
		  }
		  		  
		  if(noEntry == true)
			  page.appendPassiveItem('video', '', { title: 'The search gave no results' });
		  
		page.loading = false;
	  }
  });

  // Displays the favorite series
  plugin.addURI(PLUGIN_PREFIX + ':DisplayFavorites', function(page) {
	    setPageSettings(page,"Favorite series");
	    
	    var list = showtime.JSONDecode(store.favorites);
        if (!list || !list.toString()) {
           page.error("Favorites list is empty");
           return;
        }
        
        for (var i in list) 
        {
        	// The addOptAction function changed over the movian versions.
			// the specific version number is not known right now
			// now: everything under 5.XXX will use "old" onevent style.
			// This workaround will be deleted when addoptaction works for directories in movian 5 again
			if(showtime.currentVersionInt < 50000000) 
			{
				var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ list[i].link , 'directory', { title: decode_utf8(list[i].title )});
			    item.addOptAction("Remove '" + decode_utf8(list[i].title ) + "' from My Favorites", i);
			    item.onEvent(i, removeFavoriteEntryFunction(i,page));
			}else
			{
				var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ list[i].link , 'video', { title: decode_utf8(list[i].title )});
				item.addOptAction("Remove '" + decode_utf8(list[i].title ) + "' from My Favorites", removeFavoriteEntryFunction(i,page) );
 			}
        }
  });

  function encode_utf8(s) {
	  return encodeURI(s);
	}

  function decode_utf8(s) {
	  return decodeURI(s);
	}
 	
  // Displays the History
  plugin.addURI(PLUGIN_PREFIX + ':History', function(page) {
	    setPageSettings(page,"History (Last 25 Views)");
	    
	    var list = showtime.JSONDecode(historystore.history);
        if (!list || !list.toString()) {
           page.error("History is empty");
           return;
        }

        for (var i in list) 
        {
        	var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ list[i].link , 'directory', { title: decode_utf8(list[i].title )});
        }
  });
  
  // Displays the Help
  plugin.addURI(PLUGIN_PREFIX + ':Help', function(page) {
	    setPageSettings(page,"Help");
	    
	    var helptext = "<font color=\"009933\">Browse</font>: browse an alphabetical series list<br>" +
  			"<font color=\"009933\">DisplayFavorites</font>: use context menu to add series to favorites list (Movian 4) / use special entry at the end of a series' seasons listing (Movian 5)<br>" +
  			"<font color=\"009933\">Search</font>: search for a series (a substring in the title)";
	    var helptext2 = "<font color=\"009933\">History</font>: displays the last 25 viewed episodes. Links lead to the series<br>" +
  			"<font color=\"009933\">Downloaded Content</font>: episodes can be downloaded to be viewed offline. Use the context menu (right click) on the video file after the hoster resolution to download an episode.";
  
	    showtime.message(helptext,true,false);
		showtime.message(helptext2,true,false);
		
		page.redirect(PLUGIN_PREFIX+"start");
  });

  // Register a service (will appear on home page)
  var service = plugin.createService("bs.to", PLUGIN_PREFIX+"start", "video", true, plugin.path + "bs.png");
  
  // Register Start Page
  plugin.addURI(PLUGIN_PREFIX+"start", function(page) {
    setPageSettings(page,"bs.to Main Menu");
    page.appendItem(PLUGIN_PREFIX + ':Browse', 'directory',{title: "Browse"});
    page.appendItem(PLUGIN_PREFIX + ':Search','item',{ title: "Search...", });
    page.appendItem(PLUGIN_PREFIX + ':DisplayFavorites','directory',{ title: "Favorites", });
    page.appendItem(PLUGIN_PREFIX + ':History','directory',{ title: "History (Last 25 Views)", });
    
    var pf=plugin.path.replace("zip://","").replace(/installedplugins.*/,"plugins/" + plugin.getDescriptor().id + "/copy/");
    page.appendItem(pf ,'directory',{ title: "Downloaded Content", });	
    page.appendItem(PLUGIN_PREFIX + ':Help','item',{ title: "Help", });

    page.loading = false;
  });

})(this);