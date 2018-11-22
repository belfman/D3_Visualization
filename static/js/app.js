// set dimensions of SVG (Scalable Vector Grpah) 
var svgWidth = 960;
var svgHeight = 500;

// create margin values
var margin = {
 top: 20,
 right: 40,
 bottom: 100,
 left: 100
};

// set width and height variables using the margin values
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create an SVG wrapper, append an SVG group that will hold our chart
var svg = d3
 .select(".chart")
 .append("svg")
 .attr("width", svgWidth)
 .attr("height", svgHeight)
 .append("g")
 .attr("transform", `translate(${margin.left}, ${margin.top})`);

// append a group to the svg
var chart = svg
  .append("g");

// set Initial Axis to display
var chosenXAxis = "age";

// function used for updating x-scale
function xScale(stateData, chosenXAxis) {
  var xLinearScale = d3
  .scaleLinear()
  .domain([d3.min(stateData, d => d[chosenXAxis]) * .9,
           d3.max(stateData, d => d[chosenXAxis]) * 1.1])
  .range([0, width]);
  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

// function used for updating state ABBR group with a transition
function renderText(textGroup, newXScale, chosenXaxis) {
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
  return textGroup;
}

// function used for updating circles with tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  if (chosenXAxis === "age") {
    var label = "Median Age: ";
    var label2 = "Poverty: ";
  }
  else if (chosenXAxis === "obesity") {
    var label = "% Obese: ";
    var label2 = "Poverty: ";
  }
  else {
    var label = "Income: $";
    var label2 = "Poverty: ";
  }

  // set up display of tool tip popup
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([95, 0])
    .html(function(d) {
      return (`<b>${d.state}</b><br>
              ${label}${d[chosenXAxis]}<br>
              % ${label2}${d.poverty}`);
    });

  // call tool tip on circlesGroup
  circlesGroup.call(toolTip);

  // have tooltip show up during mouseover event
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })

  // hide tooltip on mouseout event
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

  return circlesGroup;
}

// Import Data
d3.csv("stateData.csv", function(err, stateData) {
if (err) throw err;

  // parse data and convert strings to ints with the +
  stateData.forEach(function(data) {
    data.age = +data.age;
    data.poverty = +data.poverty;
    data.income = +data.income;
    data.obesity = +data.obesity;
  });


  // apply scaling to data on the x axis
  var xLinearScale = xScale(stateData, chosenXAxis);

  // function used to create y-axis scale
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(stateData, d => d.poverty)])
  .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // add an x axis to the graph
  var xAxis = chart
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // add a y axis to the graph
  chart.append("g")
    .call(leftAxis);

  // create circles
  circlesGroup = chart
    .selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.poverty))
    .attr("r", 15)
    .attr("fill", "white")
    .attr("opacity", ".8")
    .attr("stroke-opacity", "0.9")
    .attr("stroke-width", 3)
    .attr("stroke", "darkblue");

  // create state ABBR
  textGroup = svg.selectAll("state-text")
    .attr("classed", "state-text")
    .data(stateData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.poverty))
    .attr("text-anchor", "middle")
    .style("font-size", "12px");

  // Create group for 2nd x-axis labels
  var labelsGroup = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
  // Create obesity x axis label
  var obesityLabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("% Obesity");

  // Create age x axis label
  var ageLabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Median Age in Years");

  // Create income x axis label
  var incomeLabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Median State Income in $");

  // Create y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 30 - margin.left)
    .attr("x", 20 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("% of People Who Live in Poverty");

    // set the info in the tooltip to correspond to chosen Axis
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis when new x scale is chosen
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles when axis is chosen
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis);


        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "obesity") {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
  });
});