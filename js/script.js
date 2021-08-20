document.addEventListener( "DOMContentLoaded", function( event ) {

	var width = window.innerWidth;
	var height = window.innerHeight;
	var svgViewPort = [-width / 2, -height / 2, width, height];
	// var svgViewPort = [0, 0, width, height];
	var activeDepth = 1;
	var nodeRadius = width/30;
	var playBubble = make_sound("sounds/bubble.mp3");
	var isAdmin = false;

	window.simulationResize = function (){};

	d3.json("json/graphdata.json", function(jsonData) {
		//data init
		window.nodes = [];
		var links = [];

		d3.select("#my_data")
		.append("button")
		.attr('class', 'adminButton')
		.text('Admin')
		.on("click", function(event){
			isAdmin = !isAdmin;
			this.classList.toggle('active');
			var activeNode = nodes.filter(d => d.active)[0];
			bubleClick(activeNode);
		});

		makeDataArray(1);

		// console.dir( nodes );
		// console.dir( links );

		// console.log(a);

		var activeRadius = nodeRadius*2;

		//svg init
		const svg = d3.select("#my_data").append("svg")
		.attr("viewBox", svgViewPort);

		const slideForse = d3.forceX( 
			// d => (width/4 + width/2*(d.depth - activeDepth)) - width/2 
			function (d){
				// console.log('width-'+width);
				// console.log((width/4 + width/2*(d.depth - activeDepth)) - width/2);
				return (width/4 + width/2*(d.depth - activeDepth)) - width/2 
			}
			).strength(0.05);
		var manyBodyForce = -width + (1200/width)*50;
		if (manyBodyForce > 0) manyBodyForce = -manyBodyForce;

		window.simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(1))
		.force("charge", d3.forceManyBody().strength( manyBodyForce ))
		// .force("center", d3.forceCenter(0,0))
		.force("slideForse", slideForse)
		.force("y", d3.forceY().strength(0.015));

		var link = svg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(links)
		.enter().append("line")
		.attr("stroke-width", d => d.value);
		

		var node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		.attr("r", nodeRadius)
		.attr("stroke-width", nodeRadius*2)
		.attr("node-id", d => d.id)
		.call(
			d3.drag(simulation)
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
			)
		.on("click", bubleClick);


		node.append("title")
		.text(d => d.id);

		const nodesLabel = svg.append("g")
		.attr("class", "nodesLabel")
		.selectAll("text")
		.data(nodes)
		.enter().append("text")
		.text(function(d, i) { return d.label });

		simulation.on("tick", () => {
			link
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);

			node
			.attr("cx", 
				// d => d.x
				function(d){
					// console.log(d)
					return d.x;
				}
				)
			.attr("cy", d => d.y);

			nodesLabel
			.attr("x", d => d.x)
			.attr("y", d => d.y);
		});


		makeActive(nodes[0]);

		// console.dir( data );

		function bubleClick(d) {
			playBubble();
			makeActive(d);
			activeDepth = d.depth;

			// console.log(links);
			makeDataArray(d.depth);
			// console.log(nodes);
			// console.log(links);

			
			

			link
			.data(links, 
				// d => [d.source, d.target]
				function(d){
					if(typeof d.source === 'object' ){
						return [d.source.id, d.target.id];
					}else{
						return [d.source, d.target];
					}
				}
				)
			.enter().append("line")
			.attr("stroke-width", 
				// d => d.value
				function(d){
					// console.log(this);
					link._groups[0].push(this);
					return d.value ;
				}
				)
			.exit().remove();
			// console.log(link);
			// console.log(links);

			node 
			.data(nodes, d => d.id
				// function(d){
				// 	// console.log(this);
				// 	// console.dir(this);
				// 	// console.dir(arguments);
				// 	return d.id
				// }
				)
			.enter().append("circle")
			.attr("r", nodeRadius)
			.attr("stroke-width", nodeRadius*2)
			.attr("node-id", // d => d.id 
				function(d){
					// console.log(this);
					// console.dir(this);
					node._groups[0].push(this);
					return d.id
				}
				)
			.call(
				d3.drag(simulation)
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
				)
			.on("click", bubleClick)
			.exit().remove();
			
			node
			.selectAll('title')
			.remove();
			node
			.append("title")
			.text(d => d.id);

			nodesLabel
			.data(nodes, d => d.id)
			.enter().append("text")
			.text(function(d, i) {
				nodesLabel._groups[0].push(this);
				return d.label 
			})
			.exit().remove();


			simulation.force("slideForse", slideForse);
			simulation.nodes(nodes);
			simulation.force("link").links(links);
			simulation.alphaTarget(0.8);

			// console.log(activeDepth);
			return;
		}



		function makeDataArray(depth){
			if(depth <= 0) return;
			let nodes = jsonData.nodes;
			var newNodes = [];
			var newLinks = [];
			var maxNodeId = nodes[nodes.length-1].id;

			setDepth(depth+1);
			buildData(depth+1);
			if(!isAdmin){
				newNodes = newNodes.filter(d => d.label != '+');
			}

			//сравнение нод
			window.nodes = newNodes.map( d => Object.assign( window.nodes.find(t => t.id == d.id) || {}, d) );
			links = newLinks.map( d => Object.assign({}, d));


			// console.log(nodes);
			// console.log(newNodes);
			// console.log(newLinks);
			// exit();

			function setDepth(depth){
				let curentDepth = 1;
				let parentIds = [];
				let oldparentIds = [];
				for (;curentDepth <= depth; curentDepth++ ){
					oldparentIds = parentIds;
					parentIds = [];
					for (var i = 0; i < nodes.length; i++){
						let hasId = false;
						for (var j = 0; j < oldparentIds.length; j++) {
							for (var k = 0; k < nodes[i].parent.length; k++) {
								if( nodes[i].parent[k] == oldparentIds[j] ){
									hasId = true;
								}
							}
						}
						if(nodes[i].parent[0] == 0 && curentDepth == 1){
							nodes[i].depth = 1;
							parentIds.push(nodes[i].id);
						}else if( hasId ){
							nodes[i].depth = curentDepth;
							parentIds.push(nodes[i].id);
						}
					}
				}
			}

			function buildData(depth){
				for (var i = 0; i < nodes.length; i++) {
					if( nodes[i].depth && nodes[i].depth <= depth){

						newNodes.push(nodes[i]);
						if(isAdmin){
							maxNodeId += 1;
							newNodes.push(
								{
									"depth": nodes[i].depth+1,
									"id": maxNodeId,
									"label": "+",
									"parent": [nodes[i].id]
								}
							);
							newLinks.push({
								source: maxNodeId,
								target: parseInt(nodes[i].id),
								value: 2
							});
						}

						nodes[i].parent.forEach(function(parent) {
							//core node hasn't links
							if(parent == 0) return;

							newLinks.push({
								source: parent,
								target: parseInt(nodes[i].id),
								value: 2
							});
						});
					
					}
				}
			}
			
		}

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

		function makeActive(d){
			//add property
			nodes.forEach( item => item.active = false );
			d.active = true;
			//add class
			d3.selectAll('.nodes circle').classed('active', false);
			d3.select('.nodes [node-id="'+d.id+'"]').classed('active', true);
			//make all nodes inactive
			d3.selectAll('.nodes circle')
			.transition()
			.duration(250)
			.attr("r", nodeRadius)
			.attr("stroke-width", nodeRadius*2);
			//make selected one active
			d3.select('.nodes [node-id="'+d.id+'"]')
			.transition()
			.duration(250)
			.attr("r", activeRadius)
			.attr("stroke-width", activeRadius*2);
			// console.log(d);
		}

		window.simulationResize = function (){
			// width = window.innerWidth;
			// height = window.innerHeight;

			nodeRadius = width/30;
			activeRadius = nodeRadius*2;
			d3.selectAll('.nodes circle')
			.attr("r", d => d.active ? activeRadius : nodeRadius)
			.attr("stroke-width", d => d.active ? activeRadius*2 : nodeRadius*2);

			simulation
			// .force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(1))
			// .force("charge", d3.forceManyBody().strength( manyBodyForce ))
			.force("slideForse", slideForse)
			// .force("y", d3.forceY().strength(0.015))
			.alphaTarget(0.2);
			// .restart();
		}
		window.simulationResize = throttle(simulationResize, 50);

	});

	//resize
	window.addEventListener('resize', function(event){

		width = window.innerWidth;
		height = window.innerHeight;
		svgViewPort = [-width / 2, -height / 2, width, height];
		d3.select("#my_data svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", svgViewPort);

		simulationResize();
	});

	function make_sound(name){
		var myAudio = new Audio;
		myAudio.src = name; 
		myAudio.volume = 0.1;
		return function(){
			myAudio.play(); 
		}
	}

	// затормозить функцию до одного раза в time мс
	function throttle(func, time) {
		var permision = true;
		var saveArg = null;
		var saveThis = null;
		return function waper(){
			if (permision){
				func.apply(this, arguments);
				permision = false;
				setTimeout(function(){
					permision = true;
					if(saveThis){
						waper.apply(saveThis, saveArg);
						saveArg = saveThis = null;
					}
				}, time);
			}else{
				saveArg = arguments;
				saveThis = this;
			}
		}
	}

});