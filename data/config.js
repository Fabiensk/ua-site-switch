var ua = document.getElementById('ua');

// delete an entry
function onDel(evt, site) {
	$(evt.target).parents("li").remove();
	self.postMessage(["remove", site]);
}

$( "#tabs" ).tabs();

// init the config window
self.on('message', function(param) {
	// current site
	if (param[0]==null) {
		// not a site
		$('#tabs').tabs("select", 1);
		$('#tabs').tabs("option","disabled", [0]);
	} else {
		// callback on enter: save current site
		ua.addEventListener("keyup", function(event) {
		  if (event.keyCode == 13) {
			  self.postMessage(["add", ua.value]);
		  }
			return false;
		}, true);
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
		var model = $(".model")
		model.find("span.site").empty().append(site);
		model.find(".agent").empty().append(agent);
		var copy = model.clone();
		copy.removeClass("model").css("display", "");
		copy.find(".del").click(function(evt){ onDel(evt, site); });
		copy.appendTo($(sites));
	});

});
