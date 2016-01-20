'use strict';

$( document ).ready(init);

function init() {
    $(document).on('click', '.holder', holderClicked);
    $('#startgame').on('click', enterName);
    $('#restart').on('click', restartGame);
    setGlobalDOM();
}



//GLOBALS


var ref = new Firebase('https://jmmtic.firebaseio.com/');
var allPlayersRef = ref.child('players');
var userUniqueRef = moment().format('MMDDYYYY-hhmmssSS');
var syncGameState = ref.child('gamestate');


var gameStateObj = {
    turntoggle: 'X',
    gamewon: false,
    boardstate: {}
};
var clearGameState = {
    turntoggle: 'O',
    gamewon: false,
    boardstate: {}
};
var playerSymb;
var currentLocalTurn;


function setGlobalDOM(){
    var clearBoardState = $('.board-contain').html();
    clearGameState.boardstate = JSON.stringify(clearBoardState);
}

function restartGame(){
    syncGameState.set(null);
    syncGameState.push(clearGameState);
    allPlayersRef.set(null);
}

//only allow two players, 3+ can watch
function enterName(){
    var username = $('#username').val();

    allPlayersRef.once('value', function(snapshot){
        if(!snapshot.val() && playerSymb === undefined){
            var playerObj = {
                username: username,
                symbol: 'X'
            }
            allPlayersRef.push(playerObj);
            playerSymb = 'X';
            $('#username').detach();
            $('#startgame').detach();
            var $playerText = $('<p>').text(username+" is 'X'!");
            $('#usernamecontain').append($playerText);

        }
        else if(Object.keys(snapshot.val()).length === 1 && playerSymb === undefined){
            var playerObj = {
                username: username,
                symbol: 'O'
            }
            allPlayersRef.push(playerObj);
            playerSymb = 'O';
            $('#username').detach();
            $('#startgame').detach();
            var $playerText = $('<p>').text(username+" is 'O'!");
            $('#usernamecontain').append($playerText);
        }
        else if(playerSymb !== undefined){
            alert("You're already playing!");
            return;
        }
        else {
            alert("There are already two players!");
            return;
        }
    })
}



syncGameState.on('value', function(snapshot){

    if (snapshot.val()){
        var getFrozenObj = snapshot.val()[Object.keys(snapshot.val())];
        gameStateObj = getFrozenObj;
        currentLocalTurn = getFrozenObj.turntoggle;
        var thawedAndParsed = JSON.parse(getFrozenObj.boardstate);
        var gameBoardtoAppend = $.parseHTML(thawedAndParsed);
        $('.board-contain').empty().append(gameBoardtoAppend);
        var whosTurn = $('<p>').text("It's "+gameStateObj.turntoggle+"'s turn!").attr('id', 'turnmessage');

        if (gameStateObj.gamewon === false){
            $('#turnmessage').remove();
            $('#usernamecontain').append(whosTurn);
        }
    }
})




//input handler
function holderClicked(event) {
  var holder = $(this);
  var holderNum = parseInt(holder.attr('id').slice(-1), 10);
  // only let user select tile if not yet selected
  var currentTurn = $('.board').data().turn;
  if (holder.hasClass('selected') === false && gameStateObj.gamewon === false && gameStateObj.turntoggle === playerSymb) {
    //add x or o tile to div
    holder.addClass('selected animated bounceIn');
    holder.append("<div class='tile col-xs-12' id='tile"+holderNum+"'>"+gameStateObj.turntoggle+"</div>");
  }

  //evaluate if win conditions are met
  var winCombos = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[7,5,3]];
  for (var i = 0;i < winCombos.length;i++){
    var resultInner = 0;
    var currentArray = winCombos[i];

        for (var x = 0;x < winCombos[i].length;x++){
          var currentPos = currentArray[x];
          var curXvalues = parseInt($('#tile'+currentPos+':contains('+gameStateObj.turntoggle+')').length, 10);
          if (curXvalues === 1) {
              resultInner++;
          }
        }
    //if 3 in a row, game won
    if (resultInner === 3) {
      gameStateObj.gamewon = true;
      $('#turnmessage').text(gameStateObj.turntoggle + " Won!");
      var winArray = winCombos[i];
      for (var y = 0;y < winArray.length;y++){
        $('#tile'+winArray[y]+':contains('+gameStateObj.turntoggle+')').addClass('win animated pulse infinite');

      }
    }
}


    if (gameStateObj.turntoggle === playerSymb){
        //toggle x-o each turn
        if (gameStateObj.turntoggle === "X"){
          gameStateObj.turntoggle = "O";
        }
        else {
          gameStateObj.turntoggle = "X";
        }
        $('.board').attr('data-turn', gameStateObj.turntoggle);
        var currentBoardinDOM = $('.board-contain').html();


        gameStateObj.boardstate = JSON.stringify(currentBoardinDOM);
        var frozenGameState = gameStateObj;
        syncGameState.set(null);
        syncGameState.push(frozenGameState);

    }





}
