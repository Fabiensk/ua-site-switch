var ua = document.getElementById('ua');

ua.addEventListener("keyup", function(event) {
  if (event.keyCode == 13) {
	  self.postMessage(ua.value);
  }
    return false;
}, true);
 
self.on('message', function(param) {
    document.getElementById('site').value = param[0];
    ua.value = param[1];
    ua.focus();
    ua.select();
});