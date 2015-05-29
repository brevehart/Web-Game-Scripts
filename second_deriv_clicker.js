
var autobuy = setInterval(
	function(){
		var numBuildings = game.buildings().length;
		for(var i = 0; i < numBuildings; i++){
			if(game.buildings()[i].integrates_to() > 2*game.buildings()[i].qty()){
				game.buildings()[i].integrate();
			}
		}
	},
 1000);
 
var autoupgrade = setInterval(function(){game.buy_all_upgrades();}, 5*1000);


// override confirm dialog box
(function() {
   'use strict';

    // Might was well save this in case you need it later
    var oldConfirm = window.confirm;
    window.confirm = function (e) {
        // TODO: could put additional logic in here if necessary
        return true;
    };

} ());


var autoprestige = setInterval(function(){
	var threshhold = 2.25;
	var pp = game.prestige_preview();
	if(pp >= threshhold){
		console.log(pp + ': ' + new Date());
		game.new_game_plus();
	}
	},
	30*1000
);