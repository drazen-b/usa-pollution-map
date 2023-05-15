var projection = d3.geoAlbersUsa().translate([480, 300]).scale(1200);
var path = d3.geoPath().projection(projection);

d3.json("../data/maps/us.json").then(function(us) {

    var geoJson = topojson.feature(us, us.objects.states);

    var svg = d3.select("#map");

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    svg.selectAll("path")
        .data(geoJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);
    
    d3.json("../data/pollution/cities_with_pollution_simple.json").then(function(data) {
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
                return Math.sqrt(d.pollution_data[0].main.aqi) * 10; // Scale the radius by AQI
            })
            .style("fill", function(d) {
                // Color based on AQI
                switch (d.pollution_data[0].main.aqi) {
                    case 1:
                        return "green";
                    case 2:
                        return "lightgreen";
                    case 3:
                        return "yellow";
                    case 4:
                        return "orange";
                    case 5:
                        return "purple";
                    default:
                        return "black";
                }
            })
            .attr("opacity", "0.6")
            .on("mouseover", function(event, d){
                tooltip
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 10) + "px")
                  .style("display", "inline-block")
                  .html(`City: ${d.city}<br>AQI: ${d.pollution_data[0].main.aqi}`);
            })
            .on("mouseout", function(d){ tooltip.style("display", "none");});
    });
});
