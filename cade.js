'use strict';
var timestamp = Date.now();

var ref = new Firebase('https://cadetest.firebaseio.com/');
var amOnline = ref.child('.info/connected');
var usersRef = ref.child('users');
var playersRef = ref.child('players');
var selfRef = usersRef.child(timestamp);

var currentPlayerRef = ref.child('currentPlayer');
var players, currentPlayer;

var $playerState, $theButton, $currentPlayer;

$(document).ready(function() {
  $currentPlayer = $("#currentPlayer")
  $theButton = $('#theButton');
  $playerState = $('#playerState');
  $theButton.click(clickButton);
});

function clickButton() {
  var nextPlayer = currentPlayer === 1 ? 0 : 1;
  currentPlayerRef.set(nextPlayer);
}

function checkPlayer(){
  if(players[currentPlayer] === timestamp.toString()){
    $theButton.prop('disabled', false);
  } else {
    $theButton.prop('disabled', true);
  }
}

playersRef.on('value', function(snap) {
  players = snap.val();
  $playerState.text('');
  snap.forEach(function(playerSnap) {
    if(playerSnap.val() === timestamp.toString()) {
      $playerState.text("You're Player " + playerSnap.key());
    }
  });
  checkPlayer();
});

currentPlayerRef.on('value', function(snap) {
  $currentPlayer.text(snap.val());
  currentPlayer = snap.val();
  checkPlayer();
});

usersRef.on('value', function(snap) {
  var users = 0;
  snap.forEach(function(userSnap) {
    if(users < 2) {
      playersRef.child(users).set(userSnap.key());
    }
    users++;
  });
});

amOnline.on('value', function(snap) {
  if (snap.val()) {
    selfRef.onDisconnect().remove();
    selfRef.set(true);
  }
});
