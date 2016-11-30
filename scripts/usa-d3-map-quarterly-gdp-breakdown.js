
var containerWidth = document.querySelector('.usa-map-container').clientWidth,
    height = 500,
    width;


// window.data = {};
if(containerWidth > 840){
    width = containerWidth;
} else {
    width = 960;
}

var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]); // scale things down so see entire US

var path = d3.geo.path().projection(projection);

// Define linear scale for output
var color = d3.scale.linear()
    .range(["rgb(255,0,0)", "rgb(255,255,255)", "rgb(0,128,0)"]);

var legendText = ["Above", "Average", "Below", "Nada"];

/*
var mapTitle = d3.select('#usa-map')
                .append('h2')
                .attr("class", "state-of-union-map-title")
                .text('State of the Union');
*/

/*
TODO: enter catergories array into tooltip while showing state's stats
*/
var toolTipCatergories = ["State", "State GDP Per Capita", "Difference from National", "Percent Difference" ];

//Create SVG element and append map to the SVG
var svg = d3.select("#usa-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Append Div for tooltip to SVG
var tooltip = d3.select("#usa-map")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


var nationalPerCapita = d3.select('#usa-map')
    .append("p")
    .attr('class', 'quarterly-national-breakdown');




// Load in all quarters data!
d3.json("../data/raw-and-converted-per-capita-gdp-data.json", function(GDPbreakdowns) {


    var max2015q1 = d3.max(GDPbreakdowns.states, function(d) {
        return d["2015"]["raw"][0]["Actual Diff From nation"];
    });
    var min2015q1 = d3.min(GDPbreakdowns.states, function(d) {
        return d["2015"]["raw"][0]["Actual Diff From nation"];
    });

    console.log("min: " + min2015q1 + " max: " + max2015q1);

    color.domain([min2015q1, 0, max2015q1]);

    
    nationalPerCapita.text('national per capita: ' + GDPbreakdowns.nation["2015"]["converted"][0]["Per capita GDP"]);


    // Load GeoJSON data and merge with states data
    
    d3.json("../data/us-states.json", function(usamap) {

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

        function filterByPropertiesName(obj) {
            if (obj.properties.name === stateName) {
            	obj.properties.breakdown = stateConvertedGDP;
                obj.properties.rawDiff = stateRawDiff;
                obj.properties.convertedDiff =  stateConvertedDiff;
                obj.properties.convertedPercent =  stateConvertedPercentDiff;
            }
        }


        for (let a = 0; a < q1GDP2015.length; a++) {
            stateConvertedGDP = q1GDP2015[a]['gdpConvertedBreakdown'];
            stateRawDiff = q1GDP2015[a]['gdpRawDif'];
            stateConvertedDiff = q1GDP2015[a]['gdpConvertedDif'];
            stateConvertedPercentDiff = q1GDP2015[a]['gdpConvertedPercentDiff'];            
            stateName = q1GDP2015[a]['state'];
            usamap.features.filter(filterByPropertiesName);
        }

        

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(usamap.features)
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
                var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                });     
                tooltip.transition()        
                   .duration(200)      
                   .style("opacity", .9);
                 

                  tooltip.text(
                  	"State: " + d.properties["name"] + " " +
                  	"State GDP Per Capita: " +  d.properties["breakdown"] + " " +
                  	"Difference from National: " + d.properties["convertedDiff"] + " " +
                  	"Percent Difference: " + d.properties["convertedPercent"]
                  	);

                  	tooltip.attr('style', 'left:' + (mouse[0] + 15) +
                                'px; top:' + (mouse[1] - 35) + 'px'); 
                   // .style("left", (d3.event.pageX) + "px")     
                   // .style("top", (d3.event.pagseY - 28) + "px");   
                  
            })                 
            .on("mouseout", function(d) {       
                tooltip.transition()        
                   .duration(500)      
                   .style("opacity", 0);   
            }
        );

                    
         
        var legend = d3.select("#usa-map").append("svg")
            .attr("class", "legend")
            .attr("width", 100)
            .attr("height", 80)
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            }
        );

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
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