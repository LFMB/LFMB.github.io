

function domReady () {
  document.body.className += " javascript";
  getSiteName();
}


function getSiteName() {
	const siteName = document.querySelector('h2.name');
	const siteNameArray = Array.from(siteName.innerText);

  	const spannedSiteNameArray = siteNameArray.map(letter => 
  		`<span class="drumRoll">${letter}</span>`
  	);

	const domTarget = siteName.innerHTML;

	document.querySelector('h2.name').removeChild(document.querySelector('h2.name').firstChild);

	return spannedSiteNameArray.map(spanLetter => 
		domTarget += spanLetter
	)

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