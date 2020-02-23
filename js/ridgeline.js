// set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 20, left:110},
    width = 550 - margin.left - margin.right,
    height = 400- margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#ridgeline")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

/*
  Read data
    Mocked data from https://www.generatedata.com/#t1 
    A total of 1000 rows. 
    200 rows from each wave.

    - "Wave" in years where "2": 90-94; "3": 95-98; "4": 99-04; "5": 05-09; "6": 10-14
    - "Country" takes a random country 
    - "Organization" takes a random organization out of 8 possible 
    - "Value" is how much confidence in the organisation. "1": Great deal; "2": Quite a lot; "3": not very much; "4": not at all
*/
d3.csv("https://raw.githubusercontent.com/anorangesky/IVIS_proj2/master/js/myData.csv", 
        function(myData) {

  // Get the different countries and count them
  var countries = d3.map(myData, function(d){return(d.Country)}).keys()
  var n = countries.length

  //get the 8 different orgs
  var orgs = d3.map(myData, function(d){return(d.Organization)}).keys()

  //get the 5 year waves
  var yearWaves = d3.map(myData, function(d) {return (d.Wave)}).keys()

  // Levels of confidence
  var confLevel = ["Great deal", "Quite a lot", "Not very much", "Not at all"]

  // Add X axis
  var x = d3.scaleLinear()
    .domain([1, 4])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).scale(x)
      .tickFormat(function(d) {return confLevel[d-1]}));

  // Create a Y scale for dencities
  var y = d3.scaleLinear()
    .domain([0, 0.38])
    .range([height+120, 120]);

  // Create the Y axis for names
  var yName = d3.scaleBand()
    .domain(countries)
    .range([0, height])
    .paddingInner(1)
  svg.append("g")
    .call(d3.axisLeft(yName));

  //save all countries density in this array and init it with some values
  var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
  var allDensity = [] 

  for (i = 0; i < n; i++) {
    key = countries[i]
    density = kde( myData
      //.filter(function(d){return d.Organization == "Environmental org."})
      //.filter(function(d){return d.Wave = "2"})
      .map(function(d){return d[key]})
      //.map(function(d){return +d.Value}) 
      ) 
    allDensity.push({key: key, density: density})
  } 
  
  // Create a color scale for allDensitiies.
   var myColor = d3.scaleSequential()
   .domain([0,100])
   .interpolator(d3.interpolateViridis);

  // Add organisations to select-button
  d3.select("#selectOrg")
    .selectAll('myOptions')
    .data(orgs)
    .enter()
    .append('option')
    .text(function(d){return d;}) //show text in menu
    .attr("value", function(d){return d;}) //value returned by the button

/*
  var kde = kernelDensityEstimator(kernelEpanechnikov(4), x.ticks(40)) // increase this 40 for more accurate density.
  // Compute kernel density estimation for the first organization called "Environmental org. and the year-wave 6 (aka (10-14)":
  var allDensity = []
  for (i = 0; i < n; i++) {
      key = countries[i]
      updateRidgeline("6", "Environmental org.")
      
      density = kde( myData
        .filter(function(d){return (d.Organization == )})
        .filter(function(d))
        .map(function(d){  return d[key]})
        .map(function(d){return +d.Value}) 
        ) 
      allDensity.push({key: key, density: density})
  }
*/
  // Add areas
  var curve = svg
    .selectAll("areas")
    .data(allDensity)
    .enter()
    .append("path")
      .attr("transform", function(d){return("translate(0," + (yName(d.key)-height) +")" )})
      .datum(function(d){return(d.density)})
      .transition()
      .duration(1000)
      .attr("fill", function(d){
        grp = d.key;
        index = countries.indexOf(group)
        value = allDensity[index]
        return myColor(value)
      })
      .attr("opacity", 0.7)
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      )

//function to update the ridgeline chart when changing year or org 
function updateRidgeline(selectedYear, selectedOrg){
  //update density for each country 
  for(i = 0; i < n; i++){
    key = countries[i]
    density = kde(myData
      .filter(function(d){return d.Wave == selectedYear})
      .filter(function(d){return d.Organization == selectedOrg})
      .map(function(d){return +d.Value;})
      .map(function(d){return d[key]})
    )
    allDensity.push({key: key, density: density})
  }
  //update the chart
  curve.selectAll("areas")
    .data(allDensity)
    .enter()
    .append("path")
    .attr("transform", function(d){return("translate(0," + (yName(d.key)-height) +")" )})
    .datum(function(d){return(d.density)})
    .transition()
    .duration(1000)
    .attr("fill", function(d){
      grp = d.key;
      index = countries.indexOf(group)
      value = allDensity[index]
      return myColor(value)
    })
    //.attr("fill", "#69b3a2")
    .attr("opacity", 0.7)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(function(d){return x(d[0]);})
      .y(function(d){return y(d[1]);})
      )
    ;
  }
    //listen to the org-slider:
    d3.select("#selectOrg").on("change", function(d){
      selectedOrg = this.value
      selectedYear = d3.select("#mySlider").value;
      updateRidgeline(selectedYear, selectedOrg)    })

    //listen to the year-slider
    d3.select("#mySlider").on("change", function(d){
      selectedYear = this.value
      selectedOrg = d3.select("#selectOrg").value; 
      updateRidgeline(selectedYear, selectedOrg)
    })

    //Listen to the Year-buttons (same functionality as the slider)
    d3.select("#yearButton").on("change", function(d){
      cy = this.value
      selectedOrg = d3.select("#selectOrg").value; 
      updateRidgeline(selectedYear, selectedOrg)
    })
});

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}