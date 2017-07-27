$(document).ready(function() {

  $('#btn-submit').on('click', function(e) {
    e.preventDefault();
    console.log('Clicked');
    var playerName = $('#name-input').val();

    database.ref().set({
      player: playerName
    });

  });

  database.ref().on("value", function( snapshot ) {
    console.log( snapshot.val() );

    $('#player-name-1').html( snapshot.val().player );

  }, function( error ) {
    console.log("The read failed: " + error.code);
  });

});