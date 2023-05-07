const width = 960,
  height = 600;

const projection = d3.geoAlbersUsa().scale(1280).translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

// Load TopoJSON data for the USA
d3.json("data/maps/us-map.json").then(topoData => {
  // Draw the map
  svg.selectAll("path")
    .data(topojson.feature(topoData, topoData.objects.states).features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#ccc")
    .style("stroke", "#fff")
    .style("stroke-width", 1);

  // Load city data
  d3.json("data/maps/us-cities.json").then(async cityData => {
    // Fetch air pollution data for all cities concurrently
    const pollutionDataPromises = cityData.map(city => fetchCityPollution(city.Latitude, city.Longitude));
    const pollutionData = await Promise.all(pollutionDataPromises);

    // Assign pollution data to the city objects
    for (let i = 0; i < cityData.length; i++) {
      cityData[i].pollution = pollutionData[i];
    }

    // Draw the cities as dots on the map
    svg.selectAll("circle")
      .data(cityData)
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
      .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
      .attr("r", d => Math.sqrt(d.Population) / 50)
      .style("fill", d => pollutionColor(d.pollution))
      .style("opacity", 0.8)
      .on("click", function (d) {
        var cityName = d.City.toLowerCase();
        console.log(cityName, d.pollution);
      });

    // Function to fetch air pollution data for a city
    async function fetchCityPollution(lat, lon) {
      try {
        const response = await fetch(`https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=25&API_KEY=7B2A235A-4BB4-40C7-A720-3678CE796996`);
        const data = await response.json();
        return data[0] ? data[0] : null;
      } catch (error) {
        console.error("Failed to fetch air pollution data for a city.", error);
        return null;
      }
    }

    // Function to determine the color of the dots based on pollution levels
    function pollutionColor(pollution) {
      if (!pollution || !pollution.AQI) return "gray";
      const aqi = pollution.AQI;
      if (aqi < 50) return "green";
      if (aqi < 100) return "yellow";
      if (aqi < 150) return "orange";
      if (aqi < 200) return "red";
      return "purple";
    }
  });
});
