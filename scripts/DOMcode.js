(function($){
	var domHeight, browserHeight, heightDif;

	$(document).ready(function(){
		domHeight =  $('html').height();
		browserHeight = window.innerHeight;
		heightDif = browserHeight - domHeight;
		
		if(heightDif > 0){
			$('.page-content').css('padding-bottom', heightDif);
		}

	});

	/*
	$(window).on("resize", function(){
		domHeight =  $('html').height();
		browserHeight = window.innerHeight;
		heightDif = browserHeight - domHeight;
		
		if(heightDif > 0){
			$('.page-content').css('padding-bottom', heightDif);
		}

	});
	*/
})(jQuery);