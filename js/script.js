// set the dimensions and margins of the graph
const margin = {top: 80, right: 25, bottom: 30, left: 40},
  width =  500 - margin.left - margin.right,
  height = 4000 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data
d3.csv("../data/hilbert/csvs/ip_dst_processed.csv").then(function(data) {

  // Labels of row and columns -> unique identifier of the column called 
  // 'third_octect' and 'fourth_octect'

  const ThirdOctect = Array.from(new Set(data.map(d => d.third_octet)))
  const FourthOctect = Array.from(new Set(data.map(d => d.fourth_octet)))

  // Build X scales and axis:
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(ThirdOctect)
    .paddingInner(0.1);
  svg.append("g")
    .style("font-size", 15)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()


  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(FourthOctect)
    .paddingInner(0.1);
  svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  const myColor = d3.scaleSequential()
    .interpolator(d3.interpolateViridis)
    .domain([1.744257e+07,2.e+07])

  // create a tooltip
  const tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function(event,d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  const mousemove = function(event,d) {
    tooltip
      .html("<h4>IPv4: </h4>" + d.dst + "<br>" +
            "packet total: " + d.packet_total + "<br>" +
            "volume total: " + d.volume_total)
      .style("left", (event.x)/2 + "px")
      .style("top", (event.y)/2 + "px")
      .style("position", "fixed")
  }
  const mouseleave = function(event,d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // add the squares
  svg.selectAll()
    .data(data)
    .join("rect")
      .attr("x", function(d) { return x(d.third_octet) })
      .attr("y", function(d) { return y(d.fourth_octet) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.volume_total)} )
      .style("stroke-width", 0)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})

// Add title to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Network telescope requets");

// Add subtitle to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("The number of requets that was received in the date from 2023-12-14 to 2024-01-14");
