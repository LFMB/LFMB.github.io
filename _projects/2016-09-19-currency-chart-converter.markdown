---
layout: project
title:  "Currency Chart and Converter - Screwing around with Highcharts, Promises and SVG elements"
icon: fa-gear
tags:
- jQuery Promises,
- SVG elements, 
- UX,
- Highschart.js

permalink: currency-chart-converter
---
---

## Background

Rolling out new Drupal themes had lost their wow factor and I remembered Shift created a landing page filled with interactive jQuery and Highchart widgets for a NASDAQ engagement (Full disclosure: my boss, Anthony DiSanti, did almost all the fun JS coding while I coded out the UI for said project). At the time, I was thoroughly impressed by my boss and now wanted to see if that was still the case. So I went back to the dev server we used to develop the page and ripped out two of the wdgets I particularly liked and went to work on incorporating them into a new theme I was developing for a current client.

## Old Code 

Here's the shift_currency2.js they're using

{% highlight javascript %}
(function($, undefined){

window.CurrencyConverter = function CurrencyConverter(requestedCurrencies) {
  var thisCurrencyConverter = this;
  var parseCurrencyRE = /[^0-9.]/g;
  var currencies;
  var loopRates = {};
  var apiCall;


  function loadRates(currencies) {
    var currencyCSV = '';
    $.each(currencies, function() {
      currencyCSV+= (currencyCSV !== '' ? ',' : '') + this;
      loopRates[this + this] = 1;
    });

    thisCurrencyConverter.exchangeRates = loopRates;
    apiCall = 'http://rates-a.shiftforex.com/v0/rates?nodes='
      + currencyCSV;

    return thisCurrencyConverter.refreshRates();
  }



  this.refreshRates = function refreshRates() {
    return $.get(apiCall).then(function(apiRates) {
      return $.extend(apiRates, loopRates, {timestamp: new Date()});
    }).done(function(rates) {
      thisCurrencyConverter.exchangeRates = rates;
    });
  };



  this.convert = function convert(fromCurrency, toCurrency, amount) {
    amount = thisCurrencyConverter.parseCurrency(amount);

    var conversion = $.Deferred();

    if (fromCurrency === toCurrency) {
      conversion.resolve(thisCurrencyConverter.formatCurrency(amount));
    } else {
      thisCurrencyConverter.ratesLoaded.done(function() {
        conversion.resolve(
          thisCurrencyConverter.formatCurrency(amount /
            thisCurrencyConverter.exchangeRates[toCurrency + fromCurrency]
          )
        );
      });
    }

    return conversion;
  };



  this.parseCurrency = function parseCurrency(currencyString) {
    if (typeof currencyString === 'string') {
      currencyString = currencyString.replace(parseCurrencyRE, '');
    }

    return parseFloat(currencyString);
  }



  this.formatCurrency = function formatCurrency(number) {
    return formatNum(number, 2);
  }



  this.formatRate = function formatRate(number) {
    return formatNum(number, 5);
  }



  function formatNum(number, digits) {
    return (Math.round(number * Math.pow(10,digits)) / Math.pow(10,digits))
      .toFixed(digits);
  }



  // Constructor
  if (currencies === undefined) {
    // TODO: Load all available currencies by default
  }
  this.ratesLoaded = loadRates(requestedCurrencies);
};






window.CurrencyConverterWidget = function CurrencyConverterWidget(
                                   initialElement, existingCurrencyConverter) {
  var thisCurrencyConverterWidget = this;
  var displayLoading = true;
  var onChangeCallbacks = $.Callbacks();
  var widgetElement;
  var fromDropDown;
  var toDropDown;
  var fromAmount;
  var toAmount;
  var lastUpdate;



  this.bind = function bind(element) {
    // Set private element variables
    widgetElement = $(element);

    var dropDowns = widgetElement.find('.sf-currency-drop-down');
    var amounts = widgetElement.find('.sf-currency-amount-io');

    fromDropDown = dropDowns.first();
    toDropDown = dropDowns.last();

    fromAmount = amounts.first();
    toAmount = amounts.last();

    
    // Initialize the CurrencyConverter
    if (existingCurrencyConverter !== undefined) {
      thisCurrencyConverterWidget.currencyConverter = existingCurrencyConverter;
    } else {
      var currencies = fromDropDown.find('option').map(function() {
        return $(this).val();
      });

      thisCurrencyConverterWidget.currencyConverter =
        new CurrencyConverter(currencies);
    }

    thisCurrencyConverterWidget.currencyConverter.ratesLoaded.done(function() {
      displayLoading = false;
    });

    updateTo();

    // Attach handlers
    fromDropDown.change(updateTo);
    toDropDown.change(updateTo);

    fromAmount.keyup(updateTo);
    toAmount.keyup(updateFrom);

    widgetElement.find('.sf-swap').click(swap);
  };



  this.getState = function getState() {
    return lastUpdate.then(function() {
      var parse = thisCurrencyConverterWidget.currencyConverter.parseCurrency;
      return {
        fromCurrency: fromDropDown.val(),
        toCurrency: toDropDown.val(),
        fromAmount: parse(fromAmount.val()),
        toAmount: parse(toAmount.val())
      };
    });
  };



  function swap() {
    var oldFrom = fromDropDown.val();
    
    fromDropDown.val(toDropDown.val());
    toDropDown.val(oldFrom);

    updateTo();
  }



  function updateTo() {
    update(fromDropDown, toDropDown, fromAmount, toAmount);
  }



  function updateFrom() {
    update(toDropDown, fromDropDown, toAmount, fromAmount);
  }



  function update(fromCurrencyField,
                  toCurrencyField,
                  fromAmountField,
                  toAmountField) {
    if (displayLoading) {
      showLoading();
    }

    var thisUpdate = thisCurrencyConverterWidget.currencyConverter.convert(
      fromCurrencyField.val(),
      toCurrencyField.val(),
      fromAmountField.val());

    lastUpdate = thisUpdate;
    thisUpdate.done(function(convertedAmount) {
      // Only proceed if this is the most recent update requested
      if (thisUpdate !== lastUpdate) {
        return;
      }

      // Update the widget
      hideLoading();
      toAmountField.val(convertedAmount);

      // Invoke the callbacks
      thisCurrencyConverterWidget.getState().done(function(state) {
        onChangeCallbacks.fire(state);
      });
    });
  }



  function showLoading() {
    widgetElement.find('.sf-loading').show();
  }



  function hideLoading() {
    widgetElement.find('.sf-loading').hide();
  }



  this.onChange = function onChange(callback) {
    onChangeCallbacks.add(callback);
  };



  // Constructor
  if (initialElement !== undefined) {
    this.bind(initialElement);
  }
};






window.RateDetails = function RateDetails(initialElement,
                                          initialFromCurrency,
                                          initialToCurrency,
                                          initialAmount,
                                          existingCurrencyConverter) {
  var thisRateDetails = this;
  var widgetElement;
  var fromCurrency;
  var toCurrency;
  var amount;
  var lastUpdate;



  this.getState = function getState() {
    return {
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
      amount: amount
    };
  };



  this.setState = function setState(newFromCurrency, newToCurrency, newAmount) {
    fromCurrency = newFromCurrency;
    toCurrency = newToCurrency;
    amount = thisRateDetails.currencyConverter.parseCurrency(newAmount);

    update();
  };



  this.setCurrencies = function(newFromCurrency, newToCurrency) {
    fromCurrency = newFromCurrency;
    toCurrency = newToCurrency;

    update();
  };



  this.setAmount = function(newAmount) {
    amount = thisRateDetails.currencyConverter.parseCurrency(newAmount);

    update();
  };



  function update() {
    if (widgetElement === undefined) {
      return;
    }

    var thisUpdate = thisRateDetails.currencyConverter.convert(fromCurrency,
                                                               toCurrency,
                                                               amount);

    lastUpdate = thisUpdate;
    return thisUpdate.done(function(convertedAmount) {
      // Only proceed if this is the most recent update requested
      if (thisUpdate !== lastUpdate) {
        return;
      }

      updateUI(convertedAmount);
    });
  }



  function updateUI(convertedAmount) {
    var cc = thisRateDetails.currencyConverter;
    var exchangeRate = cc.exchangeRates[toCurrency + fromCurrency];
    var inverseExchangeRate = cc.exchangeRates[fromCurrency + toCurrency];

    var classMap = {
      'sf-from-currency': fromCurrency,
      'sf-to-currency': toCurrency,
      'sf-from-amount': cc.formatCurrency(amount),
      'sf-to-amount': convertedAmount,

      'sf-to-amount-ask-1': cc.formatRate(1 / exchangeRate),
      'sf-to-amount-bid-1': cc.formatRate(inverseExchangeRate),
      'sf-to-amount-inverse-1': cc.formatRate(exchangeRate)
    };

    classMap['sf-to-amount-mid-1'] = cc.formatRate(
      (cc.parseCurrency(classMap['sf-to-amount-ask-1']) +
       cc.parseCurrency(classMap['sf-to-amount-bid-1'])) / 2);

    $.each(['sf-to-amount-ask', 'sf-to-amount-mid', 'sf-to-amount-bid'],
      function() {
        classMap[this] = cc.formatRate(classMap[this + '-1'] * amount);
    });

    $.each(classMap, function(className, text) {
      widgetElement.find('.' + className).text(text);
    });
  }



  this.bind = function bind(element) {
    widgetElement = $(element);

    thisRateDetails.setState(initialFromCurrency,
                             initialToCurrency,
                             initialAmount);
  }



  // Constructor
  this.currencyConverter = (existingCurrencyConverter !== undefined) ?
                           existingCurrencyConverter :
                           new CurrencyConverter();

  if (initialElement !== undefined) {
    this.bind(initialElement);
  }
};






window.CurrencyTable = function CurrencyTable(initialElement,
                                              initialCurrencyRows,
                                              initialCurrencyCols,
                                              existingCurrencyConverter) {
  var thisCurrencyTable = this;
  var currencyRows = [];
  var currencyCols = [];
  var currencyConverter;
  var widgetElement;



  this.setCurrencies = function setCurrencies(newCurrencyRows,
                                              newCurrencyCols) {
    // TODO: Support variable row and column counts

    // Populate row headers
    currencyRows = newCurrencyRows;
    var rowHeaders = widgetElement.find('.sf-have');
    for (var row = 0; row < currencyRows.length; row++) {
      rowHeaders.eq(row).find('.sf-currency-have-row').text(currencyRows[row]);
      rowHeaders.eq(row).find('img.sf-flag').attr('src', 'currency_converter/' +
        currencyRows[row].toLowerCase() + '-flag.png');
    }

    // Populate column headers
    if (newCurrencyCols !== undefined) {
      currencyCols = newCurrencyCols;
      var colHeaders = widgetElement.find('.sf-currencies-available td')
        .slice(1);
      for (var col = 0; col < currencyCols.length; col++) {
        colHeaders.eq(col).find('.sf-currency-available-id')
          .text(currencyCols[col]);
        colHeaders.eq(col).find('img.sf-flag').attr('src', 'currency_converter/' +
          currencyCols[col].toLowerCase() + '-flag.png');
      }
    }

    thisCurrencyTable.refresh();
  };



  this.refresh = function refresh() {
    var cc = thisCurrencyTable.currencyConverter;

    if (cc.ratesLoaded.state() !== 'resolved') {
      showLoading();
      return this.currencyConverter.ratesLoaded.done(hideLoading);
    }

    var widgetRows = widgetElement.find('.sf-currency-have');

    for (var row = 0; row < currencyRows.length; row++) {
      var widgetCols = widgetRows.eq(row).find('.sf-currency-table-rates');

      for (var col = 0; col < currencyCols.length; col++) {
        widgetCols.eq(col).find('.sf-chart-numerator').text(cc.formatRate(
          cc.exchangeRates[currencyRows[row] + currencyCols[col]]));
        widgetCols.eq(col).find('.sf-inverse').text(cc.formatRate(
          cc.exchangeRates[currencyCols[col] + currencyRows[row]]));
      }
    }

    widgetElement.find('.sf-refresh-datetime').text(cc.exchangeRates.timestamp);

    return $.Deferred().resolve();
  };



  this.bind = function bind(element) {
    widgetElement = $(element);

    thisCurrencyTable.setCurrencies(initialCurrencyRows, initialCurrencyCols);
  };



  function showLoading() {
    widgetElement.find('.sf-currency-table-rates').hide();
    widgetElement.find('.sf-currency-table-loading').show();
    widgetElement.find('.sf-currency-table-refresh').hide();
  }



  function hideLoading() {
    widgetElement.find('.sf-currency-table-loading').hide();
    widgetElement.find('.sf-currency-table-rates').show();
    widgetElement.find('.sf-currency-table-refresh').show();

    thisCurrencyTable.refresh();
  }



  // Constructor
  this.currencyConverter = (existingCurrencyConverter !== undefined) ?
    existingCurrencyConverter :
    new CurrencyConverter(initialCurrencyRows.concat(initialCurrencyCols));

  if (initialElement !== undefined) {
    this.bind(initialElement);
  }
};






window.PracticeTradeWidget = function PracticeTradeWidget(initialElement, existingCurrencyConverter) {
  var thisPracticeTradeWidget = this;
  var currencyNames = {
    EUR: 'Euros',
    USD: 'US Dollars',
    GBP: 'British Pounds',
    AUD: 'Australian Dollars'
  };
  var widgetElement;
  var buyButton;
  var sellButton;
  var messageContainer;
  var baseCurrency;
  var quoteCurrency;
  var rates = {};
  var lastTrade;

  this.bind = function bind(element) {
    widgetElement = $(element);
    messageContainer = widgetElement.find('.sf-practice-trade-text');
    buyButton = widgetElement.find('.sf-practice-trading-buy');
    sellButton = widgetElement.find('.sf-practice-trading-sell');

    // Attach click handlers for buy/sell
    widgetElement.find('.sf-practice-trading-decision-action').click(executeTrade);

    // Attach handlers for settings
    widgetElement.find('select[name="pair"]').change(changeInstrument);
    widgetElement.find('select[name="amount"]').change(clearMessage);
    widgetElement.find('select[name="leverage"]').change(clearMessage);

    // Initialize the widget
    changeInstrument();
  };



  function changeInstrument() {
    var pair = widgetElement.find('select[name="pair"]').val();
    baseCurrency = pair.substr(0,3);
    quoteCurrency = pair.substr(3,3);

    clearMessage();
    showRates();
  }



  function clearMessage() {
    messageContainer.text('');
  }



  function showRates() {
    var buyRateElement = buyButton.find('.sf-practice-trading-rate');
    var sellRateElement = sellButton.find('.sf-practice-trading-rate');

    buyRateElement.html('');
    sellRateElement.html('');

    thisPracticeTradeWidget.currencyConverter.ratesLoaded.done(function() {
      buyRateElement.html(getRateHTML(
        thisPracticeTradeWidget.currencyConverter.exchangeRates[
          baseCurrency + quoteCurrency]));
      sellRateElement.html(getRateHTML(
        1 / thisPracticeTradeWidget.currencyConverter.exchangeRates[
          quoteCurrency + baseCurrency]));
    });
  }



  function getRateHTML(rate) {
    var significantDigits = padRight(Math.floor(rate * 100) / 100, 4);
    var pips = padRight(Math.round((rate - significantDigits) * 10000), 2);

    return significantDigits + '<span class="sf-rate-pip-digits">' + pips + '</span>';
  }



  function padRight(num, length) {
    var numString = num + '';

    while (numString.length < length) {
      numString+= '0';
    }

    return numString;
  }



  function executeTrade() {
    var direction = $(this).val();
    
    if (thisPracticeTradeWidget.currencyConverter.ratesLoaded.state()
        !== 'resolved') {
      messageContainer.html('<img src="currency_converter/loading.gif" />')
    }

    showMessage(direction);
  }



  function showMessage(tradeDirection) {
    var amount = widgetElement.find('select[name="amount"]').val();
    var thisTrade = thisPracticeTradeWidget.currencyConverter.convert(baseCurrency, quoteCurrency,
                                               amount);

    lastTrade = thisTrade;
    thisTrade.done(function(quoteAmount) {
      if (thisTrade !== lastTrade) {
        return;
      }

      var leverage = widgetElement.find('select[name="leverage"]').val();
      var deposit = thisPracticeTradeWidget.currencyConverter.formatCurrency(quoteAmount / leverage);

      var message = ['To', tradeDirection, amount, currencyNames[baseCurrency], 'for', quoteAmount, currencyNames[quoteCurrency],
                     'at', leverage + ':1', 'leverage you must deposit', deposit, 'of margin into a brokerage account.']
                    .join(' ');

      messageContainer.text(message);
    });
  }



  // Constructor
  if (existingCurrencyConverter !== undefined) {
    this.currencyConverter = existingCurrencyConverter;
  } else {
    this.currencyConverter = new CurrencyConverter(['USD', 'EUR', 'GBP', 'AUD']);
  }

  if (initialElement !== undefined) {
    this.bind(initialElement);
  }
}






window.CurrencyChart = function CurrencyChart(initialPair,
                                              initialMonths,
                                              initialElement) {
  var thisCurrencyChart = this;
  var today = new Date();
  var pair;
  var startDate;
  var endDate;
  var widgetElement;



  this.setPair = function setPair(newPair) {
    pair = newPair.toUpperCase();
  }



  this.showLastMonths = function showLastMonths(months) {
    var newStartDate = new Date();
    newStartDate.setMonth(today.getMonth() - months);

    thisCurrencyChart.setDates(newStartDate, today);
  }



  this.setDates = function setDates(newStartDate, newEndDate) {
    startDate = newStartDate;
    endDate = newEndDate;
  }



  this.bind = function bind(element) {
    widgetElement = $(element);

    // Enable date controls
    widgetElement.find('.sf-fxchart-date').each(function() {
      var dateControl = $(this);
      dateControl.click(function() {
        widgetElement.find('.sf-fxchart-date').removeClass('sf-fxchart-active');
        dateControl.addClass('sf-fxchart-active');

        thisCurrencyChart.showLastMonths(dateControl.attr('data-months'));
        thisCurrencyChart.draw();
      });
    });


    //TODO: loop through DOM nodes of currency buttons
    // Enable currency controls
    widgetElement.find('.sf-fxchart-pair').each(function() {
      var pairControl = $(this);
      pairControl.click(function() {
        widgetElement.find('.sf-fxchart-pair').removeClass('sf-fxchart-active');
        pairControl.addClass('sf-fxchart-active');

        thisCurrencyChart.setPair(pairControl.attr('data-pair'));
        thisCurrencyChart.draw();
      });
    });

    // Draw the chart
    thisCurrencyChart.draw();    
  };



  this.draw = function draw() {
    var start = formatDate(startDate);
    var end = formatDate(endDate);

    $.getJSON('http://rates-h.shiftforex.com/v1/rates.php', {
        from: start,
        to: end,
        pair: pair
    }).done(showChart)
    .fail(showError);
  }



  function formatDate(date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
  }



  function showChart(rates) {
    // Cast strings to numbers
    rates.High = parseFloat(rates.High);
    rates.Low = parseFloat(rates.Low);

    // Calculate xpadding
    var xpadding = (rates.chart_end_time - rates.chart_begin_time) * .0385;

    // Generate the chart
    indexchart = new Highcharts.Chart({
      chart: {
        renderTo: "charteriffic",
        type: "area"
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          second: '%H:%M:%S',
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%b %e',
          week: '%b %e',
          month: '%b \'%y',
          year: '%Y'
        },
        min: rates.chart_begin_time - xpadding,
        max: rates.chart_end_time + xpadding,
        startOnTick: false,
        endOnTick: false
      },
      yAxis: {
        title: {
          text: ''
        },
        type: 'number',
        plotLines: [{
          color: '#424242',
          width: 2,
          value: rates.PreviousClose
        }],
        min: rates.Low,
        max: rates.High,
        startOnTick: false,
        endOnTick: false
      },
      exporting: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: ''
      },
      tooltip: {
        formatter: function () {
          return Highcharts.dateFormat("%a, %B %e %Y", this.x) +
            '</b><br />' + this.series.name + ': <b>' +
            Highcharts.numberFormat(this.y, 4);
        }
      },
      series: [{
        name: rates.Index,
        data: rates.data,
        dataGrouping: {
          enabled: false
        },
        lineWidth: 2
      }],
      plotOptions: {
        line: {
          gapSize: 5
        },
        series: {
          lineColor: '#009EC2',
          fillColor: {
            linearGradient: [0, 0, 0, 300],
            stops: [
              [0, '#009EC2'],
              [1, 'rgba(71,195,211,0.4)']
            ]
          }, 
          shadow: false,
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
                lineWidth: 2
              }
            }
          }, 
          color: '#009EC2'
        }
      }
    });
  }



  function showError() {
    widgetElement.find("#charteriffic").html('<div id="blackoutmiddle">' + 
      '<div id="blackoutinner">An error occurred while trying to retrieve ' +
      'the chart data.</div></div>');
  }



  // Constructor
  this.setPair(initialPair || 'EURUSD');
  this.showLastMonths(initialMonths || 12);

  if (initialElement !== undefined) {
    this.bind(initialElement);
  }
}






