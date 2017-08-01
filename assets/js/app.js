$(document).ready(function() {

  // var playerKeys  = [];
  var playerKeys = { player_1: '',  player_2: '' };
  var players     = database.ref( 'players' );
  var turn        = database.ref( 'turn' );
  var messageList = database.ref( 'message' );
  var playerCount = 0;
  var player1wins = 0;
  var player1losses = 0;
  var player2wins = 0;
  var player2losses = 0;

  // Tooltip for buttons
  $(document).tooltip({
    selector: '[data-toggle="tooltip"]'
  });

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
    $('#player-name-' + playerCount ).html( data.val().name ).removeClass('infinite');
    $('#player-number').html( playerCount );

    // Check how many players in players object
    players.once('value').then( function(snapshot) {
      var children = snapshot.numChildren();

      if ( children === 2 ) {
        database.ref().update({ turn: 1 });
        playerOptions( 1 );
      }

    });

    // Updated Wins/Losses in DOM Player1
    database.ref( 'players/' + playerKeys['player_1'] ).on('value', function(snapshot) {
      player1wins = snapshot.val().wins;
      player1losses = snapshot.val().losses;

      $('#player-box-1 .player-wins').html( player1wins );
      $('#player-box-1 .player-losses').html( player1losses );
    });

    // Updated Wins/Losses in DOM in DOM Player2
    database.ref( 'players/' + playerKeys['player_2'] ).on('value', function(snapshot) {
      player2wins = snapshot.val().wins;
      player2losses = snapshot.val().losses;

      $('#player-box-2 .player-wins').html( player2wins );
      $('#player-box-2 .player-losses').html( player2losses );
    });

    // Display Player 1 wins
    database.ref( 'players/' + playerKeys['player_1'] + '/wins' ).on('value', function(snapshot) {
      console.log( snapshot.val() );
      $('#game-results').html('<h3>Player 1 Wins</h3>').addClass('flash');

    });

    // Display Player 2 wins
    database.ref( 'players/' + playerKeys['player_2'] + '/wins' ).on('value', function(snapshot) {
      console.log( snapshot.val() );
      $('#game-results').html('<h3>Player 2 Wins</h3>').addClass('flash');
    });

  });

  // Generates Paper, Rock, Scissors buttons
  function playerOptions( playerNumber ) {

    $('#game-results').html('<h3>&nbsp;</h3>').removeClass('flash');

    var choices       = $('#player-box-'+ playerNumber + ' .player-choices');
    var choicesArr    = [ 'rock', 'paper', 'scissors' ];
    var iconsArr      = [ 'icon-rock.png', 'icon-paper.png', 'icon-scissors.png' ];
    var currentPlayer = playerKeys[ 'player_' + playerNumber ];
    choices.empty();

    $.each( choicesArr, function( index, val ) {
      var icon = $('<a href="#" data-player-id="'+ currentPlayer +'" data-player="'+  playerNumber +'" data-choice="'+ val +'">');
      icon.addClass('btn-choice');
      var iconImg = '<img src="assets/images/'+  iconsArr[index] +'" alt="'+ val +'" width="100" data-toggle="tooltip" data-placement="bottom" title="'+ val +'">';
      icon.html(iconImg);
      choices.append( icon );
    });
  }

  // Saves choice to DB
  $(document).on('click', '.btn-choice', function(event) {
    event.preventDefault();
    var choice    = $(this).data('choice');
    var playerId  = $(this).data('player-id');
    var player    = $(this).data('player');
    var iconImg = '<img src="assets/images/icon-'+  choice +'.png" alt="'+ choice +'" width="100" data-toggle="tooltip" data-placement="bottom" title="'+ choice +'">';

    var playerRef = database.ref( 'players/' + playerId );
    playerRef.update({
      choice: choice
    });

    $(this).parent().html( iconImg );

    // Next Turn
    var nextTurn = ( player === 1 ) ? 2 : 1 ;

    // Update Turn in DB
    database.ref().update({
      turn: nextTurn
    })

    if ( player == 2 ) {
      checkWinner();
    }

  });

  // Checks value of turn
  turn.on('value', function(snapshot) {
    var turn = snapshot.val();

    if ( turn == 1 ) {
      $('#player-box-1').addClass('player-active');
      $('#player-box-2').removeClass('player-active');
      playerOptions(1);
      $('#player-box-2 #player-choices').empty();
    } else if ( turn == 2 ) {
      $('#player-box-2').addClass('player-active');
      $('#player-box-1').removeClass('player-active');
      playerOptions(2);
      $('#player-box-1 #player-choices').empty();
    }
  });

  // Checks for Winner
  function checkWinner() {
    players.once('value', function(snapshot) {

      var player_1 = snapshot.val()[playerKeys.player_1];
      var player_2 = snapshot.val()[playerKeys.player_2];
      var player_1_choice = player_1.choice;
      var player_2_choice = player_2.choice;

      console.log('Player 1: ' + player_1_choice + ' Player 2: ' + player_2_choice );

      // Choices are empty
      if ( player_1_choice == '' || player_2_choice == '' ) {
        console.log('No Choice selected');
      }

      // Who won
      if ( player_1_choice == player_2_choice ) {
        $('#game-results').html('<h3>Tied Game</h3>').addClass('flash');
      }

      else if ( player_1_choice == 'rock' ) {
        if ( player_2_choice == 'paper' ) {

          player2wins++;
          player1losses++;
          updateWinsDB( 2, player2wins );
          updateLossesDB( 1, player1losses );
        }
        else if ( player_2_choice == 'scissors' ) {

          player1wins++;
          player2losses++;
          updateWinsDB( 1, player1wins );
          updateLossesDB( 2, player2losses );
        }
      }

      else if ( player_1_choice == 'paper' ) {
        if ( player_2_choice == 'rock' ) {

          player1wins++;
          player2losses++;
          updateWinsDB( 1, player1wins );
          updateLossesDB( 2, player2losses );
        }
        else if ( player_2_choice == 'scissors' ) {

          player2wins++;
          player1losses++;
          updateWinsDB( 2, player2wins );
          updateLossesDB( 1, player1losses );
        }
      }

      else if ( player_1_choice == 'scissors' ) {
        if ( player_2_choice == 'rock' ) {

          player2wins++;
          player1losses++;
          updateWinsDB( 2, player2wins );
          updateLossesDB( 1, player1losses );
        }

        else if (player_2_choice == 'paper') {

          player1wins++;
          player2losses++;
          updateWinsDB( 1, player1wins );
          updateLossesDB( 2, player2losses );
        }
      }

    });
  }

  // Update wins in DB
  function updateWinsDB( player, wins ) {
    // console.log( 'Player: ' + player + ' Has: ' + wins );
    database.ref( 'players/' + playerKeys['player_'+ player ] ).update({
      wins: wins
    });

  }

  // Update losses in DB
  function updateLossesDB( player, losses ) {
    // console.log( 'Player: ' + player + ' Has: ' + losses );
    database.ref( 'players/' + playerKeys['player_'+ player ] ).update({
      losses: losses
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