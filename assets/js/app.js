var svgWidth = 1000;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// Function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // Create X scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.0
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
    // Create Y scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.0
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// Function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
// Function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// Function used for updating circles group with a transition to
// New circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1500)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]))
    return circlesGroup;
  }


// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
    var ylabel;
  
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty:";
      }
      else if ( chosenXAxis === "age") {
        xlabel = "Age:";
      }
      else {
        xlabel = "Income:";
      }

    if (chosenYAxis === "obesity") {
        ylabel = "Obesity:";
      }
      else if ( chosenYAxis === "healthcare") {
        ylabel = "Lacks Healthcare:";
      }
      else {
        ylabel = "Smokes:";
      }
    // ToolTip text
    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

    circlesGroup.call(toolTip);

    // On mouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this)
      .attr("stroke", "black")
      d3.select(this).style("stroke", "black");
    })

    // On mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data)
      d3.select(this).style("stroke", "#e3e3e3");
    });

  return circlesGroup;
}

// Function for updating state abbr labels
function renderText(abbrText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  abbrText.transition()
    .duration(1500)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return abbrText
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
  
    // Parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    //console.log(censusData)

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
    
    // yLinearScale function above csv import
    var yLinearScale = yScale(censusData, chosenYAxis);
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
    .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "#89bdd3")
    .attr("opacity", ".75")
    .attr("stroke", "#e3e3e3")
    

    // Append initial text
    var abbrText = chartGroup.selectAll(".stateText")
      .data(censusData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("dy", 3)
      .attr("font-size", "10px")
      .text(function(d){return d.abbr});
    
    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");


    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)", `translate(${0 - margin.left}, ${height / 2})`)
    .attr("dy", "1em");

    var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2)) 
    .attr("y", 20 - margin.left)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 40 - margin.left)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 60 - margin.left)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

    // UpdateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {

        // Get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

        // Replaces chosenXAxis with value
        chosenXAxis = value;
        // console.log(chosenXAxis)

        // Functions here found above csv import
        // Updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

      // Updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // Updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

      // Updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // Updates text with new x values
      abbrText = renderText(abbrText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // Changes classes to change bold text
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }

      else if (chosenXAxis === "poverty") {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }

      else {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      };

  }});

    // Y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
  
    // Get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

    // Replaces chosenYAxis with value
    chosenYAxis = value;

    // console.log(chosenYAxis)

    // Functions here found above csv import
    // Updates y scale for new data
    yLinearScale = yScale(censusData, chosenYAxis);

    // Updates y axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);

    // Updates circles with new y values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    // Updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Updates text with new y values
    abbrText = renderText(abbrText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    // Changes classes to change bold text
    if (chosenYAxis === "obesity") {
      obesityLabel
        .classed("active", true)
        .classed("inactive", false);
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
    }

    else if (chosenYAxis === "healthcare") {
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      healthcareLabel
        .classed("active", true)
        .classed("inactive", false);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
    }  
      
    else {
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", true)
        .classed("inactive", false);
    };


  }});  
}).catch(function(error) {
console.log(error);

});

