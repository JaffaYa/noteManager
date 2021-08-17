document.addEventListener( "DOMContentLoaded", function( event ) {

	var width = window.innerWidth;
	var height = window.innerHeight;
	var svgViewPort = [-width / 2, -height / 2, width, height];
	// var svgViewPort = [0, 0, width, height];
	var activeDepth = 1;

	d3.json("json/graphdata.json", function(fileData) {
		//data init
		window.nodes = [];
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

		
		// console.log( (width/4 + width/2*(d.depth-1)) - width/2 );
		

		//svg init
		const svg = d3.select("#my_data").append("svg")
		.attr("viewBox", svgViewPort);

		const slideForse = d3.forceX( d => (width/4 + width/2*(d.depth - activeDepth)) - width/2 ).strength(0.05);

		const simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(200))
		.force("charge", d3.forceManyBody().strength(-500))
		// .force("x", d3.forceX())//strength(0,1)
		// .force("y", d3.forceY());
		// .force("center", d3.forceCenter(width / 2, height / 2))
		// .force("center", d3.forceCenter(0,0))
		// .force("center", d3.forceCenter(0,0).strength(0.05));
		.force("slideForse", slideForse)
		.force("y", d3.forceY().strength(0.015))
		// .force("x", d3.forceX(d => (width/4 + width/2*(d.depth-1)) - width/2 ).strength(0.005));
		// simulation.force("x", d3.data(simulation.nodes()).forceX(d => (width/4 + width/2*(d.depth-1)) - width/2 ).strength(0.005));

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
		)
		.on("click", function(d) {
			activeDepth = d.depth;
			simulation
			.force("slideForse", slideForse)
			.alphaTarget(0.2);
			// console.log(activeDepth);
			return;
		});

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
		.attr("viewBox", svgViewPort);
	});

});