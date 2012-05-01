var ua = document.getElementById('ua');

function onDel(evt, site) {
	$(evt.target).parents("li").remove();
	self.postMessage(["remove", site]);
}

ua.addEventListener("keyup", function(event) {
  if (event.keyCode == 13) {
	  self.postMessage(["add", ua.value]);
  }
    return false;
}, true);
 
self.on('message', function(param) {
    document.getElementById('site').value = param[0];
    ua.value = param[1];
    ua.focus();
    ua.select();

	var all = param[2];
    var sites = document.getElementById('sites');
	console.log(all);
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
