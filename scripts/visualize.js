// var cities_data;
// var pollution_data;

// fetch("../data/maps/us-cities.json")
//     .then(response => response.json())
//     .then(data => {
//         cities_data = data;
//         console.log(cities_data);
//     })
//     .catch(error => {
//         console.error('Error fetching the resource:', error);
//     });

// fetch("../data/pollution/pollution_data.json")
//     .then(response => response.json())
//     .then(data => {
//         pollution_data = data;
//         console.log(pollution_data);

//         // Convert the dt field from unix time to JS Date object
//         pollution_data.forEach(function (d) {
//             d.dt = new Date(d.dt * 1000);
//         });

//         var svg = d3.select("svg"),
//             margin = { top: 20, right: 20, bottom: 30, left: 50 },
//             width = +svg.attr("width") - margin.left - margin.right,
//             height = +svg.attr("height") - margin.top - margin.bottom,
//             g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//         // Set the ranges
//         var x = d3.scaleTime().rangeRound([0, width]);
//         var y = d3.scaleLinear().rangeRound([height, 0]);

//         // Define the line
//         var line = d3.line()
//             .x(function (d) { return x(d.dt); })
//             .y(function (d) { return y(d.components.pm10); });

//         // Set the domain of the axes
//         x.domain(d3.extent(pollution_data, function (d) { return d.dt; }));
//         y.domain(d3.extent(pollution_data, function (d) { return d.components.pm10; }));

//         // Add the X Axis
//         g.append("g")
//             .attr("transform", "translate(0," + height + ")")
//             .call(d3.axisBottom(x));

//         // Add the Y Axis
//         g.append("g")
//             .call(d3.axisLeft(y));

//         // Add the line path.
//         g.append("path")
//             .datum(pollution_data)
//             .attr("fill", "none")
//             .attr("stroke", "steelblue")
//             .attr("stroke-linejoin", "round")
//             .attr("stroke-linecap", "round")
//             .attr("stroke-width", 1.5)
//             .attr("d", line);


//     })
//     .catch(error => {
//         console.error('Error fetching the resource:', error);
//     });


// // const width = 1000;
// // const height = 800;

// // const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1200);

// // const path = d3.geoPath().projection(projection);

var cities_data;
var pollution_data;

fetch("../data/maps/us-cities.json")
    .then(response => response.json())
    .then(data => {
        cities_data = data;
        console.log(cities_data);
    })
    .catch(error => {
        console.error('Error fetching the resource:', error);
    });

fetch("../data/pollution/pollution_data.json")
    .then(response => response.json())
    .then(data => {
        // Flatten the pollution_data array
        pollution_data = data.flatMap(d => d.list);

        console.log(pollution_data);
        
        // Convert the dt field from unix time to JS Date object
        pollution_data.forEach(function (d) {
            d.dt = new Date(d.dt * 1000);
        });

        var svg = d3.select("svg"),
            margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set the ranges
        var x = d3.scaleTime().rangeRound([0, width]);
        var y = d3.scaleLinear().rangeRound([height, 0]);

        // Define the line
        var line = d3.line()
            .x(function (d) { return x(d.dt); })
            .y(function (d) { return y(d.components.pm10); });

        // Set the domain of the axes
        x.domain(d3.extent(pollution_data, function (d) { return d.dt; }));
        y.domain(d3.extent(pollution_data, function (d) { return d.components.pm10; }));

        // Add the X Axis
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        g.append("g")
            .call(d3.axisLeft(y));

        // Add the line path.
        g.append("path")
            .datum(pollution_data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);


    })
    .catch(error => {
        console.error('Error fetching the resource:', error);
    });