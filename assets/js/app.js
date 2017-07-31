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

    var choices = $('#player-box-'+ playerNumber + ' #player-choices');
    var choicesArr = [ 'Rock', 'Paper', 'Scissors' ];
    var iconsArr = [ 'icon-rock.png', 'icon-paper.png', 'icon-scissors.png' ];
    var currentPlayer = playerKeys[ 'player_' + playerNumber ];
    choices.empty();

    $.each( choicesArr, function( index, val ) {
      var icon = $('<a href="#" data-player-id="'+ currentPlayer +'" data-player="'+  playerNumber +'" data-choice="'+ val +'">');
      icon.addClass('btn-choice');
      var iconImg = '<img src="assets/images/'+  iconsArr[index] +'" alt="'+ val +'" width="100" >';
      icon.html(iconImg);
      choices.append( icon );

       // choices.append('<a href="#" data-player-id="'+ currentPlayer +'" data-player="'+  playerNumber +'" class="btn btn-block btn-default btn-choice">'+ val +'</a>')
    });
  }

  // Saves choice to DB
  $(document).on('click', '.btn-choice', function(event) {
    event.preventDefault();
    var choice    = $(this).data('choice');
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
        $('#game-results').html('Tied Game');
        console.log('Tied');
      }

      else if ( player_1_choice == 'Rock' ) {

        if ( player_2_choice == 'Paper' ) {
          $('#game-results').html('Player 2 Won');

          player2wins++;
          player1losses++;
          updateWinsDB( 2, player2wins );
          updateLossesDB( 1, player1losses );
          console.log('Player 2 Won');
        }
        else if ( player_2_choice == 'Scissors' ) {
          $('#game-results').html('Player 1 Won');

          player1wins++;
          player2losses++;
          updateWinsDB( 1, player1wins );
          updateLossesDB( 2, player2losses );
          console.log('Player 1 Won');
        }

      }

      else if ( player_1_choice == 'Paper' ) {
        if ( player_2_choice == 'Rock' ) {
          $('#game-results').html('Player 1 Won');

          player1wins++;
          player2losses++;
          updateWinsDB( 1, player1wins );
          updateLossesDB( 2, player2losses );
          console.log('Player 1 Won');

        }
        else if ( player_2_choice == 'Scissors' ) {
          $('#game-results').html('Player 2 Won');

          player2wins++;
          player1losses++;
          updateWinsDB( 2, player2wins );
          updateLossesDB( 1, player1losses );
          console.log('Player 2 Won');

        }
      }

      else if ( player_1_choice == 'Scissors' ) {
        if ( player_2_choice == 'Rock' ) {
          $('#game-results').html('Player 2 Won');

          player2wins++;
          player1losses++;
          updateWinsDB( 2, player2wins );
          updateLossesDB( 1, player1losses );
          console.log('Player 2 Won');

        } else if (player_2_choice == 'Paper') {
          $('#game-results').html('Player 1 Won');

          player1wins++;
          player2losses++;
          updateWinsDB( 1, player1wins );
          updateLossesDB( 2, player2losses );
          console.log('Player 1 Won');;

        }
      }

    });
  }

  // Update wind in DB
  function updateWinsDB( player, wins ) {
    // console.log( 'Player: ' + player + ' Has: ' + wins );
    database.ref( 'players/' + playerKeys['player_'+ player ] ).update({
      wins: wins
    });
  }

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

  // Updated Wins/Losses in DOM
  database.ref( 'players/' + playerKeys['player_1'] ).on('value', function(snapshot) {

    var wins = snapshot.val().wins;
    var losses = snapshot.val().losses;

    $('#player-box-1 .player-wins').html( wins );
    $('#player-box-1 .player-losses').html( losses );

  });

  // Updated Wins/Losses in DOM
  database.ref( 'players/' + playerKeys['player_2'] ).on('value', function(snapshot) {

    var wins = snapshot.val().wins;
    var losses = snapshot.val().losses;

    $('#player-box-2 .player-wins').html( wins );
    $('#player-box-2 .player-losses').html( losses );

  });

});