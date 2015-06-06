
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