---
layout: project
title:  "Updating Shift's Rate Ticker - Getting Dirty with Ancient jQuery while Lowering our AWS Bill"
icon: fa-bulb
tags:
- jQuery Promises,
- CSS3 Animations, 
- Objects,
- Arrays

permalink: rates-ticker
---
---

## Background

For a long time one of Shift's only FX specific features on the sites I rolled out for their clients was a slightly jankey rates ticker. For numerous reasons this eventually became a massive problem (costs, naturally occuring massive traffic spikes and also DDOS attacks). We had to the disable the ticker. At the time of take down Shift only had two people who had the know-how to do the necessary fixes and they were both busy with much higher level issues so we/ the people at Shift Forex did as much as we could to keep people happy while silently acknowledging this was a terrible situation. 

The workflow finally cooled down enough that I was able to take a crack at revamping the js.

## Old Code 

Here's the former rates.js

{% highlight javascript %}


(function($) {

var ticker;

$(document).ready(function(){
  ticker = $('#rates-ticker');
  
  if(ticker.length > 0){
    ticker.webTicker();
    getRates();
    setInterval(getRates, 3000);
  }
});

var currentRates;

function getRates() {
  var minRateStrWidth = 100; // estimated minumum width of a rate string 
  if (ticker.find('li').length 
          < (Math.floor(ticker.parent().width() / minRateStrWidth) + 6)) {
    $.get('http://rates.shiftforex.com/v1/')
      .then(function(rates) {
        rates.at = new Date(rates.at);
        return rates;
      }).done(updateRates);
  }
}

function updateRates(newRates) {
  var rates;
  if (typeof currentRates === 'undefined') {
    rates = newRates.rates;
    currentRates = newRates;
  } else {
    if (newRates.at <= currentRates.at) {
      return;
    }
    
    rates = ratesDiff(currentRates.rates, newRates.rates);
    $.extend(currentRates, newRates);
  }
  
  ticker.webTicker('update', formatRates(rates), 'swap', true, false);
}

function formatRates(rates) {
  // Format the rates into a string for insertion into the ticker
  var rateStr = '';
  for (var symbol in rates) {
    var pair = rates[symbol];   
    rateStr += '<li class="webticker-init rate-item">' + 
        '<span class="symbol">' + symbol.substring(0, 3) + '-' + symbol.substring(3) + '</span>' + ' ' + 
        '<span class="rate">' + pair.rate + '</span>';
    if (typeof pair.diff === 'number') {
      rateStr += '<span class="diff">' + 
        ((pair.diff > 0) ? '(<i class="fa fa-caret-up"></i>' : '(<i class="fa fa-caret-down"></i>') +
        Math.abs((pair.diff * Math.pow(10, String(pair.pipUnit).length - 2)).toFixed(String(pair.pipUnit).length - 1)) + 
        ')' + '</span>';
    }
    rateStr += '</li>';
  }
  return rateStr;
}

function ratesDiff(oldRates, newRates) {
  var diff = {};
  
  for (var symbol in newRates) {
    if ((typeof oldRates[symbol] !== 'object') ||
        (newRates[symbol].rate !== oldRates[symbol].rate)) {
      diff[symbol] = {
        rate: newRates[symbol].rate,
        diff: newRates[symbol].rate - oldRates[symbol].rate,
        pipUnit: newRates[symbol].pipUnit
      };
    }
  }
  
  return diff;
}

})(jQuery);

{% endhighlight %}

here's the new

{% highlight javascript %}
(function($) {

var ticker;

$(document).ready(function(){
  ticker = $('#rates-ticker');
  
  if(ticker.length > 0){
    ticker.webTicker();
    getRates();
    setInterval(getRates, 13000);
  }
});


var currentRates, filteredOldRates;

function getRates() {
  var minRateStrWidth = 100; // estimated minumum width of a rate string 
  if (ticker.find('li').length 
          < (Math.floor(ticker.parent().width() / minRateStrWidth) + 6)) {
    $.get('http://rates-a.shiftforex.com/v1/rates?pairs=AUDUSD,EURUSD,GBPUSD,NZDUSD,USDCAD,USDCHF,USDJPY')
      .then(function(rates) {
         rates.at = new Date().getTime();
         
        return rates;
      }).done(updateRates);
  }
}

function updateRates(newRates) {

  
  var rates;
  
  if (typeof currentRates === 'undefined') {
      currentRates = newRates;
      $.extend(currentRates);
  } else {
    if (newRates.at <= currentRates.at) {
      return;
    }
      $.extend(newRates);
  }

  rates = ratesDiff(currentRates, newRates);


  ticker.webTicker('update', formatRates(rates), 'swap', true, false);
  
}

function formatRates(rates) {
  // Format the rates into a string for insertion into the ticker
  var rateStr = '';
  rates.map(function(rate){

  rateStr += '<li class="webticker-init rate-item">' + 
        '<span class="symbol">' + 
          rate.pair.substring(0, 3) + 
          '-' + 
          rate.pair.substring(3) +
        '</span>' +
        '<span class="rate">' + rate['current-rate'] + '</span>';

        if (typeof rate.spread === 'number' && rate.spread !== 0) {
      rateStr += '<span class="diff">' + 
        ((rate.spread > 0) ? '(<i class="fa fa-caret-up"></i>' : '(<i class="fa fa-caret-down"></i>') +
        //Math.abs((pair.diff * Math.pow(10, String(pair.pipUnit).length - 2)).toFixed(String(pair.pipUnit).length - 1)) + 
        (Math.trunc(Math.abs(rate.spread * Math.pow(10, 5))) / 10) +
        ')' + '</span>';
      }
    rateStr += '</li>';
      
  });

  return rateStr;
}

function ratesDiff(oldRates, newRates) {
  var currencyPairs = [ 'AUDUSD', 'EURUSD', 'GBPUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY'],
    convertedPairInfo = [],
    filteredNewRates = [],
    currencyPairsLength;

    currencyPairsLength = currencyPairs.length;

  

  if (filteredOldRates === undefined){
    
    filteredOldRates = [];

    for( var baseData in oldRates){
      if(oldRates[baseData] != oldRates.at) {

        filteredOldRates.push(oldRates[baseData]);
        $.extend(filteredOldRates);

      }
    }
  }


  
  for (var symbol in newRates) {
    
    if(newRates[symbol] != newRates.at){
      filteredNewRates.push(newRates[symbol]);
    }
  }

  for(var i = 0; i < currencyPairsLength; i++){
    
    convertedPairInfo[i] = {};
    convertedPairInfo[i]['pair'] = currencyPairs[i];
    convertedPairInfo[i]['current-rate'] = filteredNewRates[i];
    convertedPairInfo[i]['old-rate'] = filteredOldRates[i];
    convertedPairInfo[i]['spread'] = filteredOldRates[i] - filteredNewRates[i]; 
  }

  return convertedPairInfo

}

})(jQuery);

{% endhighlight %}