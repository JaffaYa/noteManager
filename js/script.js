document.addEventListener( "DOMContentLoaded", function( event ) {

	var playBubble = make_sound("sounds/bubble.mp3");
	var isAdmin = document.location.search == '?admin';
	var bodyFullScreanTogle = make_FullScrinTogle(document.querySelector('body'));


	//graphics var
	var width = window.innerWidth;
	var height = window.innerHeight;
	var verticalScreen = height/width > width/height ? true : false;
	var svgViewPort = [-width / 2, -height / 2, width, height];
	var activeDepth = 1;
	var nodeRadius = width/48;
	var activeRadius = nodeRadius*2;
	var animationTime = 250;//ms


	window.simulationResize = function (){};

	//data init
	window.nodes = [];
	var links = [];
	var jsonData = null;
	var activePath = [];

	//svg init
	const svg = d3.select("#my_data").append("svg")
	.attr("viewBox", svgViewPort);

	var svgLinks = false;
	var svgNodes = false;
	var svgNodeLables = false;

	var scrollNext = true;
	const slideForse = function (d){
		if(!d.functional){
			if(scrollNext){
				return (width/4 + width/2*(d.depth - activeDepth)) - width/2;
			}else{
				return (width/4 + width/2*(d.depth - activeDepth+1)) - width/2;
			}
		}else{
			if(d.fullscreen){
				if(scrollNext){
					return (width/2 + width/2*(d.depth - activeDepth)) - width/2;
				}else{
					return (width/2 + width/2*(d.depth - activeDepth)) - width/2;
				}
			}
		}
	}

	var manyBodyForce = -width + (1200/width)*50;
	// var manyBodyForce = -1200;
	if (manyBodyForce > 0) manyBodyForce = -manyBodyForce;


	d3.json("json/graphdata.json", function readDataFormFileFirstTime(jsonDataFromFile) {
		jsonData = jsonDataFromFile;

		//init first data
		makeDataArray(1);
		makeNodeActive(nodes[0]);

		window.simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(1))
		.force("charge", d3.forceManyBody().strength( manyBodyForce ))
		// .force("center", d3.forceCenter(0,0))
		.force("slideForse", d3.forceX(slideForse).strength(0.1))
		.force("y", d3.forceY().strength(d => d.functional ? 0.03 : 0.03))
		.force("fullscreenButton", d3.forceY(height/2 - getNodeRadius()*2).strength(d => d.functional ? 0.1 : 0))
		.alphaTarget(0.5);

		if(verticalScreen){
			window.simulation
			.force("mobileVertical", d3.forceY(
				function(d){
					if(scrollNext){
						return (height/18 + (height*4/5)*(d.depth - activeDepth)) - height/2;
					}else{
						return (height/18 + (height*4/5)*(d.depth - activeDepth+1)) - height/2;
					}
				}
				).strength(
					// d => d.functional ? 0.00 : 0.1
					function(d){
						if(d.functional){
							return 0;
						}else if(d.activePath == 'child'){
							console.dir(d.activePath);
							console.dir(d.id);
							return  d.id/90;
						}else{
							return 0.1;
						}
					}
				)
			)
		}

		buildLinks(links);
		buildNodes(nodes);
		buildNodeTitles(svgNodes);
		buildNodeLables(nodes);

		simulation.on("tick", simulationTick);
	});


	//admin button
	// d3.select("body")
	// .append("button")
	// .attr('class', 'adminButton')
	// .text('Admin')
	// .on("click", function(event){
	// 	isAdmin = !isAdmin;
	// 	this.classList.toggle('active');
	// 	var activeNode = nodes.filter(d => d.active)[0];
	// 	bubleClick(activeNode);
	// });




	function bubleClick(d) {
		playBubble();
		if(d.fullscreen){
			bodyFullScreanTogle();
			return
		}

		makeNodeActive(d);

		var dataObj = makeDataArray(d.depth, d);
		var isAddNewNode;

		//apply click function

		//draw
		activeDepth = d.depth;
		
		buildLinks(links);
		buildNodes(nodes);
		buildNodeTitles(svgNodes);
		buildNodeLables(nodes);

		simulation.nodes(nodes);
		simulation.force("link").links(links);
		simulation.alphaTarget(0.8).restart();

		return;
	}

	function simulationTick(){
		svgLinks
		.attr("x1", d => d.source.x)
		.attr("y1", d => d.source.y)
		.attr("x2", d => d.target.x)
		.attr("y2", d => d.target.y);

		svgNodes
		.attr("cx", 
			// d => d.x
			function(d){
				// console.log(d)
				return d.x;
			}
			)
		.attr("cy", d => d.y);

		svgNodeLables
		.attr("x", d => {
			// console.log(d);
			svgNodeLables.selectAll('.c'+d.id+' tspan')
			.attr("x", d.x-getNodeRadius()+10)
			.attr("y", d.y+getNodeRadius()-10)
			return d.x;
		})
		.attr("y", d => d.y);

		// svgNodeLables
		// .selectAll("tspan")
		// .attr("x", d => {
		// 	// return d.x;
		// })
	}

	function buildNodes(nodes){
		if(!svgNodes){
			svgNodes = svg.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(nodes);

			svgNodes = svgNodes.enter().append("circle")
			.classed('active', d => d.active)
			.classed('fade', d => d.activePath == 'fade')
			.attr("node-id", d => d.id)
			.call(
				d3.drag(simulation)
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
				)
			.on("click", bubleClick);

			setNodeStyle();

		}else{
			var tempNode = svgNodes 
			.data(nodes, d => d.id);

			tempNode
			.classed('active', d => d.active)
			.classed('fade', d => d.activePath == 'fade');

			tempNode.enter().append("circle")
			// .attr("r", nodeRadius)
			// .attr("stroke-width", nodeRadius*(5/3))
			.attr("node-id", // d => d.id 
				function(d){
					//add nodes
					svgNodes._groups[0].push(this);
					return d.id
				}
				)
			.call(
				d3.drag(simulation)
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
				)
			.on("click", bubleClick);

			tempNode.exit()
			.attr('node-id',function(d, i){
					//remove nodes
					delete svgNodes._groups[0][i];
					return 1;
				})
			.remove();

			setNodeStyle();
		}
	}

	function buildLinks(links){
		if(!svgLinks){
			svgLinks = svg.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(links)
			.enter().append("line")
			.attr("stroke-width", d => d.value)
			.attr("stroke-dasharray", setDashedLineStyle);
		}else{
			var tempLink = svgLinks
			.data(links, 
				function(d){
					if(typeof d.source === 'object' ){
						return [d.source.id, d.target.id];
					}else{
						return [d.source, d.target];
					}
				}
				);

			tempLink.enter().append("line")
			.attr("stroke-width", 
				// d => d.value
				function(d){
					//add links
					svgLinks._groups[0].push(this);
					return d.value ;
				}
				)
			.attr("stroke-dasharray", setDashedLineStyle);

			tempLink.exit()
			.attr('node-id',function(d, i){
					//remove links
					delete svgLinks._groups[0][i];
					return 1;
				})
			.remove();
		}
	}

	function buildNodeTitles(svgNodes){
		svgNodes
		.selectAll('title')
		.remove();
		svgNodes
		.append("title")
		.text(d => d.id);
	}

	function buildNodeLables(nodes){
		if(!svgNodeLables){
			svgNodeLables = svg.append("g")
			.attr("class", "nodesLabel")
			.selectAll("text")
			.data(nodes)
			.enter().append("text")
			.attr('class', d => 'c'+d.id)
			.classed('active', d => d.active)
			.html(formatNodeLablesText)

			// console.dir(svgNodeLables);
			// svgNodeLables
			// .append("tspan")
			// .text(formatNodeLablesText);
			// svgNodeLables = svg.append("g")
			// .attr("class", "nodesLabel")
			// .selectAll("foreignObject")
			// .data(nodes)
			// .enter().append("foreignObject")
			// .attr('width', 320)
			// .attr('height', 240)
			// .classed('active', d => d.active);
			// svgNodeLables
			// .append("body")
			// .attr('xmlns', "http://www.w3.org/1999/xhtml")
			// .append("div")
			// .html(function(d, i) { return d.label });

		}else{
			var tempNodeLables = svgNodeLables
			.data(nodes, d => d.id);

			tempNodeLables
			.attr('class', d => 'c'+d.id)
			.classed('active', d => d.active);

			tempNodeLables.enter().append("text")
			.attr('class', d => 'c'+d.id)
			.html(function(d, i) {
				//add lables
				svgNodeLables._groups[0].push(this);
				//временно подставил сюда функцию formatNodeLablesText
				var textArr = d.label.split("\n"); 
				var result = '';
				if(textArr.length > 1){
					textArr.forEach((element, i) => {
						if(i == 0){
							result += '<tspan>';
						}else{
							result += '<tspan dy="'+i+'em">';
						}
						result += element;
						result += '</tspan>';
					}
					);
				}else{
					result += '<tspan>';
					result += d.label;
					result += '</tspan>';
				}
				return result; 
			});

			tempNodeLables.exit()
			.attr('node-id',function(d, i){
					//remove lables
					delete svgNodeLables._groups[0][i];
					return 1;
				})
			.remove();
		}
	}

	function formatNodeLablesText(d, i) { 
		var textArr = d.label.split("\n"); 
		var result = '';
		if(textArr.length > 1){
			textArr.forEach((element, i) => {
				if(i == 0){
					result += '<tspan>';
				}else{
					result += '<tspan dy="'+i+'em">';
				}
				result += element;
				result += '</tspan>';
			}
			);
		}else{
			result += '<tspan>';
			result += d.label;
			result += '</tspan>';
		}
		return result;
	}

	function setDashedLineStyle(node){
		return node.dashed ? '8 11' : 'unset'
	}

	function setNodeStyle(){
		nodeRadius = getNodeRadius();
		activeRadius = getActiveNodeRadius();
		svgNodes
		.transition()
		.duration(animationTime)
		.attr("r", d => d.active ? activeRadius : nodeRadius)
		.attr("stroke-width", d => d.active ? activeRadius*(5/3) : nodeRadius*(5/3));
	}

	function getNodeRadius(){
		return width/48;
	}
	function getActiveNodeRadius(){
		return getNodeRadius()*2;
	}

	function makeDataArray(depth, d = jsonData.nodes[0]){

		if(depth <= 0) return;
		//add node to active path
		var nodesToDelFormActive = [];
		for (var i = 0; i < activePath.length; i++) {
			if(activePath[i].depth >= depth){
				for (var j = 0; j < jsonData.nodes.length; j++) {
					if(jsonData.nodes[j].id == activePath[i].id){
						jsonData.nodes[j].activePath = false;
						nodesToDelFormActive.push(activePath[i].id);
					}
				}
			}
		}
		for (var i = 0; i < nodesToDelFormActive.length; i++) {
			for (var j = 0; j < activePath.length; j++) {
				if(activePath[j].id == nodesToDelFormActive[i]){
					activePath.splice(j, 1);
				}
			}
			
		}
		
		for (var i = 0; i < jsonData.nodes.length; i++) {
			if(jsonData.nodes[i].id == d.id){
				jsonData.nodes[i].activePath = true;
				activePath.push({
					"id" :jsonData.nodes[i].id,
					"depth": depth
					});
			}
			
		}


		var myThis = {};
		let nodes = jsonData.nodes;
		var newNodes = [];
		var newLinks = [];
		var maxNodeId = nodes[nodes.length-1].id;



		scrollNext = isHasChild(d);
		var hasChild = isHasChild(d,false);

		if(hasChild){
			setDepth(depth+1);
			buildData(depth+1);
		}else{
			setDepth(depth);
			buildData(depth);
		}

		// add to full screen button
		newNodes.push({
			"id": "fullscreen",
			// "label": "🖵",
			"label": "Full\nscreen",
			"parents": [0],
			"depth": depth,
			"fullscreen": true,
			"functional": true
		});

		//click by "+" node to make it active need to add it to
		//newNodes manually
		if(isAdmin && (d.id >= maxNodeId || d.addNew) ){
			newNodes.push(d);
			newLinks.push(links.find(t => t.target.id == d.id));
		}
		

		if(!isAdmin){
			newNodes = newNodes.filter(d => !d.addNew);
		}

		//check if all links has they nodes
		checkLinks: for (var i = 0; i < newLinks.length; i++) {
			for (var k = 0; k < newNodes.length; k++) {
				if(typeof newLinks[i].source === 'object' ){
					if(newLinks[i].source.id == newNodes[k].id){
						continue checkLinks;
					}
				}else{
					if(newLinks[i].source == newNodes[k].id){
						continue checkLinks;
					}
				}
			}
			newLinks.splice(i, 1);
		}

		//delete not chosen way

		//сравнение нод
		// forNewNodes: for (var i = 0; i < newNodes.length; i++) {
		// 	for (var k = window.nodes.length - 1; k >= 0; k--) {
		// 		if(window.nodes[k].id == newNodes[i].id){
		// 			window.nodes[k].depth = newNodes[i].depth;
		// 			continue forNewNodes;
		// 		}
		// 	}
		// 	window.nodes.push(newNodes[i]);
		// }
		window.nodes = newNodes.map( d => Object.assign( window.nodes.find(t => t.id == d.id) || {}, d) );
		links = newLinks.map( d => Object.assign({}, d));


		// console.log(nodes);
		// console.log(newNodes);
		// console.log(window.nodes);
		// console.log(newLinks);
		// exit();

		function isHasChild(d, testForAdminChild = true){
			if(isAdmin && !d.addNew && testForAdminChild) return true;
			for (var i = 0; i < nodes.length; i++) {
				for (var k = 0; k < nodes[i].parents.length; k++) {
					if(nodes[i].parents[k] == d.id){
						return true;
					}
				}
			}
			return false;
		}

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
						for (var k = 0; k < nodes[i].parents.length; k++) {
							if( nodes[i].parents[k] == oldparentIds[j] ){
								hasId = true;
							}
						}
					}
					if(nodes[i].parents[0] == 0 && curentDepth == 1){
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
			buildDataNodes: for (var i = 0; i < nodes.length; i++) {
				if( nodes[i].depth && nodes[i].depth <= depth){
					
					//Do node on active path?
					var activePathChild = false;
					for (var j = 0; j < activePath.length; j++) {
						for (var k = 0; k < nodes[i].parents.length; k++) {
							if( nodes[i].parents[k] == activePath[j].id ){
								activePathChild = true;
							}
						}
					}
					if(nodes[i].activePath === true){
						nodes[i].activePath = true;
					}else if(activePathChild && nodes[i].depth <= (depth-1)){
						nodes[i].activePath = 'fade';
					}else if(activePathChild && nodes[i].depth > (depth-1)){
						nodes[i].activePath = 'child';
					}else{
						nodes[i].activePath = false;
						continue buildDataNodes;
					}
					// if(nodes[i].depth >= depth){
					// 	var parentFlag = true;
					// 	for (var k = 0; k < nodes[i].parents.length; k++) {
					// 		if(nodes[i].parents[k] == d.id) parentFlag = false;
					// 	}
					// 	if(parentFlag) continue buildDataNodes;
					// }

					nodes[i].id = 1*nodes[i].id;
					newNodes.push(nodes[i]);
					if(isAdmin && d.id == nodes[i].id){
						maxNodeId = 1*maxNodeId + 1;
						newNodes.push(
						{
							"depth": nodes[i].depth+1,
							"id": maxNodeId,
							"label": "+",
							"parents": [nodes[i].id],
							"addNew": true
						}
						);
						newLinks.push({
							source: parseInt(nodes[i].id),
							target: maxNodeId,
							dashed: true,
							value: 2
						});
					}

					nodes[i].parents.forEach(function(parent) {
						//core node hasn't links
						if(parent == 0) return;

						newLinks.push({
							source: 1*parent,
							target: parseInt(nodes[i].id),
							value: 2
						});
					});

				}
			}
		}

		return myThis;
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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

	function makeNodeActive(currNode){
		nodes.forEach( item => item.active = false );
		currNode.active = true;
	}

	window.simulationResize = function (){
		// width = window.innerWidth;
		// height = window.innerHeight;

		setNodeStyle();

		// simulation.force("link").links(links);
		simulation
		// .force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(1))
		.force("charge", d3.forceManyBody().strength( manyBodyForce ))
		.force("slideForse", d3.forceX(slideForse).strength(0.1))
		// .force("y", d3.forceY().strength(0.015))
		.alphaTarget(0.2)
		.restart();
	}
	window.simulationResize = throttle(simulationResize, 50);

	


	//resize
	window.addEventListener('resize', function(event){

		width = window.innerWidth;
		height = window.innerHeight;
		verticalScreen = height/width > width/height ? true : false;
		svgViewPort = [-width / 2, -height / 2, width, height];
		d3.select("#my_data svg")
		.attr("viewBox", svgViewPort);

		simulationResize();
	});

	document.addEventListener('keypress', keyFunc, false);

	function keyFunc(event){
		console.dir(event);
		switch (event.code){
			case 'KeyF':
			bodyFullScreanTogle();;
			break;
			default:
			break;
		}
	}

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

	function make_FullScrinTogle(elem){
		var is_fullScrin = false;
		function openFullscreen(elem) {
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.mozRequestFullScreen) { /* Firefox */
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
				elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) { /* IE/Edge */
				elem.msRequestFullscreen();
			}
		}
		function closeFullscreen() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) { /* Firefox */
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
				document.webkitExitFullscreen();
			} else if (document.msExitFullscreen) { /* IE/Edge */
				document.msExitFullscreen();
			}
		}

		return function(){
			if(!is_fullScrin){
				openFullscreen(elem);
				is_fullScrin = true;
			}else{
				closeFullscreen(elem);
				is_fullScrin = false;
			}
		}
	}
	

});