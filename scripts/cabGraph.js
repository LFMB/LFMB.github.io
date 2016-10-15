(function(d3, undefined){

// Set the dimensions of the canvas / graph
var margin = {top: 10, right: 0, bottom: 30, left: 0},
    width = 360 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom;


/*
if you wanted to input date / time formatted as a generic 
MySQL ‘YYYY-MM-DD HH:MM:SS’ TIMESTAMP format 
  
the D3 parse script would look like;

parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

*/

// Parse the date / time:  day month year
var parseDate = d3.time.format("%Y-%m-%d").parse;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });
    
// Adds the svg canvas
var svg = d3.select(".graphCAB1")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("../data/cabelaHistoric.csv", function(error, data) {
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        /* when the format of the number being pulled out of the data may not mean that it is automagically recognised as a number. This line will ensure that it is. */
        d.close = +d.close;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.close; })]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

});
})(d3);