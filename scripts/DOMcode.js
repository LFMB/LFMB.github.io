
function domReady () {
  document.body.className += " javascript";
  setTimeout(getPageTaglines, 4000);
  spanSiteName();
  drumRoll();
}


function spanSiteName() {
	const siteName = document.querySelector('h2.name');
	const siteNameArray = Array.from(siteName.innerText);

  	const spannedSiteNameArray = siteNameArray.map(letter => 
  		`<span>${letter}</span>`
  	);

	siteName.innerHTML = "";

	spannedSiteNameArray.map(spanLetter => 
		siteName.innerHTML += spanLetter
	);

}

function showSiteTagLines(tagLines){
	var tagLinesQueue = tagLines.length,
		tagLineClasses = '';

		for(var a = 0; a < tagLinesQueue; a++){
			tagLineClasses = tagLines[a].classList;
	    	console.log(a);
	    	tagLineClasses.remove('hidden');
	    	tagLineClasses.add('animated');
	   	}
	};



function getPageTaglines(){
	var hiddenTagLines = [],
		heroTagLines = [];

	hiddenTagLines = document.getElementsByClassName('hidden');

	heroTagLines = document.getElementsByClassName('hero-tagline');
	
	showSiteTagLines(heroTagLines);
};






/* TODO: fix up animation of "downeast markets" homepage */

// iterate over array with a pause and toggle the class drum-roll 
function drumRoll(){
	const drumRollNodes = Array.from(document.querySelectorAll('.name span'));

	const drumRollList = drumRollNodes.filter((node) => node.innerText !== " ");

	// might have to use a Promise
	drumRollList.map( drumRollNode =>
		setInterval(() => {
		//	console.log(drumRollNode)
		}, 1000)
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



