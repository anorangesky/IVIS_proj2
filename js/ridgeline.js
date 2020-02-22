// set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 20, left:110},
    width = 460 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

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

  //get the different org and count them
  var orgs = d3.map(myData, function(d){return(d.Organization)}).keys()
  var m = orgs.length

  // Add X axis
  var x = d3.scaleLinear()
    .domain([1, 4])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).scale(x).ticks(4));

  // Create a Y scale for densities
  var y = d3.scaleLinear()
    .domain([0, 0.4])
    .range([ height, 0]);

  // Create the Y axis for names
  var yName = d3.scaleBand()
    .domain(countries)
    .range([0, height])
    .paddingInner(1)
  svg.append("g")
    .call(d3.axisLeft(yName));

  //Function that change year
  function changeYear(){
    var yearSelected = $("input[name='yearButton']:active");
    console.log(yearSelected)
    //TODO: make this code change the visible data:
    //svg
    //.d3.map(myData, function(d){return(d.Wave)}).keys() 
  }
  //Event listener to the Year-buttons
  d3.select("#yearButton").on("change", changeYear)

  // Add organisations to select-button
  d3.select("#selectOrg")
    .selectAll('myOptions')
    .data(orgs)
    .enter()
    .append('option')
    .text(function(d){return d;}) //show text in menu
    .attr("value", function(d){return d;}) //value returned by the button

    //function to update the ridgeline chart when selection of org
    function updateChart(selectedOrg){
      kde = kernelDensityEstimator(kernelEpanechnikov(3), x.ticks(40))
      var density = kde(myData.filter(function(d){return d.Organization == selectedOrg})
      .map(function(d){return +d.Value;})
      )

      //TODO: here should the code for updating the new curve/chart go
    }


    //Eventlistener for the org select button
    d3.select("#selectOrg").on("change", function(d){
      selectedOrg = this.value
      updateChart(selectedOrg)
    })

  // Compute kernel density estimation for each column:
  var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
  var allDensity = []
  for (i = 0; i < n; i++) {
      key = countries[i]
      density = kde( myData.map(function(d){  return d[key]; }) )
      allDensity.push({key: key, density: density})
  }

  // Add areas
  svg.selectAll("areas")
    .data(allDensity)
    .enter()
    .append("path")
      .attr("transform", function(d){return("translate(0," + (yName(d.key)-height) +")" )})
      .datum(function(d){return(d.density)})
      .attr("fill", "#69b3a2")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      )

})

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