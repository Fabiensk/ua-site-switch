// The main module of the ua-switch-auto Add-on.

/*
  Copyright 2015 F a b i e n  S h u m - K i n g
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

const {Cc,Ci,Cr} = require("chrome");

// some requirements
var ui = require("sdk/ui");
var tabs = require('sdk/tabs');
var data = require("sdk/self").data;
var _ = require("sdk/l10n").get;

// storage for domain<->UA  mapping
var simpleStorage = require('sdk/simple-storage');
if (!simpleStorage.storage.mapping)
    simpleStorage.storage.mapping = {};
if (!simpleStorage.storage.hasOwnProperty("enable"))
    simpleStorage.storage.enable = true;
// debug
/* console.log("start");
for(cnt=0;cnt<20;++cnt)
simpleStorage.storage.mapping["site"+cnt] = "agent"+cnt; */

var service = null;
var observer = null;
var button = null;

// var mydebug = console.log
var mydebug = function(){}

// find the most significant match
function getMatchingAgent(host) {
	var mapping = simpleStorage.storage.mapping;
	var agent = null;
	var rule_length = 0;
	for (cfg in mapping) {
		if (cfg[0]==".") {
			var domain = cfg.substr(1);
			if (domain==host.substr(host.length-domain.length) && rule_length<cfg.length-1) {
				agent = mapping[cfg];
				rule_length = cfg.length-1;
			}
		}
		else {
			if (host==cfg) {
				agent = mapping[cfg];
				rule_length = cfg.length;
			}
		}		
	}
	return agent;
}

// display the config panel when icon is clicked
function doConfig(state, isMenu) {
    if (isMenu==false) {
        // Toggle listening
        enableListening(!simpleStorage.storage.enable);
        return;
    }
    var url = tabs.activeTab.url;
    // only for http(s) sites
    var match = url.match(new RegExp("^https?:\\/\\/([^/]+)"))
	var domain = null;
	var agent = "";
    if (match!=null) {
		domain = match[1];
		mydebug("Click:"+simpleStorage.storage.mapping[domain]);
		var agent = getMatchingAgent(domain);
	}
    
    // Open a new tab in the currently active window.
    var panels = require('sdk/panel');
    var siteConfigDlg = panels.Panel({
	width: 640,
	height: 500,
	contentURL: require("sdk/self").data.url('config.html'),
	contentScriptFile: [ 
	data.url('jquery-1.7.2.min.js'),
	data.url('js/jquery-ui-1.8.20.custom.min.js'),
	data.url('config.js')
	],
	// messages from the config panel
	onMessage: function(params) {
		// first item: command
		// second item: data
		if (params[0]=="add") {
			var domain = params[1];
			var agent = params[2];
			if (agent && domain) {
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
		} else if (params[0]=="enable") {
            enableListening(params[1]);
		}
	},
	onShow: function() {		    
	    this.postMessage([domain, agent, simpleStorage.storage.enable, 
			simpleStorage.storage.mapping]);
	}
    });
    siteConfigDlg.show();
}

function getIcon(isEnabled) {
    return isEnabled ? "./helmet.png" : "./helmet-grey.png";
}

function enableListening(isEnabled) {
    button.icon = getIcon(isEnabled);
	if (isEnabled==true) {
		observer.register();
    }
	else {
		observer.unregister();
    }
	simpleStorage.storage.enable = isEnabled;
}

// executed on addon init
exports.main = function() {

    // icon in the module bar
    const { MenuButton } = require('./menu-button');
    button = MenuButton({
        id: 'UA-site-switch',
        label:  _("btn_label").split("\\n").join("\n"),
        icon: getIcon(simpleStorage.storage.enable),
        onClick: doConfig
    });

    // register the request listener    
    observer = {
		 // called by addObserver
		 QueryInterface: function (iid) {  
			mydebug("UA-site-switch: QueryInterface:" + iid);
         if (iid.equals(Ci.nsIObserver) ||  
			iid.equals(Ci.nsISupports))  
				return this;  
            
			throw Cr.NS_ERROR_NO_INTERFACE;
		},
		// react to events
		observe: function(subject, topic, data)   
		{  
			if (topic == "http-on-modify-request") {  
				// may change the agent according to the host
				var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);  
				var host = httpChannel.getRequestHeader("Host");
				var agent = getMatchingAgent(host);
				if (agent)
					httpChannel.setRequestHeader("User-Agent", agent, false);  
				mydebug("UA-site-switch: request, "+agent+";"+httpChannel.getRequestHeader("Host"));
			}
			else if (topic == "content-document-global-created") {
				var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);  
				var navigator = subject.navigator;
				var userAgent = httpChannel.getRequestHeader("User-Agent");
				if (navigator.userAgent != userAgent) Object.defineProperty(XPCNativeWrapper.unwrap(navigator), "userAgent", {value : userAgent, enumerable : true});
				
			}
		},
		get observerService() {  
			 return Cc["@mozilla.org/observer-service;1"]  
						 .getService(Ci.nsIObserverService);  
		},  
		
		register: function()  
		{  
			// false: no weak reference for listener
			 this.observerService.addObserver(this, "http-on-modify-request", false);
			 this.observerService.addObserver(this, "content-document-global-created", false);
			
		},  
		
		unregister: function()  
		{  
			 this.observerService.removeObserver(this, "http-on-modify-request");  
			 this.observerService.removeObserver(this, "content-document-global-created");
		}
    };
    if (simpleStorage.storage.enable==true) {
		observer.register();
    }
	
};

// cleanup
exports.onUnload = function() {
    button = null;
    if (simpleStorage.storage.enable==true)
		observer.unregister();
    // console.log("UA-site-switch: bye");
}