// onReady code for the Currency Converter widgets
$(document).ready(function() {
  var currencyConverterElement = $('.sf-currency-converter-input-form');
  if (currencyConverterElement.length > 0) {
    // Initialize the Currency Converter widget
    var currencyConverterWidget = new CurrencyConverterWidget(this);
    var currencyConverter = currencyConverterWidget.currencyConverter;

    currencyConverterWidget.getState().done(function(state) {
      // Initialize the Rate Details widget
      $('.sf-rate-details').each(function() {
        var rateDetails = new RateDetails(this,
          state.fromCurrency,
          state.toCurrency,
          state.fromAmount,
          currencyConverter);

        currencyConverterWidget.onChange(function(state) {
          rateDetails.setState(state.fromCurrency,
            state.toCurrency,
            state.fromAmount);
        });
      });

      // Initialize the Currency Table widget
      $('.sf-currency-table-widget').each(function() {
        var currencyTable = new CurrencyTable(this,
          [state.fromCurrency, state.toCurrency],
          ['USD', 'JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'ZAR', 'NZD'],
          currencyConverterWidget.currencyConverter);

        currencyConverterWidget.onChange(function(state) {
          currencyTable.setCurrencies([state.fromCurrency, state.toCurrency]);
        });
      });

      var currencyChartElement = $('.sf-fxchart');
      if (currencyChartElement.length > 0) {
        var currencyChart = new CurrencyChart('EURUSD', 6, currencyChartElement);

        currencyConverterWidget.onChange(function(state) {
          currencyChart.setPair(state.toCurrency + state.fromCurrency);
          currencyChart.draw();
        });
      }
    });
  } else {
    // Initialize the currency chart widget
    var currencyChartElement = $('.sf-fxchart');
    if (currencyChartElement.length > 0) {
      var currencyChart = new CurrencyChart('EURUSD', 6, currencyChartElement);
    }
  }

  // Sets width of dotted line under the recent trends title  
  var dottedLineWidth = $('.sf-recent-trends-widget-header').width() - $('.sf-trends-icon-container').width();
  $('.sf-dots').css('width', dottedLineWidth);

  // Initialize the practice trade widget
  var practiceTradeWidgetElement = $('.sf-practice-trading-widget');
  if (practiceTradeWidgetElement.length > 0) {
    var currencyConverter = currencyConverter || new CurrencyConverter(['USD', 'EUR', 'GBP', 'AUD']);
    var practiceTradeWidget = new PracticeTradeWidget(practiceTradeWidgetElement, currencyConverter);
  }
});

})(jQuery);


{% endhighlight %}

