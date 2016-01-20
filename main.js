'use strict';

$( document ).ready(init);

function init() {

    $(document).on('click', '.holder', holderClicked);
    $('#startgame').on('click', enterName);
    $('#restart').on('click', restartGame);
    setGlobalDOM();

}



//GLOBALS

//firebase initiation------------
var ref = new Firebase('https://jmmtic.firebaseio.com/');
var allPlayersRef = ref.child('players');
// var currentPlayerRef = ref.child('players').push();
// var amOnline = ref.child(".info/connected");
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

var playerSymb = '';


function setGlobalDOM(){
    var clearBoardState = $('.board-contain').html();
    clearGameState.boardstate = JSON.stringify(clearBoardState);
}



function restartGame(){
    console.log('RESET GAME!');
    syncGameState.set(null);
    syncGameState.push(clearGameState);
    allPlayersRef.set(null);
}




//only allow two players, 3+ can watch
function enterName(){

    var username = $('#username').val();


    allPlayersRef.once('value', function(snapshot){
        if(!snapshot.val()){
            var playerObj = {
                username: username,
                symbol: 'X'
            }
            allPlayersRef.push(playerObj);
            playerSymb = 'X';

        }
        else if(Object.keys(snapshot.val()).length === 1 ){
            var playerObj = {
                username: username,
                symbol: 'O'
            }
            allPlayersRef.push(playerObj);
            playerSymb = 'O';
        }
        else{
            alert('sorry, there are already 2 players!');
            return;
        }
    })
}


syncGameState.on('value', function(snapshot){

    // debugger;

    if (snapshot.val()){
        var getFrozenObj = snapshot.val()[Object.keys(snapshot.val())];
        var thawedAndParsed = JSON.parse(getFrozenObj.boardstate);
        var gameBoardtoAppend = $.parseHTML(thawedAndParsed);
        // debugger;
        $('.board-contain').empty().append(gameBoardtoAppend);
    }

    // debugger;

})






//---------------------orig game code-----------------------------

//input handler
function holderClicked(event) {



  var holder = $(this);
  // debugger;
  var holderNum = parseInt(holder.attr('id').slice(-1), 10);

  // only let user select tile if not yet selected
  // debugger;
  if (holder.hasClass('selected') === gameStateObj.gamewon && gameStateObj.turntoggle === playerSymb) {
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
      console.log(gameStateObj.turntoggle+' WINS!');
      gameStateObj.gamewon = true;
      var winArray = winCombos[i]
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
//-----------------------------------
