$(document).ready(function() {

  var playerKeys  = [];
  var players     = database.ref( 'players' );
  var turn        = database.ref( 'turn' );
  var messageList = database.ref( 'message' );

  // When adding Name
  $('#btn-name-submit').on('click', function(e) {
    e.preventDefault();
    var playerName = $('#name-input').val();

    if ( playersConnected === 1 ) {
      database.ref().set({
        players: '',
        turn: '',
        message: ''
      });
    }

    addPlayer( playerName );

    $('#form-submit').hide();
    $('#player-name').html( playerName );
    // $('#player-number').html( playerNumber );

  });

  function addPlayer( playerName ){
    var newPlayer = players.push();
    newPlayer.set({
      name: playerName,
      wins: 0,
      losses: 0
    });
  }

  // When new player is added to players add key to array
  players.on('child_added', function( data ) {
    playerKeys.push(data.key);
  });

  // Comment form when clicking submit
  $('#btn-comment-submit').on('click', function(e) {
    e.preventDefault();

    var chatMessage = $('#comment-input').val();
    addMessage( chatMessage );

    // Clear Textarea
    $('#comment-input').val('');

  });

  // Comment form when hitting enter
  $('#comment-input').on('keypress', function (e) {
    if( e.which == 13 ) {
      e.preventDefault();

      var chatMessage = $(this).val();
      addMessage( chatMessage );

      $(this).val('');

    }
  });


  // Checking for updated values in DB
  database.ref().on("value", function( snapshot ) {
    // console.log( snapshot.val() );

    // Add player name to DOM
    $('#player-name-1').html( snapshot.val().player );


  }, function( error ) {
    console.log("The read failed: " + error.code);
  });

  // Adds Message to firebase
  function addMessage( chatMessage ) {
    var newMessage = messageList.push();
    newMessage.set({
      'text': chatMessage
    });
  }

  // When new message is added to the messageList
  messageList.on('child_added', function(data) {
    renderMessage( data.val().text );
  });

  // Render message in DOM
  function renderMessage( message ) {
    var chatMessage = '<blockquote><p>'+  message +'</p><footer>Someone famous in <cite title="Source Title">User</cite></footer></blockquote>';
    $('#chat').append( chatMessage );
  }

});