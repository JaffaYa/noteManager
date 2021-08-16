document.addEventListener( "DOMContentLoaded", function( event ) {

	var width = window.innerWidth;
	var height = window.innerHeight;

	d3.json("json/graphdata.json", function(fileData) {
		//data init
		var nodes = [];
		var links = [];
		fileData.nodes.forEach(function(currentValue, index, array) {
			nodes.push(currentValue);
			if( Array.isArray(currentValue.parent) && currentValue.parent.length > 0 ){
				currentValue.parent.forEach(function(parent) {
					links.push({
						source: parent,
						target: parseInt(currentValue.id),
						value: 2
					});
				});
			}
		});

		// console.dir( nodes );
		// console.dir( links );

		//svg init
		const svg = d3.select("#my_data").append("svg")
		.attr("viewBox", [-width / 2, -height / 2, width, height]);

		const simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id).strength(0.015))
		.force("charge", d3.forceManyBody().strength(-1500))
		.force("x", d3.forceX())
		.force("y", d3.forceY());

		const link = svg.append("g")
		.attr("class", "links")
		.attr("stroke", "#999")
		.attr("stroke-opacity", 0.6)
		.selectAll("line")
		.data(links)
		.enter().append("line")
		.attr("stroke-width", d => Math.sqrt(d.value));

		const node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		.attr("stroke", "#fff")
		.attr("stroke-width", 20)
		.attr("stroke-opacity", 0.5)
		.attr("r", 50)
		.attr("fill", "#fff")
		.call(
			d3.drag(simulation)
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
		);

		node.append("title")
		.text(d => d.id);

		const nodesLabel = svg.append("g")
		.attr("class", "nodesLabel")
		.selectAll("text")
		.data(nodes)
		.enter().append("text")
		.text(function(d, i) { return d.label })
		.style("fill", "#555")
		.style("font-family", "Arial")
		.style("font-size", 12)
		.style("pointer-events", "none");

		simulation.on("tick", () => {
			link
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

			node
			.attr("cx", d => d.x)
			.attr("cy", d => d.y);

			nodesLabel
			.attr("x", d => d.x)
			.attr("y", d => d.y);
		});

		// console.dir( data );

		function dragstarted(d) {
			if (!d3.event.active) simulation.alphaTarget(0.8).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}

		function dragended(d) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
	});

	//resize
	window.addEventListener('resize', function(event){
		width = window.innerWidth;
		height = window.innerHeight;
		d3.select("#my_data svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [-width / 2, -height / 2, width, height]);
	});

});