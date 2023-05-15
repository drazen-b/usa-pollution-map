var projection = d3.geoAlbersUsa().translate([480, 300]).scale(1200);
var path = d3.geoPath().projection(projection);

var projection = d3.geoAlbersUsa().translate([480, 300]).scale(1200);
var path = d3.geoPath().projection(projection);

Promise.all([
    d3.json("../data/maps/us.json"),
    d3.json("../data/pollution/pollution_data.json"),
    d3.json("../data/pollution/cities_with_pollution_simple.json")
]).then(function (files) {
    var us = files[0];
    var pollutionData = files[1];
    var citiesData = files[2];

    var geoJson = topojson.feature(us, us.objects.states);

    var svg = d3.select("#map");

    var tooltip = d3.select("#info").insert("div").attr("class", "toolTip");

    svg.selectAll("path")
        .data(geoJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "lightgray")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5);

    svg.selectAll("circle")
        .data(citiesData)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.lng, d.lat])[0];
        })
        .attr("cy", function (d) {
            return projection([d.lng, d.lat])[1];
        })
        .attr("r", function (d) {
            return Math.sqrt(d.pollution_data[0].main.aqi) * 10; // Scale the radius by AQI
        })
        .style("fill", function (d) {
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
        .on("mouseover", function (event, d) {
            var aqi = d.pollution_data[0].main.aqi;
            var aqiString = '';
            var color = 'white';

            // Set aqiString based on AQI
            switch (aqi) {
                case 1:
                    aqiString = "AQI: 1 - Good";
                    color = "green";
                    break;
                case 2:
                    aqiString = "AQI: 2 - Fair";
                    color = "lightgreen";
                    break;
                case 3:
                    aqiString = "AQI: 3 - Moderate";
                    color = "yellow";
                    break;
                case 4:
                    aqiString = "AQI: 4 - Poor";
                    color = "orange";
                    break;
                case 5:
                    aqiString = "AQI: 5 - Very Poor";
                    color = "purple";
                    break;
                default:
                    aqiString = "AQI: " + aqi;
            }

            tooltip
                .style("left", (event.pageX - 10) + "px")
                .style("top", (event.pageY - 70) + "px")
                .style("display", "inline-block")
                .style("color", color)
                .html(`City: ${d.city}<br>${aqiString}`);
        })
        .on("mouseout", function (d) {
            tooltip.html("");
        })
        .on("click", function (event, d) {
            displayCityInformation(d, pollutionData);
        });;
});




function displayCityInformation(cityData, pollutionData) {
    var infoContainer = d3.select("#city-info");
    infoContainer.html(""); // Clear existing information

    var cityPollution = pollutionData.find(function (p) {
        return p.coord.lon === cityData.lng && p.coord.lat === cityData.lat;
    });

    console.log(cityPollution);

    infoContainer.append("h3")
        .text(cityData.city);

    if (cityPollution && cityPollution.list.length > 0) {
        infoContainer.append("p")
            .text("AQI: " + cityPollution.list[0].main.aqi);

        // Add additional information about the city here
    } else {
        infoContainer.append("p")
            .text("No pollution data available for this city.");
    }
}

// function loadGraphs(pollutionData)