$(document).ready(() => {
  $.getJSON('http://master.aceattorneyonline.com/master.php', (result) => {
    $.each(result['servers'], (i, field) => {
      $('.serverItems').append('<li><button class="btn serverBtn" data-ip="' + field.ip +'" data-port="' + field.port + '" data-motd="' + field.motd + '">' + field.name + '</button></li>');
    });

    //Register click handlers for new buttons
    $('.serverBtn').click((o) => {
      console.log($(o.target).data('ip') + ':' + $(o.target).data('port'));
      console.log($(o.target).data('motd'));
    });

    $('.serverBtn').mouseover((o) => {
      var remote = $(o.target).data('ip') + ':' + $(o.target).data('port');
      var motd = $(o.target).data('motd');

      $('.serverInfo').html(motd);
    });
  });
});
