var masterServer = 'http://master.aceattorneyonline.com/master.php';

$(document).ready(() => {
  $.getJSON(masterServer, (result) => {
    $('#motd').html(result['motd']);
    $.each(result['servers'], (i, field) => {
      $('.serverItems').append('<li><button class="btn serverBtn" data-ip="' + field.ip +'" data-port="' + field.port + '" data-motd="' + field.motd + '" data-connected="false" data-playerinfo="Offline">' + field.name + '</button></li>');
    });

    //Register click handlers for new buttons
    $('.serverBtn').click((o) => {
      var remote = $(o.target).data('ip') + ':' + $(o.target).data('port');
      document.location.href = "client.html?remote=" + remote;
    });

    $('#favoriteTab').click((o) => {
      $('#serverTab').removeClass('active');
      $('.masterList').addClass('hidden');
      $('#favoriteTab').addClass('active');
      $('.favoriteList').removeClass('hidden');
    });

    $('#serverTab').click((o) => {
      $('#favoriteTab').removeClass('active');
      $('.favoriteList').addClass('hidden');
      $('#serverTab').addClass('active');
      $('.masterList').removeClass('hidden');
    });

    $('.serverBtn').mouseover((o) => {
      var remote = $(o.target).data('ip') + ':' + $(o.target).data('port');
      var motd = $(o.target).data('motd');

      //Connect to the server to get the current number of players
      $('.serverMOTD').html(motd);
      $('.serverBar').html('<p>' + $(o.target).data('playerinfo') + '</p>');

      if(!$(o.target).data('connected')){
        var socket = new WebSocket("ws://" + remote);
        socket.onopen = (event) => {
          var msg = {
            "type": "get",
            "get": "playerCount"
          };
          socket.send(JSON.stringify(msg));
        };
        socket.onmessage = (event) => {
          var response = JSON.parse(event.data);
          $(o.target).data('playerinfo', "Players: " + response.current + " / " + response.max);
          $('.serverBar').html('<p>' + $(o.target).data('playerinfo') + '</p>');
        };

        $(o.target).data('connected', 'true');
      }
    });
  });
});
