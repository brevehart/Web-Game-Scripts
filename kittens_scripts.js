// kittens_scripts.js
//
// add some additional features to Kittens Game
// bookmarklet:::
// javascript:(function(){var d=document,s=d.createElement('script');s.src='https://rawgit.com/brevehart/Web-Game-Scripts/kittens-updates/kittens_scripts.js';d.body.appendChild(s);})();

//noinspection JSUnusedGlobalSymbols
var ks = {
	game: gamePage,


    // mark upgrades as worthless if they only benefit non-script users
    worthlessUpgrades: ['factoryAutomation', 'advancedAutomation', 'pneumaticPress', 'steelPlants', 'barges'],


    calcKarma:	function(){
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        var kittens = this.game.resPool.get('kittens').value;
		var newKarmaKittens = 0;
			
			if (kittens > 35){
				newKarmaKittens += (kittens - 35);
			}
			
			if (kittens > 60){
				newKarmaKittens += (kittens - 60) * 3;
			}
			
			if (kittens > 100){
				newKarmaKittens += (kittens - 100) * 4;
			}
			
			if (kittens > 150){
				newKarmaKittens += (kittens - 150) * 5;
			}
			
			if (kittens > 300){
				newKarmaKittens += (kittens - 300) * 10;
			}
			
		return newKarmaKittens

	},

	// add time until resources available to religion upgrades
	betterFaithPrices: function(){ com.nuclearunicorn.game.ui.ReligionBtn.prototype.simplePrices = false; },

	hideWorthless: function(){

		// toggle hidden status
		this.game.workshop.hideWorthless = true; 

		// modify this.game's button function to hide certain upgrades
		var bt = com.nuclearunicorn.game.ui.UpgradeButton.prototype;
		
		bt.updateVisible = (function(){
			var orig_fn = bt.updateVisible;
			
			return function(){
				console.log(this.getUpgrade());
				
				// orginal updateVisible function
				orig_fn.apply(this, arguments);
				
				// added worthless toggle to hide some buttons
				var worthless = upgrade.worthless || false; 			
				if (worthless && this.game.workshop.hideWorthless){ 
					this.setVisible(false);
				}
			}
		});
		
		com.nuclearunicorn.game.ui.UpgradeButton.prototype.updateVisible = function(){
			var upgrade = this.getUpgrade();
			
			var worthless = upgrade.worthless || false; // added
			
			if (!upgrade.unlocked){
				this.setVisible(false);
			}else{
				this.setVisible(true);
			}

			//noinspection JSPotentiallyInvalidUsageOfThis
            if (upgrade.researched && this.game.workshop.hideResearched){
				this.setVisible(false);
			}
			
			//noinspection JSPotentiallyInvalidUsageOfThis
            if (worthless && this.game.workshop.hideWorthless){ // addded
				this.setVisible(false);
			}
		};




		for(var i = 0; i < this.worthlessUpgrades.length; i++ ){
			this.game.workshop.get(this.worthlessUpgrades[i]).worthless = true;
		}
	},



	/*
	// fancy method, may not work
	var hideWorthless2 = function(){

		// toggle hidden status
		this.game.workshop.hideWorthless = true; 

		// modify this.game's button function to hide certain upgrades
		var bt = com.nuclearunicorn.game.ui.UpgradeButton.prototype;
		
		bt.updateVisible = (function(){
			var orig_fn = bt.updateVisible;
			
			return function(){
				console.log(this.getUpgrade());
				
				// orginal updateVisible function
				orig_fn.apply(this, arguments);
				
				// added worthless toggle to hide some buttons
				var worthless = upgrade.worthless || false; 			
				if (worthless && this.game.workshop.hideWorthless){ 
					this.setVisible(false);
				}
			}
		}() );

		// mark upgrades as worthless if they only benefit non-script users	
		var worthlessUpgrades = ['factoryAutomation', 'advancedAutomation', 'pneumaticPress', 'steelPlants'];

		for(var i = 0; i < worthlessUpgrades.length; i++ ){
			this.game.workshop.get(worthlessUpgrades[i]).worthless = true;
		}
	};
	*/


	/********************************************************************************/
	// wood vs catnip refining calculator

	woodCalc: function(){

		// base production per kitten
		var woodPerTickBase = this.game.village.getJob('woodcutter').modifiers.wood;
		var catnipPerTickBase = this.game.village.getJob('farmer').modifiers.catnip;

		var resPairs = [['wood', woodPerTickBase], ['catnip', catnipPerTickBase]];

		var upgradeBonus = 0;
		var buildingsBonus = 0;
		var resPerTick = 0;
		//console.log(resPairs);

		for(var i = 0; i < resPairs.length; i++){
			//console.log('i ' + i);
			
			var resPair = resPairs[i];
			//console.log(resPair);
			upgradeBonus = this.game.workshop.getEffect(resPair[0]+'Ratio');
			//console.log('ub '+upgradeBonus);
			buildingsBonus = this.game.getEffect(resPair[0]+'Ratio');
			//console.log('bb ' + buildingsBonus);
			
			resPerTick = resPair[1]*(1+upgradeBonus)*(1+buildingsBonus);
			//console.log(resPerTick);
			
			// calc catnip refining costs
			if(resPair[0] == 'catnip'){
				var refineCost = this.game.workshop.getCraft('wood').prices[0].val;
				//console.log('refineCost '+ refineCost);
				var refineRatio = this.game.bld.getEffect('refineRatio');
				//console.log('refineRatio '+ refineRatio);
				
				resPerTick *= (1+ refineRatio)/refineCost;
				console.log('c: ' + resPerTick);
			} else {
				console.log('w: ' + resPerTick);
			}
			
			resPair[1] = resPerTick;
			
		}
		
		return resPairs;
	},

	/////////////////////////////////////////////////
	/* wood production comparison */
	// this.game.bld.get('field').effects.catnipPerTickBase = 0;
	// this.game.village.catnipPerKitten = 0;
	// var startCatnip = new Date(); 
	// this.game.resPool.get('wood').value = 0;
	// var endCatnip;
	// var counter = setInterval(function(){
			// var woodValue = this.game.resPool.get('wood').value;
			// if(woodValue > 1000){
				// endCatnip = new Date();
				// clearInterval(counter);
			// }
		// },
		// 10
	// );


	/* starchart (from observing celestial events) per tick estimator */
	starchartEstimator: function(){

		var chance = 25; // base chance is 25 out of 10000
			
		chance += this.game.bld.getEffect('starEventChance');
		
		if(this.game.prestige.getPerk('chronomancy').researched){
			chance *= 1.1;
		}

		var dayPerTick = 0.1; // one chance per day to observe stars

		var avgChartsPerTick = chance/10000*dayPerTick;

		return avgChartsPerTick;
	},

    steelCalc: function(){

      return  'it works';
    },

};


// run some functions
ks.hideWorthless();
ks.betterFaithPrices();
