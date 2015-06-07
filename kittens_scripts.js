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
    /*
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
     */

    // fancy method, may not work
    hideWorthless: function () {

        // toggle hidden status
        this.game.workshop.hideWorthless = true;

        // add worthless property to corresponding upgrades
        for (var i = 0; i < this.worthlessUpgrades.length; i++) {
            this.game.workshop.get(this.worthlessUpgrades[i]).worthless = true;
        }

        // modify game's button function to hide certain upgrades
        var bt = com.nuclearunicorn.game.ui.UpgradeButton.prototype;

        bt.updateVisible = (function () {
            var orig_fn = bt.updateVisible;

            return function () {
                // call original updateVisible function
                orig_fn.apply(this, arguments);

                // add worthless toggle to hide some upgrade buttons
                var worthless = this.getUpgrade().worthless || false;
                if (worthless && this.game.workshop.hideWorthless) {
                    this.setVisible(false);
                }
            }
        })();
    },

    highlightBest: function () {
        var isBest = (this.getName().includes(ks.bestValue));
        var isSecondBest = (this.getName().includes(ks.secondBestValue));

        if(!this.buttonTitle){
            return;
        }

        if (isBest) {
            if (!this.buttonTitle.classList.contains('bestValue')) {
                this.buttonTitle.classList.add('bestValue');
            }
        } else if(isSecondBest){
            if (!this.buttonTitle.classList.contains('secondBestValue')) {
                this.buttonTitle.classList.add('secondBestValue');
            }
        } else    if (this.buttonTitle.classList.contains('bestValue')) {
            // code here never executes
            this.buttonTitle.classList.remove('bestValue');

        }

        //$('.bestValue').css('background-color', 'lightBlue');

    },

    showBestValue: function(){
      var bt = com.nuclearunicorn.game.ui.BuildingBtn.prototype;



        bt.update = (function(){
            var origUpdate = bt.update;

            return function(){
                origUpdate.apply(this, arguments);
                ks.calcs.calculateUnicornBuild();
                ks.highlightBest.apply(this, arguments);
            }
        })();

        // add css rule for new class
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".bestValue { color: lightGreen }\n.secondBestValue { color: green }";
        document.getElementsByTagName("head")[0].appendChild(css);

    },

    bestValue: null,
    secondBestValue: null,

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


    woodCalcFormatted: function () {

        var woodCalc = ks.woodCalc();
        var woodPerWC = woodCalc[0][1];
        var woodPerFarmer = woodCalc[1][1];

        var bestJob = woodPerWC > woodPerFarmer ? 'woodcutter' : 'farmer';
        var factor = woodPerWC > woodPerFarmer ? woodPerWC / woodPerFarmer : woodPerFarmer / woodPerWC;


        var result = 'Normalized wood per woodcutter: ' + gamePage.getDisplayValue(woodPerWC);
        result += '<br>Normalized wood per farmer (via refinement): ' + gamePage.getDisplayValue(woodPerFarmer);
        result += '<br><br>Best profession is <em>' + bestJob + '</em> by a factor of ' + gamePage.getDisplayValue(factor) + '.';
        result += '<br><br> Note: values are normalized for shared boosts (paragon, happiness, magnetos, etc.).';

        return result;

    },

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

        if (!buildingNames) {
            console.log('Resource type "' + res + '" is not supported.');
            return '';
        }

        var swBoost = this.game.bld.get('steamworks').effects['magnetoBoostRatio'];
        var magnetoEffect = this.game.bld.get('magneto').effects['magnetoRatio'];


        var unlockedBuildings = [];

        // select only buildings for which we currently have the technology
        for (var i = 0; i < buildingNames.length; i++) {
            var bn = buildingNames[i];
            var building = (bn == 'spaceStation') ? this.game.space.getProgram(bn) : this.game.bld.get(bn);
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
            if (building.name == 'spaceStation') {
                // ugly hack to get price of next space station
                var hackPrices = function () {
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

                if (price.name == 'blueprint') {
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
            building.efficiency.steel = building.bonus / building.cost.steel;
            console.log('steel efficiency: ' + building.efficiency.steel);

            if (building.cost.blueprint) {
                building.efficiency.blueprint = building.bonus / building.cost.blueprint;
                console.log('blueprint efficiency: ' + building.efficiency.blueprint);
            }
        }


        var mostEfficientBuilding = {};
        var highestEfficiency = {steel: -Infinity, blueprint: -Infinity};

        for (var k = 0; k < unlockedBuildings.length; k++) {
            building = unlockedBuildings[k];

            for (var res in highestEfficiency) {

                if (building.efficiency[res] > highestEfficiency[res] && highestEfficiency.hasOwnProperty(res)) {
                    highestEfficiency[res] = building.efficiency[res];
                    mostEfficientBuilding[res] = building;
                }
            }
        }

        console.log('best steel: ' + mostEfficientBuilding.steel.name);

        if (building.cost.blueprint) {
            console.log('best blueprint: ' + mostEfficientBuilding.blueprint.name);
        }

        return {buildings: unlockedBuildings, best: mostEfficientBuilding};
    },

    steelCalcFormatted: function () {

        var productionResult;
        var housingResult;
        var oilResult;


        // check for housing
        if (gamePage.bld.get('mansion').val < 1 && gamePage.space.getProgram('spaceStation').val < 1) {
            housingResult = 'Unlock mansions to use housing calculator.';
        }

        //check for oil
        if (gamePage.bld.get('oilWell').val < 1 && (gamePage.bld.get('biolab').val < 1 || !gamePage.bld.get('biolab').effects.oilPerTick)) {
            oilResult = 'Unlock oil wells to use oil calculator.';
        }


        var result = ks.steelCalcFormattedProduction();

        return result;

    },

    steelCalcFormattedProduction: function () {

        // check for production buildings
        if (!gamePage.bld.get('magneto').unlocked) {
            return 'Unlock magnetos to use production calculator.';
        }

        var productionCalc = ks.steelCalc('production');

        var result = 'Best production building by steel cost: ' + productionCalc.best.steel.name;
        result += '<br>Best production building by blueprint cost: ' + productionCalc.best.blueprint.name;
        result += '<br><br>Efficiency by steel:';

        // sort buildings by efficiency
        var steelSorted = productionCalc.buildings.slice();
        steelSorted.sort(ks.sortBy('efficiency.steel'));

        for (var i = 0; i < steelSorted.length; i++) {
            result += '<br>' + steelSorted[i].name + ': ' + gamePage.getDisplayValue(steelSorted[i].efficiency.steel);
        }

        result += '<br><br>Efficiency by blueprints:';
        var bpSorted = productionCalc.buildings.slice();
        bpSorted.sort(ks.sortBy('efficiency.blueprint'));

        for (var i = 0; i < steelSorted.length; i++) {
            result += '<br>' + bpSorted[i].name + ': ' + gamePage.getDisplayValue(bpSorted[i].efficiency.steel);
        }

        return result;

    },

    // sort (in ascending order) an array of objects by specified property
    sortBy: function (prop) {
        return function (a, b) {
            return ks.deep_value(a, prop) - ks.deep_value(b, prop);
        };
    },

    // get nested value from path (e.g., 'prop1.prop2') from http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
    deep_value: function (obj, path) {
        for (var i = 0, path = path.split('.'); i < path.length; i++) {
            if (obj[path[i]] == undefined) {
                return undefined;
            } else {
                obj = obj[path[i]];
            }
        }
        return obj;
    },

    // my preferences for Kittens Scientists script
    updateKittenScientistsOptions: function () {

        // exit if Kitten Scientists is not loaded
        if (!(typeof version == 'string' ) || !version.includes('Kitten Scientists')) {
            console.log('Kitten Scientists is not loaded. Aborting...');
            return;
        }

        var myOpts = {
            showActivity: false,
            consume: 0.4,
            auto: {
                build: {
                    items: {
                        oilWell: {enabled: false},
                        aqueduct: {enabled: false},

                    },
                },

                resources: {
                    catnip: {consume: .1},
                    wood: {consume: .1},
                    minerals: {consume: .1},
                    parchment: {stock: 2500},
                }
            }
        };

        var scientistOpts = options;
        //console.log(options);

        // merge myOpts into Kitten Scientists options recursively
        $.extend(true, scientistOpts, myOpts);

        // known issues: doesn't update right panel display
    },


    // adapted from Auto Kittens http://birdiesoft.dk/autokittens.php
    calcs: {
        game: gamePage,

        buildUI: function () {
            $('#headerLinks').append(' | <a onclick="ks.calcs.rebuildCalculatorUI();$(\'#kittenCalcs\').toggle();" href="#">Calculators</a>');


            var calcContainer = document.createElement('div');
            calcContainer.className = 'help';
            calcContainer.id = 'kittenCalcs';
            calcContainer.style.display = 'none';
            calcContainer.style.overflowY = 'scroll';
            $('#gamePageContainer').append(calcContainer);
        },


        prepareContainer: function (id) {
            var result = $('#' + id);
            result.html('<a style="top: 10px; right: 45px; position: absolute;" onclick="$(\'#' + id + '\').hide();" href="#"><div style="position: fixed;">close</div></a>');
            return result
        },


        calculators: [],

        // Calculator UI
        //
        addCalculator: function (container, id, title, contents, calc_func, sub_id, sub_title) {
            if (sub_id) {
                container.append('<h3 onclick="$(\'#' + id + '_container\').toggle();">' + title + ' (click to show/hide)</h3>');
                if (calc_func) {
                    ks.calcs.calculators.push([[id, sub_id], calc_func]);
                }
                container.append('<div id="' + id + '_container" style="display:none">' + contents + '<div id="' + id + '"></div><h4 onclick="$(\'#' + sub_id + '\').toggle();">' + sub_title + ' (click to show/hide)</h4><div id="' + sub_id + '" style="display:none"></div></div>');
            } else {
                container.append('<h3 onclick="$(\'#' + id + '\').toggle();">' + title + ' (click to show/hide)</h3>');
                if (calc_func) {
                    ks.calcs.calculators.push([[id], calc_func]);
                }
                container.append('<div id="' + id + '" style="display:none">' + contents + '</div>');
            }
        },

        updateCalculators: function () {
            for (var i in ks.calcs.calculators) {
                var c = ks.calcs.calculators[i];
                var contents = [].concat(c[1]());
                for (var j in c[0]) {
                    $('#' + c[0][j]).html(contents[j])
                }
            }
        },

        rebuildCalculatorUI: function () {
            var calcContainer = ks.calcs.prepareContainer('kittenCalcs');
            ks.calcs.calculators = [];
            ks.calcs.addCalculator(calcContainer, 'unicornCalc', 'Unicorn structures', '<h5>(<a href="https://www.reddit.com/r/kittensgame/comments/2iungv/turning_the_sacrificing_of_unicorns_into_an_exact/" target="_blank">Based on spreadsheet by /u/yatima2975</a>)</h5>', ks.calcs.calculateUnicornBuild, 'unicornDetails', 'Calculation details');
            ks.calcs.addCalculator(calcContainer, 'buildingCalc', 'Building price calculator', ks.calcs.buildingCalculator());
            ks.calcs.addCalculator(calcContainer, 'mintCalc', 'Mint efficiency calculator', '', ks.calcs.mintCalculator);

            // added calculators: steel/blueprints, woodcutters/farmers
            ks.calcs.addCalculator(calcContainer, 'steelCalc', 'Steel/Blueprint efficiency calculator', '', ks.steelCalcFormatted);
            ks.calcs.addCalculator(calcContainer, 'woodCalc', 'Woodcutters vs farmers efficiency calculator', '', ks.woodCalcFormatted);
            // end added calcs

            ks.calcs.calculateBuildingPrice();
            ks.calcs.updateCalculators();
        },

        // Unicorn calculator

        getZiggurats: function () {
            return gamePage.bld.get('ziggurat').val;
        },

        calculateUnicornBuild: function () {
            if (gamePage.bld.get('unicornPasture').val == 0)
                return 'You need at least one Unicorn Pasture to use this. Send off some hunters!';
            var ziggurats = ks.calcs.getZiggurats();
            if (ziggurats == 0)
                return 'You need at least one Ziggurat to use this.';

            var startUps = ks.calcs.calculateEffectiveUps();

            var details = '';

            var result = 'Base unicorn production per second: ' + gamePage.getDisplayValue(ks.calcs.calculateBaseUps());
            result += '<br>Rift production per second (amortized): ' + gamePage.getDisplayValue(ks.calcs.calculateRiftUps());
            result += '<br>Current effective unicorn production per second: ' + gamePage.getDisplayValue(startUps);

            var buildings = ['Unicorn Pasture', 'Unicorn Tomb', 'Ivory Tower', 'Ivory Citadel', 'Sky Palace'];
            var tears = ks.calcs.getTearPrices();
            var ivory = ks.calcs.getIvoryPrices();
            var increases = [0, 0, 0, 0, 0];
            var best = 0, secondBest = 0;
            for (var i = 0; i < 5; i++) {
                extras = [0, 0, 0, 0, 0];
                extras[i] = 1;
                increases[i] = ks.calcs.calculateEffectiveUps(extras) - startUps;
                if (tears[best] / increases[best] > tears[i] / increases[i]) {
                    secondBest = best;
                    best = i;
                }
                if (tears[secondBest] / increases[secondBest] > tears[i] / increases[i] && i != best || secondBest == best) {
                    secondBest = i;
                }
                details += 'Unicorn/s increase with 1 more ' + buildings[i] + ': ' + gamePage.getDisplayValue(increases[i]);
                if (i != 0) {
                    details += '<br>Total unicorns needed: ' + gamePage.getDisplayValueExt(Math.ceil(tears[i] / ziggurats) * 2500);
                    details += ' (' + gamePage.getDisplayValueExt(tears[i]) + ' tears, ' + Math.ceil(tears[i] / ziggurats) + ' sacrifice(s))';
                    details += '<br>' + ks.calcs.checkUnicornReserves(tears[i], false, startUps, ivory[i])
                } else {
                    details += '<br>Total unicorns needed: ' + gamePage.getDisplayValueExt(tears[i] / ziggurats * 2500);
                    details += '<br>' + ks.calcs.checkUnicornReserves(tears[i] / ziggurats * 2500, true, startUps, ivory[i])
                }
                details += '<br>Tears for 1 extra unicorn/s: ' + gamePage.getDisplayValueExt(tears[i] / increases[i]) + '<br><br>';
            }

            result += '<br><br>Best purchase is ' + buildings[best] + ', by a factor of ' + gamePage.getDisplayValue((tears[secondBest] / increases[secondBest]) / (tears[best] / increases[best]));
            if (best != 0) {
                result += '<br>' + ks.calcs.checkUnicornReserves(tears[best], false, startUps, ivory[best])
            } else {
                result += '<br>' + ks.calcs.checkUnicornReserves(tears[best] / ziggurats * 2500, true, startUps, ivory[best])
            }

            ks.bestValue = (buildings[best] == 'Unicorn Pasture')? 'Unic. Pasture': buildings[best];
            ks.secondBestValue = (buildings[secondBest] == 'Unicorn Pasture')? 'Unic. Pasture': buildings[secondBest];

            return [result, details];
        },

        checkUnicornReserves: function (resNumber, isPasture, currUps, ivoryNeeded) {
            var unicornsLeft = 0;
            if (!isPasture) {
                var tearsLeft = resNumber - gamePage.resPool.get('tears').value;
                unicornsLeft = 2500 * Math.ceil(tearsLeft / ks.calcs.getZiggurats());
            } else {
                unicornsLeft = resNumber;
            }
            unicornsLeft = unicornsLeft - gamePage.resPool.get('unicorns').value;
            var ivoryLeft = ivoryNeeded - gamePage.resPool.get('ivory').value;
            if (unicornsLeft > 0) {
                return "You need " + gamePage.getDisplayValueExt(unicornsLeft) + " more unicorns to build this (approximately " + gamePage.toDisplaySeconds(unicornsLeft / currUps) + ").";
            }
            if (ivoryLeft > 0) {
                return "You have enough unicorns, but need more ivory to build this.";
            } else {
                return "You have enough resources to build this now.";
            }
        },

        getTearPrices: function () {
            var result = [0, 0, 0, 0, 0];
            var buildings = [gamePage.bld.get('unicornPasture'), gamePage.religion.getZU('unicornTomb'), gamePage.religion.getZU('ivoryTower'), gamePage.religion.getZU('ivoryCitadel'), gamePage.religion.getZU('skyPalace')];
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < buildings[i].prices.length; j++) {
                    if (buildings[i].prices[j].name == 'unicorns') {
                        result[i] = ks.calcs.calcPrice(buildings[i].prices[j].val, gamePage.bld.getPriceRatio(buildings[i].name), buildings[i].val) / 2500 * ks.calcs.getZiggurats();
                    } else if (buildings[i].prices[j].name == 'tears') {
                        result[i] = ks.calcs.calcPrice(buildings[i].prices[j].val, buildings[i].priceRatio, buildings[i].val);
                    }
                }
            }
            return result;
        },

        getIvoryPrices: function () {
            var result = [0, 0, 0, 0, 0];
            var buildings = [gamePage.bld.get('unicornPasture'), gamePage.religion.getZU('unicornTomb'), gamePage.religion.getZU('ivoryTower'), gamePage.religion.getZU('ivoryCitadel'), gamePage.religion.getZU('skyPalace')];
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < buildings[i].prices.length; j++) {
                    if (buildings[i].prices[j].name == 'ivory') {
                        result[i] = ks.calcs.calcPrice(buildings[i].prices[j].val, buildings[i].priceRatio, buildings[i].val);
                    }
                }
            }
            return result;
        },

        calcPrice: function (base, ratio, num) {
            for (i = 0; i < num; i++) {
                base *= ratio;
            }
            return base;
        },

        calculateBaseUps: function (extras) {
            extras = extras || [];

            var pastures = gamePage.bld.get('unicornPasture').val + (extras[0] || 0);
            var baseUps = pastures * gamePage.bld.get('unicornPasture').effects['unicornsPerTickBase'] * gamePage.rate;

            var tombs = gamePage.religion.getZU('unicornTomb').val + (extras[1] || 0);
            var towers = gamePage.religion.getZU('ivoryTower').val + (extras[2] || 0);
            var citadels = gamePage.religion.getZU('ivoryCitadel').val + (extras[3] || 0);
            var palaces = gamePage.religion.getZU('skyPalace').val + (extras[4] || 0);
            var tombEffect = gamePage.religion.getZU('unicornTomb').effects['unicornsRatio'];
            var towerEffect = gamePage.religion.getZU('ivoryTower').effects['unicornsRatio'];
            var citadelEffect = gamePage.religion.getZU('ivoryCitadel').effects['unicornsRatio'];
            var palaceEffect = gamePage.religion.getZU('skyPalace').effects['unicornsRatio'];
            var bldEffect = 1 + tombEffect * tombs + towerEffect * towers + citadelEffect * citadels + palaceEffect * palaces;

            var faithEffect = 1;
            if (gamePage.religion.getRU("solarRevolution").researched) {
                faithEffect += gamePage.religion.getProductionBonus() / 100;
            }

            var paragonRatio = gamePage.resPool.get("paragon").value * 0.01;
            paragonRatio = 1 + gamePage.bld.getHyperbolicEffect(paragonRatio, 2);

            return baseUps * bldEffect * faithEffect * paragonRatio;
        },

        calculateRiftUps: function (extras) {
            extras = extras || [];
            var unicornChanceRatio = 1;
            if (gamePage.prestige.getPerk("unicornmancy").researched) {
                unicornChanceRatio = 1.1;
            }
            return Math.min(500, 0.25 * unicornChanceRatio * (gamePage.religion.getZU('ivoryTower').val + (extras[2] || 0))) * gamePage.calendar.dayPerTick * gamePage.rate;
        },

        calculateEffectiveUps: function (extras) {
            return ks.calcs.calculateBaseUps(extras) + ks.calcs.calculateRiftUps(extras);
        },

        // Building price calculator

        buildingCalculator: function () {
            var result = '';

            result += '<select id="buildingPriceSelector" onchange="ks.calcs.calculateBuildingPrice()">';
            result += '<optgroup label="Buildings">';
            var buildings = gamePage.bld.buildingsData.slice(0);
            buildings.sort(function (a, b) {
                return a.label.localeCompare(b.label)
            });
            for (var i = 0; i < buildings.length; i++) {
                if (buildings[i].unlocked) {
                    result += '<option value="bld_' + buildings[i].name + '">' + buildings[i].label + '</option>';
                }
            }
            if (gamePage.religionTab.visible) {
                result += '</optgroup><optgroup label="Religion">';
                var religion = gamePage.religion.religionUpgrades.slice(0);
                religion.sort(function (a, b) {
                    return a.label.localeCompare(b.label)
                });
                for (var i = 0; i < religion.length; i++) {
                    if (gamePage.religion.faith >= religion[i].faith && religion[i].upgradable) {
                        result += '<option value="RU_' + religion[i].name + '">' + religion[i].label + '</option>';
                    }
                }
            }
            if (gamePage.bld.get('ziggurat').val > 0) {
                result += '</optgroup><optgroup label="Ziggurats">';
                var religion = gamePage.religion.zigguratUpgrades.slice(0);
                religion.sort(function (a, b) {
                    return a.label.localeCompare(b.label)
                });
                for (var i = 0; i < religion.length; i++) {
                    result += '<option value="ZU_' + religion[i].name + '">' + religion[i].label + '</option>';
                }
            }
            if (gamePage.spaceTab.visible) {
                result += '</optgroup><optgroup label="Space">';
                var space = gamePage.space.programs.slice(0);
                space.sort(function (a, b) {
                    return a.title.localeCompare(b.title)
                });
                for (var i = 0; i < space.length; i++) {
                    if (space[i].unlocked && space[i].upgradable) {
                        result += '<option value="space_' + space[i].name + '">' + space[i].title + '</option>';
                    }
                }
            }
            result += '</optgroup></select><br><label>Target number of buildings: <input id="buildingPriceNumber" oninput="ks.calcs.calculateBuildingPrice();"></label>';

            result += '<div id="buildingPriceHolder"></div>';
            return result;
        },

        calculateBuildingPrice: function () {
            var priceContainer = document.getElementById('buildingPriceHolder');
            var bldName = $('#buildingPriceSelector')[0].value.split('_');
            var bld;
            var priceRatio = 1;
            switch (bldName[0]) {
                case 'bld':
                    bld = gamePage.bld.get(bldName[1]);
                    priceRatio = gamePage.bld.getPriceRatio(bldName[1]);
                    break;
                case 'RU':
                    bld = gamePage.religion.getRU(bldName[1]);
                    priceRatio = bld.priceRatio;
                    break;
                case 'ZU':
                    bld = gamePage.religion.getZU(bldName[1]);
                    priceRatio = bld.priceRatio;
                    break;
                case 'space':
                    bld = gamePage.space.getProgram(bldName[1]);
                    priceRatio = bld.priceRatio;
                    break;
            }
            var number = Math.floor(ks.calcs.tryNumericParse($('#buildingPriceNumber')[0].value));
            var maxNum = Infinity;
            for (var i = 0; i < bld.prices.length; i++) {
                var resLimit = bld.val;
                var res = gamePage.resPool.get(bld.prices[i].name);
                if ((res.maxValue || 0) == 0)
                    continue;
                if (bldName[0] == 'space' && (bld.prices[i].name == "oil" || bld.prices[i].name == "rocket")) {
                    var reductionRatio = 0;
                    if (bld.prices[i].name == "oil")
                        reductionRatio = gamePage.bld.getHyperbolicEffect(gamePage.space.getEffect("oilReductionRatio"), 0.75);
                    if (res.maxValue > bld.prices[i].val * (1 - reductionRatio))
                        resLimit = maxNum;
                    else
                        resLimit = 0;
                } else for (var j = bld.val; ; j++) {
                    if (ks.calcs.calcPrice(bld.prices[i].val, priceRatio, j) > res.maxValue) {
                        resLimit = j;
                        break;
                    }
                }
                if (resLimit < maxNum)
                    maxNum = resLimit;
            }

            var result = '';
            if (maxNum != Infinity)
                result += 'With your current resource caps, you can build up to ' + maxNum + ' of this building (' + (maxNum - bld.val) + ' more than you currently have).<br>';
            if (number > 0) {
                result += 'Price for ' + (bld.label || bld.title) + ' #' + number + ' will be:<br>';
                for (var i = 0; i < bld.prices.length; i++) {
                    var finalPrice;
                    if (bldName[0] == 'space' && (bld.prices[i].name == "oil" || bld.prices[i].name == "rocket")) {
                        var reductionRatio = 0;
                        if (bld.prices[i].name == "oil")
                            reductionRatio = gamePage.bld.getHyperbolicEffect(gamePage.space.getEffect("oilReductionRatio"), 0.75);
                        finalPrice = bld.prices[i].val * (1 - reductionRatio);
                    }
                    else
                        finalPrice = ks.calcs.calcPrice(bld.prices[i].val, priceRatio, number - 1);
                    var res = gamePage.resPool.get(bld.prices[i].name);
                    result += (res.title || res.name) + ': ' + gamePage.getDisplayValueExt(finalPrice) + '<br>';
                }

                if (bld.val < number) {
                    result += '<br>Cumulative resources required to reach this:<br>';
                    for (var i = 0; i < bld.prices.length; i++) {
                        var price = 0;
                        if (bldName[0] == 'space' && (bld.prices[i].name == "oil" || bld.prices[i].name == "rocket")) {
                            var reductionRatio = 0;
                            if (bld.prices[i].name == "oil")
                                reductionRatio = gamePage.bld.getHyperbolicEffect(gamePage.space.getEffect("oilReductionRatio"), 0.75);
                            price = bld.prices[i].val * (1 - reductionRatio) * (number - bld.val);
                        }
                        else for (var j = bld.val; j < number; j++) {
                            price += ks.calcs.calcPrice(bld.prices[i].val, priceRatio, j);
                        }
                        var res = gamePage.resPool.get(bld.prices[i].name);
                        result += (res.title || res.name) + ': ' + gamePage.getDisplayValueExt(price) + '<br>';
                    }
                }
            }

            priceContainer.innerHTML = result;
        },

        // Mint/hunter efficiency calculator

        mintCalculator: function () {
            var hunterRatio = gamePage.workshop.getEffect("hunterRatio");
            var expectedFurs = 32.5 * (hunterRatio + 1);
            var expectedIvory = 20 * (hunterRatio + 1);
            if (2 * hunterRatio < 55) {
                expectedIvory *= 1 - (55 - 2 * hunterRatio) / 100;
            }

            var catpower = gamePage.resPool.get("manpower");
            var catpowerRate = catpower.perTickUI * 5;
            var huntTime = 100 / catpowerRate;
            var huntTimeWithMint = 100 / (catpowerRate - 3.75);
            var fpsNormal = expectedFurs / huntTime;
            var ipsNormal = expectedIvory / huntTime;
            var fpsWithMint = expectedFurs / huntTimeWithMint;
            var ipsWithMint = expectedIvory / huntTimeWithMint;

            var cpratio = (catpower.maxValue * gamePage.bld.get("mint").effects["mintEffect"]) / 100;

            var fpsFromMint = cpratio * 1.25 * 5;
            var ipsFromMint = cpratio * 0.3 * 5;

            var mintsRunning = gamePage.bld.get('mint').on;
            fpsNormal += fpsFromMint * mintsRunning;
            ipsNormal += ipsFromMint * mintsRunning;
            fpsWithMint += fpsFromMint * mintsRunning;
            ipsWithMint += ipsFromMint * mintsRunning;

            var result = "";

            result += "Average furs per hunt: " + gamePage.getDisplayValue(expectedFurs);
            result += "<br>Average ivory per hunt: " + gamePage.getDisplayValue(expectedIvory);
            result += "<br>Average time between hunts: " + gamePage.getDisplayValue(huntTime);
            result += "<br>Approximate furs per second: " + gamePage.getDisplayValue(fpsNormal);
            result += "<br>Approximate ivory per second: " + gamePage.getDisplayValue(ipsNormal);
            result += "<br><br>With extra mint running:<br>Approximate furs per second: " + gamePage.getDisplayValue(fpsWithMint + fpsFromMint);
            result += "<br>Approximate ivory per second: " + gamePage.getDisplayValue(ipsWithMint + ipsFromMint);
            result += "<br><br>Profit from extra mint:<br>Furs per second: " + gamePage.getDisplayValue(fpsFromMint + fpsWithMint - fpsNormal);
            result += "<br>Ivory per second: " + gamePage.getDisplayValue(ipsFromMint + ipsWithMint - ipsNormal);
            return result;
        },

        tryNumericParse: function (value) {
            newVal = parseFloat(value);
            if (!isNaN(newVal) && isFinite(newVal) && newVal > 0)
                return newVal;
            return 0;
        },

    }

};


// run some functions
ks.hideWorthless();
ks.betterFaithPrices();
ks.calcs.buildUI();
ks.showBestValue();