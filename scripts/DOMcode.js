

function domReady () {
  document.body.className += " javascript";
  getSiteName();
}



function getSiteName() {
	const siteName = document.querySelector('h2.name');
	const siteNameArray = Array.from(siteName.innerText);
  	//console.log(siteNameArray);

  	const spannedSiteName = siteNameArray.map(letter => 
  		setTimeout(siteName.innerHTML += (`<span class="drumRoll">${letter}</span>`), 500);
  	);
}

// Mozilla, Opera, Webkit 
if ( document.addEventListener ) {
  document.addEventListener( "DOMContentLoaded", function(){
    document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
    domReady();
  }, false );

// If IE event model is used
} else if ( document.attachEvent ) {
  // ensure firing before onload
  document.attachEvent("onreadystatechange", function(){
    if ( document.readyState === "complete" ) {
      document.detachEvent( "onreadystatechange", arguments.callee );
      domReady();
    }
  });
}