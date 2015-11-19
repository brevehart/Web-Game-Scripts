
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

BeachBall.Settings['BeachAutoClick'].setting = 0.01;
var autoClicker = function(clicksPerTick, tickLength){
  var cheated = false;
  var intoTheAbyss = function(){
	BeachBall.Ninja(); // ninja ritual autoclick
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

var beachAutoClicker = autoClicker(20000, 500);

var popeclicker = setInterval(function(){
	if(!Molpy.Boosts['The Pope'].power){
		Molpy.SelectPapalDecree('Diamonds');
	}
}, 30*1000);


// dragon hatching/fledging
var hiccup = {
	autoFledgeNP: undefined,
	autoFledge: true,
	autoFeed: false,
	autoFeedPrincesses: false,
	fillToMaxDragons: false,
	autoEggAmount: 1,
};

hiccup.maxDragons = function(np){
	 return Math.ceil(np/100);
};

hiccup.dragmaint = function() {
	var hl = Molpy.Boosts['Hatchlings'];	
	for (var cl in hl.clutches) {
		if (hl.age[cl] < 1000) {
			if (Molpy.Boosts.DQ.overallState != 3) { // can't fledge while celebrating
						 
				var fledgeNP = this.autoFledgeNP || 1;
				while(Molpy.NPdata[fledgeNP] && Molpy.NPdata[fledgeNP].amount >= 1){
					fledgeNP ++;
				}
				
				// also send to cryo if clutch size smaller than max allowed dragons for this np
				var extraDragons = hl.clutches[cl] - hiccup.maxDragons(fledgeNP);
				
				// freeze if desired or will waste dragons or too few dragons and fillToMaxDragons is true
				if ((!this.autoFledge || extraDragons > 0 || (this.fillToMaxDragons && extraDragons < 0)) && Molpy.Got('Cryogenics')){					 
					 Molpy.DragonsToCryo(cl);
					 continue;
				} else {
					// jump to next NP for fledging
					Molpy.TTT(fledgeNP, 1, true);
					// attempt to fledge clutch
					Molpy.DragonFledge(cl);
					// if successful fledge, increment fledgeNP
					if(Molpy.NPdata[fledgeNP].amount >= 1) fledgeNP ++;
					//jump back to highest NP
					Molpy.NowWhereWasI();
				}

			} 
		} else if (hl.diet[cl]) {
			//str += 'is maturing and will be ready to Fledge in ' + (hl.age[cl]-1000) + 'mNP.<br>';
		} else {
			var cls = hl.clutches[cl];
			
			if (this.autoFeedPrincesses && Molpy.Has('Princesses',cls*10)) Molpy.DragonFeed(cl,3);
			if (this.autoFeed && Molpy.Has('Goats',cls*1e6)) Molpy.DragonFeed(cl,1);
		}
	}
};
		

hiccup.dragonfledger = setInterval(function(){hiccup.dragmaint();}, 100*1000);

hiccup.knightattacker = function() {
    if (Molpy.Redacted.drawType == "knight") {
		Molpy.Save();
		var targetNP = Molpy.Redacted.opponents.target;
		var npd = Molpy.NPdata[targetNP];
        var previousDragons = npd.amount;
		Molpy.DragonKnightAttack();
		var currentDragons = npd.amount;
		if(currentDragons < previousDragons) {
			// lost a dragon so reload
			Molpy.Load();
		}		
    }
};

hiccup.autoknight = setInterval(function(){hiccup.knightattacker()}, 3000);

hiccup.egglayer = function() {
	if(Molpy.Boosts['Eggs'].Level < this.autoEggAmount)
	{
		if(Molpy.Spend({Bonemeal: Molpy.EggCost()}))
		{
			Molpy.Add('Eggs', 1);
		}
	}
};
	
hiccup.autoegg = setInterval(function(){hiccup.egglayer();}, 5000);

hiccup.speedFactor = 8;
hiccup.timeBoost = setInterval(function() {
	Molpy.mNPlength = Math.floor(1800/hiccup.speedFactor);
/* 	if(Molpy.ONGelapsed > Molpy.NPlength * 1000 / hiccup.speedFactor){
		Molpy.ONG();
	} */
	
}, 5*1000);


// CDSP/GDLP auto increase
var cdspAutoBuyer = function() {
	//console.log('cdsp autobuyer');
	var cdsp = Molpy.Boosts['CDSP'];
	if (cdsp.bought == cdsp.power+1 || cdsp.power >= Molpy.Level('PR')/2) { // cdsp at high power
		// take rifts while cdsp is at high power to get goats
		if (!(Molpy.Boosts['Time Lord'] && Molpy.Boosts['Time Lord'].bought && Molpy.Boosts['Time Lord'].power))
			return;
		if (Molpy.Got('Temporal Rift') && Molpy.Boosts['Sand'].Has(1)) //rift occuring, sand in stock
			Molpy.RiftJump();
		//console.log('trying to switch to low power');
		cdsp.control();
	} else {
		var mario = Molpy.Boosts['Mario'];
		if (Molpy.Got('The Fading') && Molpy.Has('Goats',Infinity) && Molpy.Got('Aleph e') && Molpy.Boosts['AD'].power >= Infinity) {
			//console.log(mario);
			if(!mario.IsEnabled){
				//console.log('enabling');
				//Molpy.GenericToggle(mario.id, 1);
			}
			
			//console.log('inf goats');
			val = Math.pow(10,Math.floor(Math.log(cdsp.bought)*Math.LOG10E));
			if (!Molpy.Got('GDLP')) val = Math.max(0,Math.min(val,Molpy.Level('PR')/2-cdsp.bought));
			if (val) {
				//console.log('buying wisdom');
				Molpy.GainDragonWisdom(val);
			}
		} else {
			//console.log('waiting for inf goats');
			if(mario.IsEnabled){
					Molpy.GenericToggle(mario.id, 1);
			}
		}
	}
};

var cdspAutoBuy = setInterval(cdspAutoBuyer, 10*1000);