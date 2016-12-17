
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

function animateMoreContentArrow(){
	return document.getElementById('home-more-content').classList.add('animated-slow', 'infinite');
}

function showSiteTagLines(tagLines){
	var tagLinesQueue = tagLines.length,
		 tagLineClasses = '';

		for(var activeTagLineIndex = 0; activeTagLineIndex < tagLinesQueue; activeTagLineIndex++){
	   		setTimeout(function(selectedTagLineIndexNumber){
	   			var topPosition = (selectedTagLineIndexNumber * 24) + "px";
		   			tagLines[selectedTagLineIndexNumber].style.transform = 'translateY(' + topPosition + ')';
		   			tagLineClasses = tagLines[selectedTagLineIndexNumber].classList;
				    tagLineClasses.remove('hidden');
				    tagLineClasses.add('animated');
			    if( selectedTagLineIndexNumber === 3){
			    	animateMoreContentArrow();
			    }
	   		}, activeTagLineIndex * 2000, activeTagLineIndex);
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



