
var containerWidth = document.querySelector('.usa-map-container').innerWidth,
    width, 
    height;

    width = 960;

    height = width / 2; 




var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]); // scale things down so see entire US

var path = d3.geo.path().projection(projection);

// Define linear scale for output
var color = d3.scale.linear()
    .range(["rgb(255,0,0)", "rgb(255,255,255)", "rgb(0,128,0)"]);


//Create SVG element and append map to the SVG
var usaMap = d3.select("#usa-map")
    .append("svg")
    .attr('class', 'state-of-union-map')
    .attr("width", width)
    .attr("height", height);

// Append Div for tooltip to SVG

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


    // Load GeoJSON data and merge with states data
    
    d3.json("../data/us-states.json", function(geoData) {

        /*
        let stateName = "",
            stateConvertedGDP = ""
            stateRawDif = 0,
            stateConvertedDiff = "",
            stateConvertedPercentDiff = "";

        let q1GDP2015 = GDPbreakdowns.states.map(state => ({
            gdpConvertedBreakdown: state["2015"]["converted"][0]["Per capita GDP"],
            gdpRawDif: state["2015"]["raw"][0]["Actual Diff From nation"],
            gdpConvertedDif: state["2015"]["converted"][0]["Actual Diff From nation"],
            gdpConvertedPercentDiff: state["2015"]["converted"][0]["% Diff from nation"],
            state: state.state
        }));
        */

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
        
        // Bind the data to the SVG and create one path per GeoJSON feature
        usaMap.selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#000")
            .style("stroke-width", "1")
            .style("fill", function(d) {
                // Get data value
                var value = d.properties["rawDiff"];
                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
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


        // Load GeoJSON data and merge with states data
        
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
                        // Get data value
                        var value = d.properties["rawDiff"];
                        if (value) {
                            //If value exists…
                            return color(value);
                        } else {
                            //If value is undefined…
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




