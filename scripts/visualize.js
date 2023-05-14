d3.json("../data/pollution/cities_with_pollution.json").then(function(data) {
    console.log(data);
}).catch(function(error){
    console.log(error);
});