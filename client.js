$(document).ready(() => {
  var url = new URL(document.location.href);
  var remote = url.searchParams.get('remote');
  console.log(remote);
  $('#return').click(() => {
    document.location.href = 'index.html';
  });
});
