
var autoclicker = setInterval(function(){
	if(Molpy.oldBeachClass == 'beachsafe' || Molpy.oldBeachClass == 'beachstreakextend'){
		Molpy.ClickBeach();
	}
	},
	100
);

// some macro
javascript:( function() { var js = document.createElement('script'); js.setAttribute('type', 'text/javascript'); js.setAttribute('src', 'http://xenko.github.io/BeachBall/BeachBall.js?'); document.head.appendChild(js); }() );