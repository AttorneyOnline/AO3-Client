var remote;
var socket;
var connected = false;

$(document).ready(() => {
  //Button listeners
  $('#return').click(() => {
    document.location.href = 'index.html';
  });

  //Extract remote URL from URL
  var url = new URL(document.location.href);
  remote = url.searchParams.get('remote');

  //Open the WebSocket with the remote server
  socket = new WebSocket("ws://" + remote);
  socket.onopen = (event) => {
    var msg = {
      "type": "get",
      "get": "playerCount"
    };
    socket.send(JSON.stringify(msg));
  };

  socket.onmessage = (event) => {
    connected = true;
    console.log("Received: " + event.data);
    var response = JSON.parse(event.data);
    console.log(response);
  };

  socket.onerror = (event) => {
    console.log("error handled");
    console.log(event);
  };
});
