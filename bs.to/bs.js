/**
 * Movian plugin to watch bs.to streams
 *
 * Copyright (C) 2015-2018 BuXXe
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
   var bstoApi = require('./libs/bstoApi');

(function(plugin) {
  // Try to get current utc online to workaround misconfigured systemtime, opt-in
  function onlineTimesync() {
    showtime.httpReq('http://worldclockapi.com/api/json/utc/now', {}, function(err, result) {
      if (err) {return;}

      try {
        var jsonTime = JSON.parse(result.toString());
        var onlineDate = new Date(jsonTime.currentDateTime);
        bstoApi.timeOffset = onlineDate.getTime() - Date.now();
      } catch (e) {
        console.log(e);
      }
    });
  }

  var PLUGIN_PREFIX = "bs.to:";

  // Create / Get the storage for favorite series
  var store = plugin.createStore('personalStorage', true);

	// Favorite series
	if (!store.favorites) {
        store.favorites = "[]";
    }

  // Settings object
  var settings = plugin.createSettings('bs.to', plugin.path + 'bs.png', '');
  settings.createBool('onlineTime', 'Online timesync', false, function(b) {
    if (b == true) {
      onlineTimesync();
    }
  });

  // resolves the hoster link and gives the final link to the stream file
  plugin.addURI(PLUGIN_PREFIX + ":EpisodesHandler:(.*):(.*)", function(page,episodeLink, hostername){
	  page.metadata.icon = Plugin.path + 'bs.png';
	  page.type = 'directory';
	  	// get the series title, season and episode number
		// seasonlink is serie/seriesname/seasonnumber/episodename
		page.metadata.title = episodeLink.split("/")[1] + " - Season "+episodeLink.split("/")[2]+ " - Episode "+episodeLink.split("/")[3];

		var getHosterLink = showtime.httpGet("http://bs.to/"+episodeLink);
		var dom = html.parse(getHosterLink.toString());
		var directlink = dom.root.getElementByClassName('hoster-player')[0].attributes.getNamedItem("href").value.toString();

    // If the link is pointing to the redirect page we request it via API
    try {
      var outId = directlink.match(/bs.to\/out\/([0-9]+)/);
      if (outId.length == 2) {
        var obj = JSON.parse(bstoApi.apiRequest('watch/'+outId[1]));
        directlink = obj.fullurl;
      }
    } catch(e) {
      console.log(e);
    }

		var vidlink = resolvers.resolve(directlink, hostername)
		if(vidlink == null)
    		page.appendPassiveItem('video', '', { title: "File is not available"  });
		else {
      if (vidlink.length == 2) {
        page.redirect(vidlink[1]);
      } else {
        for (var i = 0; i < vidlink.length; i += 2) {
          page.appendItem(vidlink[i+1], 'video', { title: vidlink[i+0] });
        }
      }
    }
  });

  plugin.addURI(PLUGIN_PREFIX + ":ShowHostsForEpisode:(.*)", function(page,episodeLink){
	  page.metadata.icon = Plugin.path + 'bs.png';
	  page.type = 'directory';
	  // get the series title, season and episode number
	  // seasonlink is serie/seriesname/seasonnumber/episodename
	  page.metadata.title = episodeLink.split("/")[1] + " - Season "+episodeLink.split("/")[2]+ " - Episode "+episodeLink.split("/")[3];

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
	  page.metadata.icon = Plugin.path + 'bs.png';
	  page.type = 'directory';
	  // get the series title and season
	  // seasonlink is serie/seriesname/seasonnumber
	  page.metadata.title = seasonLink.split("/")[1] + " - Season "+seasonLink.split("/")[2];

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
		  {showtime.trace("no german title");}
		  try{
			  b = tablerows[i].getElementByTagName("td")[1].getElementByTagName("i")[0].textContent;
		  }catch(e)
		  {showtime.trace("no english title");}

		  var Titles = a ? (b? a + " - " + b : a) : b;

		  page.appendItem(PLUGIN_PREFIX + ":ShowHostsForEpisode:" + episodeLink , 'directory', {
			  title: "Episode " + episodeNumber + " " + Titles
		  });
	  }
  });

  // Series Handler: show seasons for given series link
  plugin.addURI(PLUGIN_PREFIX + ':SeriesSite:(.*)', function(page, series) {
	  	page.metadata.icon = Plugin.path + 'bs.png';
	  	page.loading = false;
	  	page.type = 'directory';
	  	page.metadata.title = series.split("serie/")[1];

	    var seriespageresponse = showtime.httpGet('http://bs.to/'+series);
	  	var dom = html.parse(seriespageresponse.toString());
	  	var seasons = dom.root.getElementById('seasons').getElementByTagName("a");

    	for (var k = 0; k< seasons.length; k++)
    	{
    		var seasonNumber = seasons[k].textContent;
    		var seasonLink = seasons[k].attributes.getNamedItem("href").value;

    		page.appendItem(PLUGIN_PREFIX + ":SeasonHandler:"+ seasonLink, 'directory', {
    			  title: "Season " + seasonNumber
    			});
    	}
		page.loading = false;
	});

  // Shows a list of all series alphabetically
  plugin.addURI(PLUGIN_PREFIX + ':Browse', function(page) {
	  	page.metadata.icon = Plugin.path + 'bs.png';
	  	page.type = "directory";
	    page.metadata.title = "bs.to series list";

	  	var BrowseResponse = showtime.httpGet("http://bs.to/serie-alphabet");
	  	var dom = html.parse(BrowseResponse.toString());

	  	var entries =  dom.root.getElementById('seriesContainer').getElementByTagName("li");

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
    	    	var title = encode_utf8(ancor.textContent);

    			obj.push({link:streamLink, title:title});
    			store.favorites = showtime.JSONEncode(obj);
    		});
	    }
  });


  plugin.addURI(PLUGIN_PREFIX+":Search", function(page) {
	  page.metadata.icon = Plugin.path + 'bs.png';
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

		  var entries =  dom.root.getElementById('seriesContainer').getElementByTagName("li");

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
						var title = encode_utf8(ancor.textContent);

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
	  	page.metadata.icon = Plugin.path + 'bs.png';
	  	page.type = "directory";
	    page.metadata.title = "Favorite series";

	    var list = showtime.JSONDecode(store.favorites);
        if (!list || !list.toString()) {
           page.error("Favorites list is empty");
           return;
        }

        for (var i in list)
        {
        	var item = page.appendItem(PLUGIN_PREFIX + ':SeriesSite:'+ list[i].link, 'directory', { title: decode_utf8(list[i].title )});
		    item.addOptAction("Remove '" + decode_utf8(list[i].title ) + "' from My Favorites", i);
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


  function encode_utf8(s) {
	  return encodeURI(s);
	}

  function decode_utf8(s) {
	  return decodeURI(s);
	}

  // Register a service (will appear on home page)
  var service = plugin.createService("bs.to", PLUGIN_PREFIX+"start", "video", true, plugin.path + "bs.png");

  // Register Start Page
  plugin.addURI(PLUGIN_PREFIX+"start", function(page) {
	page.metadata.icon = Plugin.path + 'bs.png';
	page.type = "directory";
    page.metadata.title = "bs.to Main Menu";
    page.appendItem(PLUGIN_PREFIX + ':Browse', 'directory',{title: "Browse"});
    page.appendItem(PLUGIN_PREFIX + ':DisplayFavorites','item',{ title: "Favorites", });
    page.appendItem(PLUGIN_PREFIX + ':Search','item',{ title: "Search...", });
	page.loading = false;
  });

})(this);
