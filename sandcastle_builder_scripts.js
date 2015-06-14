
var autoclicker = setInterval(function(){
	if(Molpy.oldBeachClass == 'beachsafe' || Molpy.oldBeachClass == 'beachstreakextend'){
		Molpy.ClickBeach();
	}
	},
	100
);

// some macro
javascript:( function() { var js = document.createElement('script'); js.setAttribute('type', 'text/javascript'); js.setAttribute('src', 'http://xenko.github.io/BeachBall/BeachBall.js?'); document.head.appendChild(js); }() );


BeachBall.ClickBeach = function (number) {
	// added check to make best use of blast furnace
	if(BeachBall.optimizeFurnaceSand 
		&& Molpy.Boosts['Sand'].power > Molpy.Boosts['Castles'].nextCastleSand * .9 
		&& BeachBall.Time_to_ONG < 300){
			//console.log('too close to ONG');
			return;  //try to leave as much sand as possible for blast furnace
	}		
	
	if (Molpy.Got('Temporal Rift') == 0 && Molpy.ninjad != 0 && BeachBall.Time_to_ONG >= 5){
		//console.log('clicking');
		Molpy.ClickBeach();
		
	}
};

BeachBall.optimizeFurnaceSand = true;


// pope autoclicker
var popeclicker = setInterval(function(){
		var popeBoost = 'GlassSaw';
		var pope = Molpy.Boosts['The Pope'];
		// check that no pope boost is currently set and the desired boost is available
		if(!pope.power && Molpy.PapalDecrees[popeBoost].avail()){
			console.log('Setting Pope Boost to "'+popeBoost+'".');
			Molpy.SelectPapalDecree(popeBoost);
		}
	}
	, Molpy.NPlength * 1000 // run once per NP
);

// locked vault/key buyer
var vaultbuyer = setInterval(
	function(){
		var items = ['Locked Vault', 'Vault Key'];
		
		for (var i in items){
			var item = Molpy.Boosts[items[i]];
			// check whether vault is buyable
			if(item.bought < item.unlocked){
				// get sand and castles to buy the boost, even if unnecessary
				// use BeachBall.ClickBeach to ensure clicking is 'safe'
				BeachBall.ClickBeach(); 
				item.buy();
			}
		}
		
		
	},
	3*1000
);

var autoClicker = function(clicksPerTick, tickLength){
  var cheated = false;
  var intoTheAbyss = function(){
    if(!cheated){
      cheated = true;
      for(var i = 0; i < clicksPerTick; i++){
		  // autoclick action
        //MD.dig();
		BeachBall.ClickBeach();
      };
    cheated = false;
    };
  };
  return setInterval(intoTheAbyss, tickLength);
};

var beachAutoClicker = autoClicker(100, 5*1000);