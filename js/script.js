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
  // 'third_octet' and 'fourth_octet'

  // Convert data to numerical values
  data.forEach(d => {
                d.packet_total = +d.packet_total;
                d.volume_total = +d.volume_total;
              });

  const ThirdOctect = Array.from(new Set(data.map(d => d.third_octet)))
  const FourthOctect = Array.from(new Set(data.map(d => d.fourth_octet)))

  // Build X scales and axis:
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(ThirdOctect)
    .paddingInner(0.1);
  svg.append("g")
    .style("font-size", "10px")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()


  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(FourthOctect)
    .paddingInner(0.1);
  svg.append("g")
    .style("font-size", "14px")
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  const myColor = d3.scaleSequential()
    .interpolator(d3.interpolateViridis)
  .domain([1.7e+07,2.e+07])

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
      .html("<strong>" + d.dst + "</strong><br>" +
            "packets: " + d.packet_total + "<br>" +
            "volume (bytes): " + d.volume_total)
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

  // Function to calculate the IQR (or a similar range focusing on common values)
  function calculateIQR(data, column, low_quantile, high_quantile) {
      const values = data.map(d => d[column]).sort(d3.ascending);
      const q1 = d3.quantile(values, low_quantile);
      const q3 = d3.quantile(values, high_quantile);
      return [q1, q3];
  }

  // add the squares
  function drawHeatmap(data, column) {
    const [low, high] = calculateIQR(data, column, 0.10, 0.90)

    myColor.domain([low, high]);

    const squares = svg.selectAll()
      .data(data, d => d.third_octet + ":" + d.fourth_octet);

    squares.enter()
      .append("rect")
      .merge(squares)
        .attr("x", function(d) { return x(d.third_octet) })
        .attr("y", function(d) { return y(d.fourth_octet) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d[column])})
        .style("stroke-width", 0)
        .style("stroke", "none")
        .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

    squares.exit().remove();
  }

  // Function to update the heatmap colors based on the selected column
  function updateHeatmapColors(data, column) {
    const [low, high] = calculateIQR(data, column); // Calculate the IQR for the column
    myColor.domain([low, high]); // Use the IQR as the domain for the color scale

    svg.selectAll("rect")
       .data(data, d => d.third_octet + ':' + d.fourth_octet)
       .attr("fill", d => myColor(d[column]));
  }

  drawHeatmap(data, 'packet_total');

  // Event listener for the radio buttons
  d3.selectAll("input[name='data']").on("change", function() {
      const selectedColumn = this.value;
      updateHeatmapColors(data, selectedColumn);
  });
})
