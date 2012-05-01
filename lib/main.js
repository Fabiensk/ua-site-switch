// The main module of the ua-switch-auto Add-on.

/*
  Copyright 2012 Fabien Shum-King
  Contact : contact [.at.] fabsk.eu
  
  ******* BEGIN LICENSE BLOCK *****
  
  Contact : contact [.at.] fabsk.eu
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
  
  **** END LICENSE BLOCK ***** */

require("chrome")

// some requirements
var Widget = require("widget").Widget;
var tabs = require('tabs');
var data = require("self").data;

// storage for domain<->UA  mapping
var simpleStorage = require('simple-storage');
if (!simpleStorage.storage.mapping)
    simpleStorage.storage.mapping = {};
// debug
/* console.log("start");
for(cnt=0;cnt<20;++cnt)
simpleStorage.storage.mapping["site"+cnt] = "agent"+cnt; */

var service;
var observer;

// var mydebug = console.log
var mydebug = function(){}

function doConfig(evt) {
    var url = tabs.activeTab.url;
    var match = url.match(new RegExp("^https?:\\/\\/([^/]+)"))
	var domain = null;
	var agent = "";
    if (match!=null) {
		domain = match[1];
		mydebug("Click:"+simpleStorage.storage.mapping[domain]);
		if (simpleStorage.storage.mapping[domain])
		agent = simpleStorage.storage.mapping[domain];
	}
    
    // Open a new tab in the currently active window.
    var panels = require('panel');
    var siteConfigDlg = panels.Panel({
	width: 640,
	height: 500,
	contentURL: require("self").data.url('config.html'),
	contentScriptFile: [ 
	data.url('jquery-1.7.2.min.js'),
	data.url('js/jquery-ui-1.8.20.custom.min.js'),
	data.url('config.js')
	],
	onMessage: function(params) {
		// first item: command
		// second item: data
		if (params[0]=="add") {
			var agent = params[1];
			if (agent || agent=="") {
				mydebug("msg: " + agent);
				if (agent=="")
					delete simpleStorage.storage.mapping[domain];
				else
					simpleStorage.storage.mapping[domain] = agent;
				mydebug("Save:"+simpleStorage.storage.mapping[domain]);
				siteConfigDlg.hide();
			} 
		} else if (params[0]=="remove") {
			delete simpleStorage.storage.mapping[params[1]];
		}
	},
	onShow: function() {		    
	    this.postMessage([domain, agent, simpleStorage.storage.mapping]);
	}
    });
    siteConfigDlg.show();
}

// executed on addon init
exports.main = function() {

    // icon in the module bar
    new Widget({
        id: "UA-site-switch",
        label: "UA-site-switch",
        contentURL: require("self").data.url("helmet.png"),

        // Add a function to trigger when the Widget is clicked.
        onClick: doConfig
    });

    console.log("UA-site-switch: hello");

    // register the request listener    
    service =
	Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observer = {
	// called by addObserver
	QueryInterface: function (iid) {  
	    mydebug("UA-site-switch: QueryInterface:" + iid);
            if (iid.equals(Components.interfaces.nsIObserver) ||  
		iid.equals(Components.interfaces.nsISupports))  
		return this;  
            
	    throw Components.results.NS_ERROR_NO_INTERFACE;
	},
	// react to events
	observe: function(subject, topic, data)   
	{  
	    if (topic == "http-on-modify-request") {  
		var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);  
		// may change the agent according to the host
		var agent = simpleStorage.storage.mapping[httpChannel.getRequestHeader("Host")];
		if (agent)
		    httpChannel.setRequestHeader("User-Agent", agent, false);  
		mydebug("UA-site-switch: request, "+agent+";"+httpChannel.getRequestHeader("Host"));
	    }  
	},
	get observerService() {  
	    return Components.classes["@mozilla.org/observer-service;1"]  
                .getService(Components.interfaces.nsIObserverService);  
	},  
	
	register: function()  
	{  
	    this.observerService.addObserver(this, "http-on-modify-request", false);  
	},  
	
	unregister: function()  
	{  
	    this.observerService.removeObserver(this, "http-on-modify-request");  
	}
    };
    observer.register();
};

// cleanup
exports.onUnload = function() {
    observer.unregister();
    console.log("UA-site-switch: bye");
}
