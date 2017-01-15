/*
var containerWidth = document.querySelector('.usa-map-container').innerWidth,
    width, 
    height;

    width = 960;

    height = width / 2; 

var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]); 

var path = d3.geo.path().projection(projection);

var color = d3.scale.linear()
    .range(["rgb(255,0,0)", "rgb(255,255,255)", "rgb(0,128,0)"]);


var usaMap = d3.select("#usa-map")
    .append("svg")
    .attr('class', 'state-of-union-map')
    .attr("width", width)
    .attr("height", height);

var tooltip = d3.select("#usa-map")
    .append("svg")
    .attr("class", "tooltip-svg")
    .style("opacity", 0);


var nationalPerCapita = d3.select('#usa-map')
    .append("p")
    .attr('class', 'quarterly-national-breakdown');


$('.quarter-selector-options .mdl-button').on('click', function(){
    var selectedQuarter = this.dataset.quarter,
        selectedYear =  this.dataset.year;
        buildStateOfUnion(selectedYear, selectedQuarter);
});



d3.json("../data/raw-and-converted-per-capita-gdp-data.json", function(GDPbreakdowns) {

    var legendText = [];

    var maxPerCapita = d3.max(GDPbreakdowns.states, function(d) {
        return d[2015]["raw"][0]["Actual Diff From nation"];
    });
    var minPerCapita = d3.min(GDPbreakdowns.states, function(d) {
        return d[2015]["raw"][0]["Actual Diff From nation"];
    });


    legendText = [maxPerCapita, "0", minPerCapita];

    color.domain([minPerCapita, 0, maxPerCapita]);

    
    nationalPerCapita.text('national per capita: ' + GDPbreakdowns.nation["2015"]["converted"][0]["Per capita GDP"]);
    
    d3.json("../data/us-states.json", function(geoData) {

        function filterByPropertiesName(obj) {
            if (obj.properties.name === stateName) {
                obj.convertedInfo = [];
                obj.properties.rawDiff = stateRawDiff;
                obj.convertedInfo[0] =  "State: " + stateName;
                obj.convertedInfo[1] = "GDP Per Capita: " + stateConvertedGDP;
                obj.convertedInfo[2] = "Diff. from Nation: " + stateConvertedDiff;
                obj.convertedInfo[3] = "Percent Diff.: " + stateConvertedPercentDiff;
            }
        }


        var stateName = "",
            stateConvertedGDP = ""
            stateRawDif = 0,
            stateConvertedDiff = "",
            stateConvertedPercentDiff = "";

        var q1GDP2015 = GDPbreakdowns.states.map(state => ({
            gdpConvertedBreakdown: state["2015"]["converted"][0]["Per capita GDP"],
            gdpRawDif: state["2015"]["raw"][0]["Actual Diff From nation"],
            gdpConvertedDif: state["2015"]["converted"][0]["Actual Diff From nation"],
            gdpConvertedPercentDiff: state["2015"]["converted"][0]["% Diff from nation"],
            state: state.state
        }));


        for (var a = 0; a < q1GDP2015.length; a++) {
            stateConvertedGDP = q1GDP2015[a]['gdpConvertedBreakdown'];
            stateRawDiff = q1GDP2015[a]['gdpRawDif'];
            stateConvertedDiff = q1GDP2015[a]['gdpConvertedDif'];
            stateConvertedPercentDiff = q1GDP2015[a]['gdpConvertedPercentDiff'];            
            stateName = q1GDP2015[a]['state'];
            geoData.features.filter(filterByPropertiesName);
        }
        
        usaMap.selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#000")
            .style("stroke-width", "1")
            .style("fill", function(d) {
                var value = d.properties["rawDiff"];
                if (value) {
                    return color(value);
                } else {
                   return "rgb(213,222,217)";
                }              
            })
            .on("mouseover", function(d) {
                var mouse = d3.mouse(usaMap.node()).map(function(d) {
                    return parseInt(d);
                }); 

                tooltip.selectAll('g')
                        .data(d.convertedInfo)
                        .enter()
                        .append('g')
                        .attr("transform", function(d,i) {
                            return "translate(0," + i * 20 + ")"; 
                        })
                        .append("text")
                        .attr("x", 2)
                        .attr("y", 9)
                        .text(function(d) {
                            return d;
                        });
                tooltip.selectAll('text')
                        .data(d.convertedInfo)
                        .text(function(d) {
                            return d;
                        });
                
                tooltip.transition()        
                   .duration(200)      
                   .style("opacity", .9);
                    tooltip.attr('style', 'left:' + (mouse[0] + 15) +
                                'px; top:' + (mouse[1] - 35) + 'px');  
            })           
            .on("mouseout", function(d) {    
                tooltip.transition()        
                   .duration(500)      
                   .style("opacity", 0);

            }
        );

        var legend = d3.select("#usa-map").append("svg")
            .attr("class", "legend")
            .attr("width", 180)
            .attr("height", 80);

        var legendHeader = d3.select('.legend')
            .append('text')
            .attr("x", 0)
            .attr("y", 9)
            .attr("dy", ".3em")
            .attr("class", "legend-header")
            .text('Diff from Nation in USD');

        var legendOutPuts = d3.select('.legend')
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + (i  * 20 + 20) + ")";
            }
        );

        legendOutPuts.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legendOutPuts.append("text")
            .data(legendText)
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) {
                return d;
            }
        );
    });

});






function buildStateOfUnion(year, quarter){
    var currentMap = d3.select('.state-of-union-map'),
        currentOutputs = d3.select('.legend'),
        legendText = [];

    d3.json("../data/raw-and-converted-per-capita-gdp-data.json", function(GDPbreakdowns) {

        var maxPerCapita = d3.max(GDPbreakdowns.states, function(d) {
            return d[year]["raw"][quarter]["Actual Diff From nation"];
        });
        var minPerCapita = d3.min(GDPbreakdowns.states, function(d) {
            return d[year]["raw"][quarter]["Actual Diff From nation"];
        });

        console.log("min: " + minPerCapita + " max: " + maxPerCapita);


        legendText = [maxPerCapita, "0", minPerCapita];

        color.domain([minPerCapita, 0, maxPerCapita]);

        
        nationalPerCapita.text('national per capita: ' + GDPbreakdowns.nation[year]["converted"][quarter]["Per capita GDP"]);
        
        d3.json("../data/us-states.json", function(geoData) {


            var stateName = "",
                stateConvertedGDP = ""
                stateRawDif = 0,
                stateConvertedDiff = "",
                stateConvertedPercentDiff = "";

            var selectedPeriod = GDPbreakdowns.states.map(state => ({
                gdpConvertedBreakdown: state[year]["converted"][quarter]["Per capita GDP"],
                gdpRawDif: state[year]["raw"][quarter]["Actual Diff From nation"],
                gdpConvertedDif: state[year]["converted"][quarter]["Actual Diff From nation"],
                gdpConvertedPercentDiff: state[year]["converted"][quarter]["% Diff from nation"],
                state: state.state
            }));
        

            function filterByPropertiesName(obj) {
                if (obj.properties.name === stateName) {
                    obj.convertedInfo = [];
                    obj.properties.rawDiff = stateRawDiff;
                    obj.convertedInfo[0] =  "State: " + stateName;
                    obj.convertedInfo[1] = "GDP Per Capita: " + stateConvertedGDP;
                    obj.convertedInfo[2] = "Diff. from Nation: " + stateConvertedDiff;
                    obj.convertedInfo[3] = "Percent Diff.: " + stateConvertedPercentDiff;
                }
            }


            for (var a = 0; a < selectedPeriod.length; a++) {
                stateConvertedGDP = selectedPeriod[a]['gdpConvertedBreakdown'];
                stateRawDiff = selectedPeriod[a]['gdpRawDif'];
                stateConvertedDiff = selectedPeriod[a]['gdpConvertedDif'];
                stateConvertedPercentDiff = selectedPeriod[a]['gdpConvertedPercentDiff'];            
                stateName = selectedPeriod[a]['state'];
                geoData.features.filter(filterByPropertiesName);
            }

            currentMap.transition();

            currentMap.selectAll("path")
                    .data(geoData.features)
                    .attr("d", path)
                    .style("fill", function(d) {
                        var value = d.properties["rawDiff"];
                        if (value) {
                            return color(value);
                        } else {
                           return "rgb(213,222,217)";
                        }              
                    })
                    .on("mouseover", function(d) {
                        var mouse = d3.mouse(usaMap.node()).map(function(d) {
                            return parseInt(d);
                        }); 

                        tooltip.selectAll('g')
                                .data(d.convertedInfo)
                                .enter()
                                .append('g')
                                .attr("transform", function(d,i) {
                                    return "translate(0," + i * 20 + ")"; 
                                })
                                .append("text")
                                .attr("x", 2)
                                .attr("y", 9)
                                .text(function(d) {
                                    return d;
                                });
                        tooltip.selectAll('text')
                                .data(d.convertedInfo)
                                .text(function(d) {
                                    return d;
                                });

                        tooltip.transition()        
                           .duration(200)      
                           .style("opacity", .9);
                            tooltip.attr('style', 'left:' + (mouse[0] + 15) +
                                        'px; top:' + (mouse[1] - 35) + 'px');                         
                    })           
                    .on("mouseout", function(d) {    
                        tooltip.transition()        
                           .duration(500)      
                           .style("opacity", 0);

                        tooltip.selectAll('g')

                    }
                );


            currentOutputs.transition();
            currentOutputs.selectAll("g")         
                .data(color.domain().slice().reverse())
                .enter()
                .append("g")
                .attr("transform", function(d, i) {
                    return "translate(0," + (i  * 20 + 20) + ")";
                }
            );

            currentOutputs.selectAll("rect")
                .transition()
                .style("fill", color);

            currentOutputs.transition();
            currentOutputs.selectAll("g text")
                .data(legendText)
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text(function(d) {
                    return d;
                }
            );

        });

    });
};

*/
/*
d3.json("../data/raw-and-converted-per-capita-gdp-data.json", function(GDPbreakdowns) {

    
    var maxPerCapita = d3.max(GDPbreakdowns.states, function(d) {
        return d[2015]["raw"][0]["Actual Diff From nation"];
    });
    var minPerCapita = d3.min(GDPbreakdowns.states, function(d) {
        return d[2015]["raw"][0]["Actual Diff From nation"];
    });

    var histogramRange = GDPbreakdowns.states.length;
    
    // Generate a log-normal distribution with a median of 30 minutes.
    // var values = d3.range(histogramRange).map(d3.random.logNormal(Math.log(30), .4));
    var values = d3.range(histogramRange).map(GDPbreakdowns.states, function(d) {
        return d[2015]["raw"][0]["Actual Diff From nation"];
    });

    // Formatters for counts and times (converting numbers to Dates).
    var formatCount = d3.format(",.0f"),
        formatTime = d3.time.format("%M"),
        formatMinutes = function(d) { return formatTime(new Date(2012, 0, 1, 0, d)); };

    var margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([0, 120])
        .range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(20))
        (values);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(formatMinutes);

    var svg = d3.select("#state-of-union-distribution").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function(d) { return height - y(d.y); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", x(data[0].dx) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.y); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

});

*/

