$(document).ready(function() {

  // var playerKeys  = [];
  var playerKeys = { player_1: '',  player_2: '' };
  var players     = database.ref( 'players' );
  var turn        = database.ref( 'turn' );
  var messageList = database.ref( 'message' );
  var playerCount = 0;

  $('#player').hide();

  // When adding Name
  $('#btn-name-submit').on('click', function(e) {
    e.preventDefault();

    if ( playerCount > 2 ) {
      alert('There are 2 players already playing wait your turn!!!');
      return;
    }

    var playerName = $('#name-input').val();
    $('#btn-comment-submit').attr('data-sender', playerName);

    if ( playerCount < 1 ) {
      database.ref().set({
        players: '',
        turn: 0,
        message: ''
      });
    }

    addPlayer( playerName );

    $('#form-submit').hide();
    $('#player').show();
    $('#player-name').html( playerName );

  });

  // Adds player object in DB
  function addPlayer( playerName ){
    var newPlayer = players.push();
    newPlayer.set({
      name: playerName,
      wins: 0,
      losses: 0,
      choice: ''
    });
  }

  // When new player is added to players add key to array
  players.on('child_added', function( data ) {
    playerCount++;
    $('#name-input').val('');

    // Add DB Player Keys to array
    playerKeys[ 'player_' + playerCount ] = data.key;
    $('#player-name-' + playerCount ).html( data.val().name );
    $('#player-number').html( playerCount );

    // Check how many players in players object
    players.once('value').then( function(snapshot) {
      var children = snapshot.numChildren();

      if ( children === 2 ) {
        database.ref().update({ turn: 1 });
        playerOptions( 1 );
      }

    });

  });

  // Generates Paper, Rock, Scissors buttons
  function playerOptions( playerNumber ) {

    // $('#player-box-'+ playerNumber).addClass('player-active');
    var choices = $('#player-box-'+ playerNumber + ' #player-choices');
    var choicesArr = [ 'Paper', 'Rock', 'Scissors' ];
    var currentPlayer = playerKeys[ 'player_' + playerNumber ];
    choices.empty();

    $.each( choicesArr, function( index, val ) {
       choices.append('<a href="#" data-player-id="'+ currentPlayer +'" data-player="'+  playerNumber +'" class="btn btn-block btn-default btn-choice">'+ val +'</a>')
    });
  }

  // Saves choice to DB
  $(document).on('click', '.btn-choice', function(event) {
    event.preventDefault();
    var choice    = $(this).html();
    var playerId  = $(this).data('player-id');
    var player    = $(this).data('player');

    var playerRef = database.ref( 'players/' + playerId );
    playerRef.update({
      choice: choice
    });

    $(this).parent().html( choice );

    var nextTurn = ( player === 1 ) ? 2 : 1 ;

    database.ref().update({
      turn: nextTurn
    })

    // checkWinner();

  });

  // Checks value of turn
  turn.on('value', function(snapshot) {
    var turn = snapshot.val();

    if ( turn == 1 ) {
      $('#player-box-1').addClass('player-active');
      $('#player-box-2').removeClass('player-active');
      checkWinner();
      playerOptions(1);
      $('#player-box-2 #player-choices').empty();
    } else if ( turn == 2 ) {
      $('#player-box-2').addClass('player-active');
      $('#player-box-1').removeClass('player-active');
      checkWinner();
      playerOptions(2);
      $('#player-box-1 #player-choices').empty();
    } else if ( turn == 3 ){
      //Nothin yet
    }
  });

  function checkWinner() {
    players.once('value', function(snapshot) {

      var player_1 = snapshot.val()[playerKeys.player_1];
      var player_2 = snapshot.val()[playerKeys.player_2];
      var player_1_choice = player_1.choice;
      var player_2_choice = player_2.choice;

      // is there choices
      if ( player_1_choice == '' || player_2_choice == '' ) {
        // console.log('No Choice selected');
      }

      // Who won
      if ( player_1_choice == player_2_choice ) {
        $('#game-results').html('Tied Game');
      }

      else if ( player_1_choice == 'Rock' ) {

        if ( player_2_choice == 'Paper' ) {
          $('#game-results').html('Player 2 Won');

          updateWinsDB();
        }
        else if ( player_2_choice == 'Scissors' ) {
          $('#game-results').html('Player 1 Won');

          updateWinsDB();
        }

      }

      else if ( player_1_choice == 'Paper' ) {
        if ( player_2_choice == 'Rock' ) {
          $('#game-results').html('Player 1 Won');

          player1wins++;

          database.ref( 'players/' + playerKeys['player_1'] ).update({
            wins: player1wins
          });

        }
        else if ( player_2_choice == 'Scissors' ) {
          $('#game-results').html('Player 2 Won');

          player2wins++;

          database.ref( 'players/' + playerKeys['player_2'] ).update({
            wins: player2wins
          });

        }
      }

      else if ( player_1_choice == 'Scissors' ) {
        if ( player_2_choice == 'Rock' ) {
          $('#game-results').html('Player 2 Won');

          player2wins++;

            database.ref( 'players/' + playerKeys['player_2'] ).update({
              wins: player2wins,
            });

        } else if (player_2_choice == 'Paper') {
          $('#game-results').html('Player 1 Won');

          player1wins++;

            database.ref( 'players/' + playerKeys['player_1'] ).update({
              wins: player1wins
            });

        }
      }

    });
  }

  function updateWinsDB() {

    var player1wins = 0;
    var player2wins = 0;
    player2wins++;

    database.ref( 'players/' + playerKeys['player_2'] ).update({
      wins: player2wins
    });
  }


  // Comment form when clicking submit
  $('#btn-comment-submit').on('click', function(e) {
    e.preventDefault();

    var chatMessage = $('#comment-input').val();
    var sender = $( $(this) ).attr('data-sender');
    addMessage( chatMessage, sender );

    // Clear Textarea
    $('#comment-input').val('');
  });

  // Comment form when hitting enter
  $('#comment-input').on('keypress', function (e) {
    if( e.which == 13 ) {
      e.preventDefault();

      var chatMessage = $(this).val();
      var sender = $('#btn-comment-submit').attr('data-sender');
      addMessage( chatMessage, sender );

      $(this).val('');
    }
  });

  // Adds Message to firebase
  function addMessage( chatMessage, sender ) {
    var newMessage = messageList.push();
    newMessage.set({
      'text': chatMessage,
      'sender': sender
    });
  }

  // When new message is added to the messageList
  messageList.on('child_added', function(data) {
    renderMessage( data.val().text, data.val().sender );
  });

  // Render message in DOM
  function renderMessage( message, sender ) {
    var chatMessage = '<blockquote class="blockquote-message"><p>'+  message +'</p><footer>'+ sender +'</footer></blockquote>';
    $('#chat').append( chatMessage );
  }

});