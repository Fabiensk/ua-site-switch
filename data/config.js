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