d3.json("../data/raw-and-converted-per-capita-gdp-data.json", function(GDPbreakdowns) {

var histogramRange = GDPbreakdowns.states.length;

var histogramData = d3.range(histogramRange).map(d3.randomBates(10));

var formatCount = d3.format(",.0f");

var maxPerCapitaDiff = d3.max(GDPbreakdowns.states, function(d) {
    return d[2015]["raw"][0]["Actual Diff From nation"];
});
var minPerCapitaDiff = d3.min(GDPbreakdowns.states, function(d) {
    return d[2015]["raw"][0]["Actual Diff From nation"];
});



var maxPerCapita = d3.max(GDPbreakdowns.states, function(d) {
    return d[2015]["raw"][0]["Per capita GDP"];
});
var minPerCapita = d3.min(GDPbreakdowns.states, function(d) {
    return d[2015]["raw"][0]["Per capita GDP"];
});

var svg = d3.select("#state-of-union-distribution"),
    margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
    .rangeRound([0, width])
    .domain([minPerCapita, maxPerCapita]);

var bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(20))
    (histogramData);

var y = d3.scaleLinear()
    .domain([0, d3.max(bins, function(d) { return d.length; })])
    .range([height, 0]);

var bar = g.selectAll(".bar")
  .data(bins)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
    .attr("height", function(d) { return height - y(d.length); });

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.length); });

g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
});