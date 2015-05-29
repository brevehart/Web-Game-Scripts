
(function(){
	var mult = 100;
	setInterval(function(){	
		moneyButtonClick(mult*player.clickPower); 
		player.totalManualClicks += mult*player.clickPower;
		}, 
		10*mult
	);
})();
	

var buyTier = function(tier){
	var order = [3, 4, 1, 2, 0];
	var types = 5;
	//console.log('buying tier: ' + tier);
	
	for(var i = 0; i < order.length; i++){
		var index = order[i] + tier*types;
		buyBuilding(index);
	}
	
};

var autoUpgrade = function(){
	buyUpgrade(1);
	
	for(var i = player.tierUpgrades.length; i > 0; i-- ){
		buyTierUpgrade(i - 1);
	}
	
}

setInterval(autoUpgrade, 60*1000);

var makeTierBuyer = function(theTier){
	var tier = theTier;
	//console.log(tier);
	return function(){
		buyTier(tier);
	}
};


(function(){
	var numTiers = 7;
	var baseBuyingTime = 120*1000;
	for(var i = 0; i < numTiers; i++){
		setInterval(makeTierBuyer(numTiers - i - 1), baseBuyingTime*(i + 1));
	}
})();

