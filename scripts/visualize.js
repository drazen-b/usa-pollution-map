// Define your projection and path
var projection = d3.geoAlbersUsa().translate([480, 300]).scale(1200);
var path = d3.geoPath().projection(projection);

// Load and process the TopoJSON
d3.json("../data/maps/us.json").then(function(us) {
    // Convert TopoJSON to GeoJSON
    var geoJson = topojson.feature(us, us.objects.states);

    // Select the SVG element
    var svg = d3.select("#map");

    // Bind the GeoJSON data to the SVG elements
    svg.selectAll("path")
        .data(geoJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);
    
    // Load the cities data
    d3.json("../data/maps/us-cities.json").then(function(data) {
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection([d.lng, d.lat])[0];
            })
            .attr("cy", function(d) {
                return projection([d.lng, d.lat])[1];
            })
            .attr("r", function(d) {
                return Math.sqrt(d.population) / 500; // Scale the radius by population
            })
            .style("fill", "red")
            .attr("opacity", "0.6");
    });
});



// var path = d3.geo.path().projection(projection);

// d3.json("../data/maps/us.json", function (error, us) {
//   svg
//     .append("path")
//     .datum(topojson.feature(us, us.objects.land))
//     .attr("class", "land")
//     .attr("d", path);
// });

// d3.json("../data/pollution/cities_with_pollution.json")
//   .then(function (data) {
//     console.log(data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
