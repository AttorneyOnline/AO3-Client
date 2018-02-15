const electron = (window && window.process && window.process.type) != undefined;

var remote;
var socket;
var connected = false;
var repos;
var manifests = [];
var assets;

$(document).ready(() => {
  //Button listeners
  $('#return').click(() => {
    document.location.href = 'index.html';
  });

  //Extract remote URL from URL
  var url = new URL(document.location.href);
  remote = url.searchParams.get('remote');

  //Open the WebSocket with the remote server
  socket = new WebSocket('ws://' + remote);
  socket.onopen = (event) => {
    //Send a player count request to ensure the server is alive
    write({
      'type': 'get',
      'get': 'playerCount'
    });
  };

  socket.onmessage = (event) => {
    //Debug
    console.log('Received: ' + event.data);

    var response = JSON.parse(event.data);
    handlers[response.type](response);
  };

  socket.onerror = (event) => {
    console.log('error handled');
    console.log(event);
  };
});

const handlers = {
  'playerCount': (response) => {
    //Server is alive!
    connected = true;
    $('.loading').addClass('hidden');
    write({
      'type': 'get',
      'get': 'repos'
    });
  },
  'repos': (response) => {
    repos = response.repos;
    $.each(repos, (i) => {
      $.getJSON(repos[i] + 'manifest', (manifest) => {
        manifests[repos[i]] = manifest;
        console.log(manifests);
        write({
          'type': 'get',
          'get': 'assets'
        });
      });
    });
  },
  'assets': (response) => {
    console.log(response);
    assets = response.assets;
    $.each(assets, (i) => {
      var asset = assets[i];
      //is it in our cache?
      console.log(asset);
    })
  }
};

window.onbeforeunload = function() {
    socket.onclose = function () {}; // disable onclose handler first
    socket.close()
};

function write(obj){
  socket.send(JSON.stringify(obj));
};
