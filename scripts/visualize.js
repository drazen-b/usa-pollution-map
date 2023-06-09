var width = 1200;
var height = 800;
var scale = 1500;

var projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(scale);
var path = d3.geoPath().projection(projection);

var selectedAqi = 'all';


Promise.all([
  d3.json("../data/maps/us.json"),
  d3.json("../data/pollution/pollution_data.json"),
  d3.json("../data/pollution/cities_with_pollution_simple.json"),
]).then(function (files) {
  var us = files[0];
  var pollutionData = files[1];
  var citiesData = files[2];

  var geoJson = topojson.feature(us, us.objects.states);

  var svg = d3.select("#map");

  var tooltip = d3.select("#info").insert("div").attr("class", "toolTip");

  svg
    .selectAll("path")
    .data(geoJson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "lightgray")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  svg
    .selectAll("circle")
    .data(citiesData.filter(function (d) {
      return selectedAqi === 'all' || selectedAqi == d.pollution_data[0].main.aqi;
    }))
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return projection([d.lng, d.lat])[0];
    })
    .attr("cy", function (d) {
      return projection([d.lng, d.lat])[1];
    })
    .attr("r", function (d) {
      return Math.sqrt(d.pollution_data[0].main.aqi) * 10;
    })
    .style("fill", function (d) {

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
      var aqiString = "";
      var color = "white";

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
        .style("left", event.pageX - 10 + "px")
        .style("top", event.pageY - 70 + "px")
        .style("display", "inline-block")
        .style("color", color)
        .html(`City: ${d.city}<br>${aqiString}`);
    })
    .on("mouseout", function (d) {
      if (!d.stickyTooltip) {
        tooltip.html("").style("display", "none");
      }
    })
    .on("click", function (event, d) {
      d.stickyTooltip = !d.stickyTooltip;

      d3.select('#cityDataContainer')
        .style("color", 'white')
        .html(`<h2>City: ${d.city}</h2><br>
           State: ${d.state_name}<br>
           Population: ${d.population}<br>
           Density: ${d.density} people/\u33A1<br>`);

      displayCityHistoricalData(d, pollutionData);
    });

  d3.select('#aqi-filter').dispatch('change');

  d3.select('body').on('click', function (event) {
    if (!event.target.matches('circle')) {
      tooltip.html("").style("display", "none");
      citiesData.forEach(function (city) {
        city.stickyTooltip = false;
      });
    }
  });

  d3.select("#aqi-filter").on("change", function () {
    selectedAqi = d3.select(this).node().value;

    var circles = svg.selectAll("circle").data(citiesData.filter(function (d) {
      return selectedAqi === 'all' || selectedAqi == d.pollution_data[0].main.aqi;
    }));

    circles.exit().remove();

    circles
      .enter()
      .append("circle")
      .merge(circles)
      .attr("cx", function (d) {
        return projection([d.lng, d.lat])[0];
      })
      .attr("cy", function (d) {
        return projection([d.lng, d.lat])[1];
      })
      .attr("r", function (d) {
        return Math.sqrt(d.pollution_data[0].main.aqi) * 10;
      })
      .style("fill", function (d) {

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
      .attr("opacity", "0.6");
  });


});





function displayCityHistoricalData(cityData, pollutionData) {
  var infoContainer = d3.select("#city-info");
  infoContainer.html("");

  var width = 1200;
  var height = 800;
  var margin = { top: 50, right: 50, bottom: 50, left: 50 };



  var highLevels = {
    co: 1000,
    no: 40,
    no2: 200,
    o3: 100,
    so2: 500,
    pm2_5: 50,
    pm10: 80,
    nh3: 50,
  };

  var measurementUnits = {
    co: "mg/m³",
    no: "μg/m³",
    no2: "μg/m³",
    o3: "μg/m³",
    so2: "μg/m³",
    pm2_5: "μg/m³",
    pm10: "μg/m³",
    nh3: "μg/m³",
  };

  var cityPollution = pollutionData.find(function (p) {
    return p.coord.lon === cityData.lng && p.coord.lat === cityData.lat;
  });

  if (cityPollution && cityPollution.list.length > 0) {
    var pollutants = ["co", "no", "no2", "o3", "so2", "pm2_5", "pm10", "nh3"];
    var width = 1200;
    var height = 600;

    pollutants.forEach(function (pollutant) {
      infoContainer
        .append("h3")
        .text("Historical " + pollutant.toUpperCase());

      var svg = infoContainer
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      var dailyAvg = d3.rollups(
        cityPollution.list,
        (v) => d3.mean(v, (d) => d.components[pollutant]),
        (d) => d3.timeDay.floor(new Date(d.dt * 1000))
      );

      var xScale = d3
        .scaleTime()
        .domain(
          d3.extent(dailyAvg, function (d) {
            return d[0];
          })
        )
        .range([50, width - 50]);

      var yScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(dailyAvg, function (d) {
            return d[1];
          }),
        ])
        .range([height - 50, 50]);

      var line = d3
        .line()
        .x(function (d) {
          return xScale(d[0]);
        })
        .y(function (d) {
          return yScale(d[1]);
        });

      svg
        .append("path")
        .datum(dailyAvg)
        .attr("d", line)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("fill", "none");

      var colorScale = d3
        .scaleLinear()
        .domain([0, highLevels[pollutant]])
        .range(["green", "red"])
        .clamp(true);

      var line = d3
        .line()
        .x(function (d) {
          return xScale(d[0]);
        })
        .y(function (d) {
          return yScale(d[1]);
        })
        .curve(d3.curveLinear);

      for (var i = 0; i < dailyAvg.length - 1; i++) {
        var startPoint = dailyAvg[i];
        var endPoint = dailyAvg[i + 1];

        svg
          .append("path")
          .datum([startPoint, endPoint])
          .attr("d", line)
          .attr("stroke", function (d) {
            return colorScale(d[0][1]);
          })
          .attr("stroke-width", 1.5)
          .attr("fill", "none");
      }

      var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%B"));

      svg
        .append("g")
        .attr("transform", "translate(0," + (height - 50) + ")")
        .call(xAxis);

      svg
        .append("g")
        .attr("transform", "translate(" + 50 + ",0)")
        .call(d3.axisLeft(yScale));

      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height - 10) + ")"
        )
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Month");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0 - height / 2)
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(
          pollutant.toUpperCase() + " (" + measurementUnits[pollutant] + ")"
        );

      var hoverLineGroup = svg.append("g")
        .style("pointer-events", "none")
        .attr("opacity", 0);

      var hoverLine = hoverLineGroup.append("line")
        .attr("x1", 50)
        .attr("x2", width - 50)
        .style("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", "0.5px");

      var tooltip = hoverLineGroup.append("text")
        .attr("class", "y-hover-text")
        .attr("text-anchor", "start")
        .attr("dy", "-.71em")
        .attr("transform", "translate(70, 0)")
        .style("fill", "white");


      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("color", "white")
        .style("pointer-events", "all")
        .on("mouseover", function () { hoverLineGroup.style("opacity", 1); })
        .on("mouseout", function () { hoverLineGroup.style("opacity", 0); })
        .on("mousemove", function (event) {
          var y0 = yScale.invert(d3.pointer(event)[1]);
          var format = d3.format(".2f");

          hoverLine.attr("y1", yScale(y0)).attr("y2", yScale(y0));
          tooltip.attr("y", yScale(y0)).text("Y: " + format(y0));
        });



    });
  } else {
    infoContainer
      .append("p")
      .text("No pollution data available for this city.");
  }
}


