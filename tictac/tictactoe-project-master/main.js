'use strict';
$( document ).ready(init);

function init() {
    $('.holder').on('click', holderClicked);
}
var turnToggle = "X";
var gameWon = false;

//input handler
function holderClicked(event) {
  var holder = $(this);
  var holderNum = parseInt(holder.attr('id').slice(-1), 10);

  // only let user select tile if not yet selected
  if (holder.hasClass('selected') === gameWon) {
    //add x or o tile to div
    holder.addClass('selected animated bounceIn');
    holder.append("<div class='tile col-xs-12' id='tile"+holderNum+"'>"+turnToggle+"</div>");
  }

  //evaluate if win conditions are met
  var winCombos = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[7,5,3]];
  for (var i = 0;i < winCombos.length;i++){
    var resultInner = 0;
    var currentArray = winCombos[i];

        for (var x = 0;x < winCombos[i].length;x++){
          var currentPos = currentArray[x];
          var curXvalues = parseInt($('#tile'+currentPos+':contains('+turnToggle+')').length, 10);
          if (curXvalues === 1) {
              resultInner++;
          }
        }
    //if 3 in a row, game won
    if (resultInner === 3) {
      console.log(turnToggle+' WINS!');
      gameWon = true;
      var winArray = winCombos[i]
      for (var y = 0;y < winArray.length;y++){
        $('#tile'+winArray[y]+':contains('+turnToggle+')').addClass('win animated pulse infinite');
      }
    }
}
  //toggle x-o each turn
  if (turnToggle === "X"){
    turnToggle = "O";
  }
  else {
    turnToggle = "X";
  }
}
