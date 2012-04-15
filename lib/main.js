// The main module of the fabsk Add-on.

require("chrome")

// Modules needed are `require`d, similar to CommonJS modules.
// In this case, creating a Widget that opens a new tab needs both the
// `widget` and the `tabs` modules.
var Widget = require("widget").Widget;
var tabs = require('tabs');

var service;
var observer;

exports.main = function() {

    // Widget documentation: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/packages/addon-kit/docs/widget.html

    new Widget({
        id: "UA-switch-auto",
        label: "UA-switch-auto",
        contentURL: "http://www.mozilla.org/favicon.ico",

        // Add a function to trigger when the Widget is clicked.
        onClick: function(event) {

	    var url = tabs.activeTab.url;
	    var match = url.match(/^https?:\/\/([^/]+)/);
	    if (match==null)		return;
            
            // Tabs documentation: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/packages/addon-kit/docs/tabs.html

            // Open a new tab in the currently active window.
	    var panels = require('panel');
            // tabs.open("http://www.mozilla.org");
	    var annotationEditor = panels.Panel({
		width: 220,
		height: 220,
		contentURL: require("self").data.url('add-site.html'),
		contentScriptFile: require("self").data.url('add-site.js'),
		onMessage: function(annotationText) {
		    if (annotationText) {
			console.log(annotationText);
		    }
		    annotationEditor.hide();
		},
		onShow: function() {		    
		    this.postMessage(match[1]);
		}
	    });
	    annotationEditor.show();
        }
    });

    console.log("UA-switch-auto: hello");


    service =
	Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observer = {
	QueryInterface: function (iid) {  
	    console.log("UA-switch-auto: QueryInterface:" + iid);
            if (iid.equals(Components.interfaces.nsIObserver) ||  
		iid.equals(Components.interfaces.nsISupports) ||
	       iid.equals(Components.interfaces.nsISupportsWeakReference))  
		return this;  
            
            Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;  
            return null;  
	},
	observe: function(subject, topic, data)   
	{  
	    if (topic == "http-on-modify-request") {  
		var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);  
		httpChannel.setRequestHeader("X-Hello", "World", false);  
		console.log("UA-switch-auto: request");
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
    service.addObserver(observer, "http-on-modify-request", true);
};

exports.onUnload = function() {
    observer.unregister();
    console.log("UA-switch-auto: bye");
}