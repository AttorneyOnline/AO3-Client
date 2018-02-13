var masterServer = 'http://gameboyprinter.moe/master.php';

$(document).ready(() => {
  $.getJSON(masterServer, (result) => {
    $.each(result['servers'], (i, field) => {
      $('.serverItems').append('<li><button class="btn serverBtn" data-ip="' + field.ip +'" data-port="' + field.port + '" data-motd="' + field.motd + '">' + field.name + '</button></li>');
    });

    //Register click handlers for new buttons
    $('.serverBtn').click((o) => {
      var remote = $(o.target).data('ip') + ':' + $(o.target).data('port');
      document.location.href = "client.html?remote=" + remote;
    });

    $('.serverBtn').mouseover((o) => {
      var remote = $(o.target).data('ip') + ':' + $(o.target).data('port');
      var motd = $(o.target).data('motd');

      $('.serverInfo').html(motd);
    });
  });
});
