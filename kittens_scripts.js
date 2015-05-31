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


    calcKarma: function () {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        var kittens = this.game.resPool.get('kittens').value;
        var newKarmaKittens = 0;

        if (kittens > 35) {
            newKarmaKittens += (kittens - 35);
        }

        if (kittens > 60) {
            newKarmaKittens += (kittens - 60) * 3;
        }

        if (kittens > 100) {
            newKarmaKittens += (kittens - 100) * 4;
        }

        if (kittens > 150) {
            newKarmaKittens += (kittens - 150) * 5;
        }

        if (kittens > 300) {
            newKarmaKittens += (kittens - 300) * 10;
        }

        return newKarmaKittens

    },

    // add time until resources available to religion upgrades
    betterFaithPrices: function () {
        com.nuclearunicorn.game.ui.ReligionBtn.prototype.simplePrices = false;
    },

    hideWorthless: function () {

        // toggle hidden status
        this.game.workshop.hideWorthless = true;

        // modify this.game's button function to hide certain upgrades
        var bt = com.nuclearunicorn.game.ui.UpgradeButton.prototype;

        bt.updateVisible = (function () {
            var orig_fn = bt.updateVisible;

            return function () {
                console.log(this.getUpgrade());

                // orginal updateVisible function
                orig_fn.apply(this, arguments);

                // added worthless toggle to hide some buttons
                var worthless = upgrade.worthless || false;
                if (worthless && this.game.workshop.hideWorthless) {
                    this.setVisible(false);
                }
            }
        });

        com.nuclearunicorn.game.ui.UpgradeButton.prototype.updateVisible = function () {
            var upgrade = this.getUpgrade();

            var worthless = upgrade.worthless || false; // added

            if (!upgrade.unlocked) {
                this.setVisible(false);
            } else {
                this.setVisible(true);
            }

            //noinspection JSPotentiallyInvalidUsageOfThis
            if (upgrade.researched && this.game.workshop.hideResearched) {
                this.setVisible(false);
            }

            //noinspection JSPotentiallyInvalidUsageOfThis
            if (worthless && this.game.workshop.hideWorthless) { // addded
                this.setVisible(false);
            }
        };


        for (var i = 0; i < this.worthlessUpgrades.length; i++) {
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

    woodCalc: function () {

        // base production per kitten
        var woodPerTickBase = this.game.village.getJob('woodcutter').modifiers.wood;
        var catnipPerTickBase = this.game.village.getJob('farmer').modifiers.catnip;

        var resPairs = [['wood', woodPerTickBase], ['catnip', catnipPerTickBase]];

        var upgradeBonus = 0;
        var buildingsBonus = 0;
        var resPerTick = 0;
        //console.log(resPairs);

        for (var i = 0; i < resPairs.length; i++) {
            //console.log('i ' + i);

            var resPair = resPairs[i];
            //console.log(resPair);
            upgradeBonus = this.game.workshop.getEffect(resPair[0] + 'Ratio');
            //console.log('ub '+upgradeBonus);
            buildingsBonus = this.game.getEffect(resPair[0] + 'Ratio');
            //console.log('bb ' + buildingsBonus);

            resPerTick = resPair[1] * (1 + upgradeBonus) * (1 + buildingsBonus);
            //console.log(resPerTick);

            // calc catnip refining costs
            if (resPair[0] == 'catnip') {
                var refineCost = this.game.workshop.getCraft('wood').prices[0].val;
                //console.log('refineCost '+ refineCost);
                var refineRatio = this.game.bld.getEffect('refineRatio');
                //console.log('refineRatio '+ refineRatio);

                resPerTick *= (1 + refineRatio) / refineCost;
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
    starchartEstimator: function () {

        var chance = 25; // base chance is 25 out of 10000

        chance += this.game.bld.getEffect('starEventChance');

        if (this.game.prestige.getPerk('chronomancy').researched) {
            chance *= 1.1;
        }

        var dayPerTick = 0.1; // one chance per day to observe stars

        var avgChartsPerTick = chance / 10000 * dayPerTick;

        return avgChartsPerTick;
    },

    steelCalc: function (res) {

        var allBuildingNames = {
            production: ['steamworks', 'magneto', 'reactor'],
            oil: ['oilWell', 'biolab'],
            kittens: ['mansion', 'spaceStation']
        };

        //
        var buildingNames = allBuildingNames[res];

        if(!buildingNames){
            console.log('Resource type "' + res + '" is not supported.');
            return '';
        }

        var swBoost = this.game.bld.get('steamworks').effects['magnetoBoostRatio'];
        var magnetoEffect = this.game.bld.get('magneto').effects['magnetoRatio'];


        var unlockedBuildings = [];

        // select only buildings for which we currently have the technology
        for(var i = 0; i < buildingNames.length; i++) {
            var bn = buildingNames[i];
            var building = (bn == 'spaceStation')? this.game.space.getProgram(bn): this.game.bld.get(bn);
            if (building.unlocked) {
                unlockedBuildings.push({name: bn});
            }
        }

        var steelProducts = {
            steel: 1,
            gear: 15,
            concrate: 25, // sic
            alloy: 75
        };

        var craftRatio = 1 + this.game.bld.getEffect('craftRatio');
        //console.log('craftRatio: ' + craftRatio);



        for (var i = 0; i < unlockedBuildings.length; i++) {
            var building = unlockedBuildings[i];
            var prices;
            var totalSteelCost;

            building.cost = {};
            building.efficiency = {};

            // calculate total steel cost for next building
            if(building.name == 'spaceStation'){
                // ugly hack to get price of next space station
                var hackPrices = function(){
                    var tmp = com.nuclearunicorn.game.ui.SpaceProgramBtn.prototype;
                    tmp.id = 'spaceStation';
                    tmp.game = ks.game;

                    var prices = tmp.getPrices();

                    delete tmp.game;
                    delete tmp.id;

                    return prices;
                };

                prices = hackPrices();
            } else {
                prices = this.game.bld.getPrices(building.name);
            }
            console.log('prices for ' + building.name + ': ');
            //console.log(prices);

            totalSteelCost = 0;
            for (var p = 0; p < prices.length; p++) {
                var price = prices[p];
                console.log('price: ' + price.val + ' ' + price.name);
                //console.log(steelProducts[price.name]);
                if (steelProducts[price.name]) {
                    //console.log(price.name);
                    var ratio = price.name == 'steel' ? 1 : craftRatio;
                    //console.log(ratio);
                    totalSteelCost += price.val * steelProducts[price.name] / ratio;
                }

                if (price.name == 'blueprint'){
                    building.cost.blueprint = price.val;
                }
            }

            building.cost.steel = totalSteelCost;
            console.log('total steel: ' + totalSteelCost);


            // calculate production bonus for next building
            switch (building.name) {
                case 'reactor':
                    building.bonus = this.game.bld.get('reactor').effects['productionRatio'];
                    break;
                case 'magneto':
                    building.bonus = magnetoEffect * (1 + this.game.bld.get('steamworks').val * swBoost );
                    break;
                case 'steamworks':
                    building.bonus = swBoost * this.game.bld.get('magneto').val * magnetoEffect;
                    break;
                case 'oilWell':
                    building.bonus = this.game.bld.get('oilWell').effects.oilPerTickBase;
                    break;
                case 'biolab':
                    building.bonus = this.game.bld.get('biolab').effects.oilPerTick || 0; // zero if no oil production yet
                    break;
                case 'mansion':
                    building.bonus = this.game.bld.get('mansion').effects['maxKittens'];
                    break;
                case 'spaceStation':
                    building.bonus = this.game.space.getProgram('spaceStation').effects['maxKittens'];
                    break;
                default:
                    building.bonus = 0;
            }

            //convert building bonus to %
            building.bonus *= 100;

            console.log('bonus: ' + building.bonus + '%');

            // % increase in base production per steel
            building.efficiency.steel = building.bonus/building.cost.steel;
            console.log('steel efficiency: ' + building.efficiency.steel);

            if(building.cost.blueprint) {
                building.efficiency.blueprint = building.bonus / building.cost.blueprint;
                console.log('blueprint efficiency: ' + building.efficiency.blueprint);
            }
        }


        var mostEfficientBuilding = {};
        var highestEfficiency = {steel: -Infinity, blueprint: -Infinity};

        for( var k = 0; k < unlockedBuildings.length; k++){
            building = unlockedBuildings[k];

            for(var res in highestEfficiency) {

                if (building.efficiency[res] > highestEfficiency[res] && highestEfficiency.hasOwnProperty(res)) {
                    highestEfficiency[res] = building.efficiency[res];
                    mostEfficientBuilding[res] = building;
                }
            }
        }

        console.log('best steel: ' + mostEfficientBuilding.steel.name);

        if(building.cost.blueprint) {
            console.log('best blueprint: ' + mostEfficientBuilding.blueprint.name);
        }

        return mostEfficientBuilding;
    },

};


// run some functions
ks.hideWorthless();
ks.betterFaithPrices();
