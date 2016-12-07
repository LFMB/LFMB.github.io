d3.select("#state-of-union-distributiony")
    .datum(irwinHallDistribution(10000, 10))
  .call(histogramChart()
    .bins(d3.scale.linear().ticks(20))
    .tickFormat(d3.format(".02f")));

function irwinHallDistribution(n, m) {
  var distribution = [];
  for (var i = 0; i < n; i++) {
    for (var s = 0, j = 0; j < m; j++) {
      s += Math.random();
    }
    distribution.push(s / m);
  }
  return distribution;
}


