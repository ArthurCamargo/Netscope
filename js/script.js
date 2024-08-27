// Assuming you have a dataset loaded as JSON
d3.json('data/data.json').then(data => {
    // Size of the SVG canvas
    const width = 600;
    const height = 600;

    // Create an SVG element
    const svg = d3.select("#hilbert-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define the Hilbert curve function (simplified)
    function hilbertCurve(n, level) {
        let positions = [];
        let size = Math.pow(2, level);

        function hilbert(x, y, xi, xj, yi, yj, n) {
            if (n <= 0) {
                let px = (x + (xi + yi) / 2) * width / size;
                let py = (y + (xj + yj) / 2) * height / size;
                positions.push({ x: px, y: py });
            } else {
                hilbert(x, y, yi / 2, yj / 2, xi / 2, xj / 2, n - 1);
                hilbert(x + xi / 2, y + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
                hilbert(x + xi / 2 + yi / 2, y + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
                hilbert(x + xi / 2 + yi, y + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, n - 1);
            }
        }

        hilbert(0, 0, width, 0, 0, height, level);

        return positions;
    }

    const hilbertData = hilbertCurve(1, 16);

    // Bind the data to circles
    svg.selectAll("rect")
        .data(hilbertData)
        .enter()
        .append("rect")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("height", 1)
        .attr("width", 1)
        .style("fill", "red");

    // Add interactivity or other visualizations (time trends, protocol distribution, etc.)
});

