

function domReady () {
  document.body.className += " javascript";
  getSiteName();
}

function updateSiteName(name, element){
	name.map(spannedLetter =>
		setTimeout((element.innerHTML+= spannedLetter), 500);
	);
}

function getSiteName() {
	const siteName = document.querySelector('h2.name');
	const siteNameArray = Array.from(siteName.innerText);
  	//console.log(siteNameArray);

  	const spannedSiteNameArray = siteNameArray.map(letter => 
  		`<span class="drumRoll">${letter}</span>`
  	);
	//console.log(spannedSiteName);
	return updateSiteName(spannedSiteName, siteName);

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