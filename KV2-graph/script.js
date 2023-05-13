// Load your data
var data = [
    // your JSON data here
  ];

fetch("../data/pollution/pollution_data.json")
  .then(response => response.json())
  .then(d => {
    data = d;
      console.log(data);
  })
  .catch(error => {
      console.error('Error fetching the resource:', error);
  });

  
  // Convert the dt field from unix time to JS Date object
  data.forEach(function(d) {
    d.dt = new Date(d.dt * 1000);
  });
  
  var svg = d3.select("svg"),
      margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // Set the ranges
  var x = d3.scaleTime().rangeRound([0, width]);
  var y = d3.scaleLinear().rangeRound([height, 0]);
  
  // Define the line
  var line = d3.line()
      .x(function(d) { return x(d.dt); })
      .y(function(d) { return y(d.components.pm10); });
  
  // Set the domain of the axes
  x.domain(d3.extent(data, function(d) { return d.dt; }));
  y.domain(d3.extent(data, function(d) { return d.components.pm10; }));
  
  // Add the X Axis
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  
  // Add the Y Axis
  g.append("g")
      .call(d3.axisLeft(y));
  
  // Add the line path.
  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  