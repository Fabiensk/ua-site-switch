var ua = document.getElementById('ua');
 
ua.onkeyup = function(event) {
  if (event.keyCode == 13) {
    self.postMessage(ua.value);
    textArea.value = '';
  }
};
 
self.on('message', function(param) {
    document.getElementById('site').value = param;
    document.getElementById('ua').focus();
});