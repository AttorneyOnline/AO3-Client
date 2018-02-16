const electron = (window && window.process && window.process.type) != undefined;

var remote;
var socket;
var connected = false;
var repos;
var manifests = {};
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
    $.each(repos, (i, repo) => {
      $.getJSON(repo + 'manifest', (manifest) => {
        manifests[repo] = manifest;
        write({
          'type': 'get',
          'get': 'assets'
        });
      });
    });
  },
  'assets': (response) => {
    assets = response.assets;
    var totalProgress = 0;
    $('#totalProgress').attr('max', assets.length);
    $('#totalProgress').attr('value', totalProgress);
    $.each(assets, (i, asset) => {
      //is it in our cache?
      localforage.getItem(asset, (err, value) => {
        if(value == null){
          console.log(`Asset ${asset} not stored, downloading...`);
          //Download asset
          var hit = false;
          var assetInfo;
          $.each(manifests, (name, manifest) => {
            if(hit)
              return;
            if(manifest.assets.includes(asset)){
              hit = true;
              $.getJSON(`${name}meta/${asset}/`, (result) => {
                //Download asset info
                localforage.setItem(asset, result);
                $('#downloadingAsset').html(result.name);
                //And download asset files
                var progress = 0;
                $('#assetProgress').attr('max', result.files.length);
                $.each(result.files, (i, file) => {
                  $.get(`${name}zfile/${asset}/${file}`, function(dl) {
                    $('#downloadingFile').html(file);
                    localforage.setItem(`${asset}/${file}`, pako.inflate(debase64(dl)));
                    progress++;
                    $('#assetProgress').attr('value', progress);
                  });
                })
              });
              totalProgress++;
              $('#totalProgress').attr('value', totalProgress);
            }
          });
          if(!hit){
            console.log("Asset not found in any given repos.");
          }
          //localforage.setItem(asset, );
        }
        else{
          //Everything is daijoubu
          console.log(value);
        }
      });
    });
  }
};

window.onbeforeunload = function() {
    socket.onclose = function () {}; // disable onclose handler first
    socket.close()
};

function debase64(base64) {
    var binary_string =  window.atob(base64);
    var ints = binary_string.split(',');
    var len = ints.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = ints[i];
    }
    return bytes.buffer;
}

function write(obj){
  socket.send(JSON.stringify(obj));
};
