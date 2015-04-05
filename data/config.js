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
var ua = document.getElementById('ua');

// delete an entry
function onDel(evt, domain) {
	$(evt.target).parents("li").remove();
	self.postMessage(["remove", domain]);
}

$( "#tabs" ).tabs();

// init the config window
self.on('message', function(param) {
	// current domain
	if (param[0]==null) {
		// not a domain
		$('#tabs').tabs("select", 1);
		$('#tabs').tabs("option","disabled", [0]);
	} else {
		// callback on enter: save
		$("#tabs-1").keyup( function(event) {
		if (event.keyCode == 13) {
			  var sub = "";
			  if ($("#subdomain").attr('checked'))
				sub = ".";
			  self.postMessage(["add", sub+$("#site").val(), ua.value]);
		  }
			return false;
		});
		document.getElementById('site').value = param[0];
		ua.value = param[1];
		ua.focus();
		ua.select();
	}
	
	var checkbox = $('#enabled');
	checkbox.attr("checked", param[2]);
	checkbox.change(function(evt){
		self.postMessage(["enable", evt.target.checked]);
		});

	// all sites
	var all = param[3];
    var sites = document.getElementById('sites');
	$.each(all, function(site, agent) {
		console.log("Adding:", site, agent);
		var site_label = site;
		if (site_label.substr(0, 1)==".") {
				site_label = site_label.substr(1) + " (and subdomains)";
		}			
		var model = $(".model")
		model.find("span.site").empty().append(site_label);
		model.find(".agent").empty().append(agent);
		var copy = model.clone();
		copy.removeClass("model").css("display", "");
		copy.find(".del").click(function(evt){ onDel(evt, site); });
		copy.appendTo($(sites));
	});

});
