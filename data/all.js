function onDel(evt, site) {
	$(evt.target).parents("li").remove();
	self.postMessage(site);
}

self.on('message', function(param) {
    var sites = document.getElementById('sites');
	console.log(param);
	$.each(param, function(site, agent) {
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
