document.addEventListener( "DOMContentLoaded", function( event ) {

	var bodyClass = document.querySelector('body'); // temp
	var playBubble = make_sound("sounds/bubble.mp3");
	var isAdmin = document.location.search == '?admin';
	var bodyFullScreanTogle = make_FullScrinTogle(document.querySelector('body'));
	document.getElementById('fullscreenButton').addEventListener('click', e => bodyFullScreanTogle() );

	function popupActive(popupClass){
		document.querySelector('.paranja').classList.add('active');
		document.querySelector('.popup.' + popupClass).classList.add('active');
	}
	document.querySelector('.paranja').addEventListener('click', function(event){
		bodyClass.classList.remove('menu-show', 'page-show'); // temp
		this.classList.remove('active');
		let popup = document.querySelectorAll('.popup');
		for (var i = 0; i < popup.length; i++) {
			popup[i].classList.remove('active');
		}
	});


	//graphic variables
	var width = window.innerWidth;
	var height = window.innerHeight;
	var verticalScreen = height/width > width/height ? true : false;
	// // var nodeRadius = width/48;
	// var nodeRadius = 20;
	// // var activeRadius = nodeRadius*2;
	// var activeRadius = 20;
	var animationTime = 750;//ms
	var svgViewPort = [-width / 2, -height / 2, width, height];

	//smooth animations
	//общая настройка
	var showDelay = 100;
	var showDelay2 = 250;
	var hideDalayBack = 500;
	var hideDalay = 500;

	//тонкая настройка
	// var showNodeDelay = showDelay; //задерка перед появлением ноды
	// var showLinkDelay = showDelay2; //задерка перед появлением линка
	// var showSlideDelay = hideDalayBack; //задерка сдвига перед появлением
	// var hideSlideDelay = hideDalay; //задерка сдвига перед прятанием
	// var showCssDuration = 700; //длина анимации появления в css
	// var hideNodeCssDuration = 700; //длина анимации прятания ноды в css
	// var hideLinkCssDuration = 700; //длина анимации прятания линка в css
	var showNodeDelay = 100; //задерка перед появлением ноды
	var showLinkDelay = 100; //задерка перед появлением линка
	var showSlideDelay = 50; //задерка сдвига перед появлением
	var hideSlideDelay = 100; //задерка сдвига перед прятанием
	var showCssDuration = 400; //длина анимации появления в css
	var hideNodeCssDuration = 400; //длина анимации прятания ноды в css
	var hideLinkCssDuration = 400; //длина анимации прятания линка в css
	var startDelay = 250; //доп задерка при старте

	var deleteDelay = 500; //задержка до удаления из симуляции
	var firstScrean = true;
	//еще есть возможность добавить фукциональные клавиши(назад, меню)
	//в последовательность этой анимации - они будут отбражаться в последнею очередь

	//и еще по идеи можно сдлеать что бы пропадали линки и ноды тоже по очереди


	window.simulationResize = function (){};

	//data init
	window.nodes = [];
	var links = [];
	// var jsonData = null;
	var activePath = [];

	//viewPort init
	const svg = d3.select("#my_data").append("svg")
		.attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
		.attr("viewBox", svgViewPort);
	const viewPort = d3.select("#my_data")
		.style('width', width+'px')
		.style('height', height+'px');

	var linksCont = svg.append("g")
			.attr("class", "links");
	var nodesCont = viewPort.append("div")
		.attr("class", "nodes")
		.attr("style", "position: absolute;left: 50vw;top: 50vh;");

	var htmlNodes = nodesCont.selectAll("div.node");
	var svgLinks = linksCont.selectAll("line");

	var scrollNext = true;
	const slideForse = function (d){
		let activeDepth = tree.activeNode.depth;
		if(!d.functional){
			if(scrollNext){
				if(d.active){
					return (width/2 + width/2*(d.depth - activeDepth)) - width/2;
				}else{
					return (width/5 + width/2*(d.depth - activeDepth)) - width/2;
				}
			}else{
				return (width/4 + width/2*(d.depth - activeDepth+1)) - width/2;
			}
		}else{
			switch (d.function){
				case 'back':
						// return (width/2 + width/2*(d.depth - activeDepth)) - (width/1.3 + getNodeRadius()*4);
						return (width/10) - width/2;
					break;
				case 'menu':
						// return (width/2 + width/2*(d.depth - activeDepth)) -  (getNodeRadius()*4 + 150);
						return (width - width/5) - width/2;
					break;
				default:
					throw new Error('Неизвестная нода.')
			}
		}
	}

	// var manyBodyForce = -width + (1200/width)*50;
	var manyBodyForce = -2000;
	if (manyBodyForce > 0) manyBodyForce = -manyBodyForce;

	window.tree = new Tree("json/graphdata.json", simInit);

	tree.stats.enable();
	// tree.admin.set(true);
	// tree.showAllTree();


	function simInit(){

		//init first data
		nodes = tree.nodesToDisplay;
		links = tree.links;

		window.simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(1))
		.force("charge", d3.forceManyBody().strength( manyBodyForce ))
		// .force("center", d3.forceCenter(0,0))
		//сила задаеть горизонтальную координату для каждой ноды
		.force("slideForse", d3.forceX(slideForse).strength(0.05))
		//сила задаеть вертикальную координату для каждой ноды
		.force("y", d3.forceY(d => d.active ? -(height*2/15) : 0).strength(d => d.functional ? 0.03 : 0.03))
		.force("backButton", d3.forceY(d => height/2 - getNodeRadius(d)).strength(d => d.functional ? 0.1 : 0))
		// .alphaTarget(0.3) // stay hot
      	// .velocityDecay(0.1) // 0,4
		// .alphaTarget(0.5);


		// console.log('alpha:'+simulation.alpha());//1
		// console.log('alphaMin:'+simulation.alphaMin());//0,001
		// console.log('alphaTarget:'+simulation.alphaTarget());//0
		// console.log('alphaDecay:'+simulation.alphaDecay());//0,0228
		// console.log('velocityDecay:'+simulation.velocityDecay());//0,4


		if(verticalScreen){
			window.simulation
			.force("mobileVertical", d3.forceY(
				function(d){
					let activeDepth = tree.activeNode.depth;
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
							// return  d.id/90;
						}else{
							return 0.035;
						}
					}
				)
			)
		}

		buildLinks(links);
		buildNodes(nodes);

		firstScrean = false;
		tree.stats.start();

		simulation.on("tick", simulationTick);
	}




	function bubleClick(d, i, arr, delDelayFlag = true) {

		if(!d.active){
			playBubble();
		}

		// console.dir(d);

		// console.dir(arguments);
		if(d.functional) delDelayFlag = false;

		if(delDelayFlag){
			tree.cliсkOnNode(d, deleteDelay, bubleClick);
		}else{
			tree.cliсkOnNode(d);
		}

		nodes = tree.nodesToDisplay;
		links = tree.links;

		//apply click function
		if(d.functional){
			switch (d.function){
				case 'back':
					tree.backButton(deleteDelay, bubleClick);
					nodes = tree.nodesToDisplay;
					links = tree.links;
					break;
				case 'menu':
					popupActive('menu');
					bodyClass.classList.toggle('menu-show'); // temp
					break;
				default:
					throw new Error('Неизвестная нода.')
			}
		}

		if(d.iframe){
			var iframe = document.querySelector('.iframe iframe');
			var iframeSrc = iframe.getAttribute("src");
			if(iframeSrc !=  d.iframe){
				iframe.setAttribute("src", d.iframe);
			}
			popupActive('iframe');
			bodyClass.classList.add('page-show'); // temp
		}
	
		buildLinks(links);
		buildNodes(nodes);

		simulation.nodes(nodes);
		simulation.force("link").links(links);
		simulation.alpha(1).restart();

		tree.stats.start();
		// simulation.alphaTarget(0.8).restart();
		// simulation.alpha(3.2).restart();

		return;
	}



	function simulationTick(){
		tree.stats.tick();

		// console.log('alpha:'+simulation.alpha());
		// console.log('alphaMin:'+simulation.alphaMin());
		// console.log('alphaTarget:'+simulation.alphaTarget());
		// console.log('alphaDecay:'+simulation.alphaDecay());
		// console.log('velocityDecay:'+simulation.velocityDecay());

		svgLinks
		.attr("x1", d => d.source.x)
		.attr("y1", d => d.source.y)
		.attr("x2", d => d.target.x)
		.attr("y2", d => d.target.y);

		htmlNodes
		.attr("style", function (d){ 
			return 'left:'+d.x+'px;top:'+d.y+'px;'
		});

	}



	function buildNodes(nodes){
		var d3nodes = null;
		var d3newNodes = null;
		var d3exitNodes = null;

		//update
		d3nodes = nodesCont
		.selectAll("div.node")
		.data(nodes, d => d.id)
		.classed('active', d => d.active);
		

		//enter
		d3newNodes = d3nodes.enter().append('div')
		.classed('node', true)
		.classed('btn-functional', d => d.functional)
		.classed('btn-back', d => d.function == 'back')
		.classed('btn-menu', d => d.function == 'menu')
		.classed('active', d => d.active)
		.attr("node-id", d => d.id)

		// .call(
		// 	d3.drag(simulation)
		// 	.on("start", dragstarted)
		// 	.on("drag", dragged)
		// 	.on("end", dragended)
		// 	)
		.on("click", bubleClick);

		d3newNodes
		// .classed('show',  d => d.functional )
		// .filter( d => !d.functional )
		.transition()
		.delay(makenodeDelay())
		.on("start", function repeat() {
			this.classList.add('show');
		});


		d3newNodes.append("div")
		.classed('v-content', true)
		.html(d => d.label);

		d3newNodes.append("div")
		.classed('c1', true);

		d3newNodes.append("div")
		.classed('c2', true);


		//exit
		d3exitNodes = d3nodes.exit();

		// d3exitNodes
		// .filter( d => d.functional )
		// .classed('show',  d => !d.functional )
		// .remove();

		d3exitNodes
		// .filter( d => !d.functional )
		.transition()
		.delay(hideSlideDelay) // delay before hide
		.duration(hideNodeCssDuration) // time before delete
		.on('start', function(){
			this.classList.remove('show');
		})
		.on('end', function(){
			this.remove();
		});


		//update nodes list var
		htmlNodes = nodesCont.selectAll("div.node");

		function makenodeDelay(){
			var counter = 2;

			return function(d){
				var result = 0;

				if(!firstScrean){
					// result = counter * showNodeDelay + counter * showLinkDelay + showSlideDelay + showCssDuration;//showCssDuration тут по идеи линка
					result = counter * showNodeDelay + counter * showLinkDelay-300;//showCssDuration тут по идеи линка
				}else{
					// result = counter * showNodeDelay + counter * showLinkDelay + startDelay;
					result = counter * showNodeDelay + counter * showLinkDelay-300 + startDelay;
				}

				console.log('node-counter',counter);
				console.log('node-result',result);

				counter++;

				return result;
			}
		}

	}

	function buildLinks(links){
		var d3links = null;
		var d3newLinks = null;

		//update
		d3links = linksCont
		.selectAll('line')
		.data(links, 
			function(d){
				if(typeof d.source === 'object' ){
					return [d.source.id, d.target.id];
				}else{
					return [d.source, d.target];
				}
			}
		);

		//enter
		d3newLinks = d3links
		.enter().append('line')
		// .attr("stroke-width", d => d.value)
		.attr('stroke-width', 3)
		.attr('stroke-dasharray', d => d.dashed ? '8 11' : 'unset');

		//add smooth animation
		d3newLinks
		// .filter( d => showIds.includes(d.target.id) )
		.transition()
		.delay(makelinkDelay())
		.on('start', function repeat() {
			this.classList.add('show');
		});


		//exit
		d3links.exit()
		.transition()
		.delay(hideSlideDelay)
		// .delay(makelinkDelay())
		.duration(hideLinkCssDuration)
		.on('start', function(){
			this.classList.remove('show');
		})
		.on('end', function(){
			this.remove();
		});


		//update links list var
		svgLinks = linksCont.selectAll("line");

		
		function makelinkDelay(){
			var counter = 2;

			return function(d){
				var result = 0;

				if(!firstScrean){
					// result = counter * showLinkDelay + counter * showNodeDelay + showSlideDelay - 500;
					result = counter * showLinkDelay + counter * showNodeDelay;
				}else{
					// result = counter * showLinkDelay + counter * showNodeDelay + showCssDuration - 500 + startDelay;//showCssDuration тут по идеи ноды
					result = counter * showLinkDelay + counter * showNodeDelay + showCssDuration;//showCssDuration тут по идеи ноды
				}

				console.log('link-counter',counter);
				console.log('link-result',result);

				counter++;

				return result; 
			}
		}
	}






	function getNodeRadius(node){
		// console.dir(getNodeElementById(node.id));
		// return width/48;
		return 70;
	}

	// function getNodeElementById(id){
	// 		console.dir(nodesCont);
	// 	// for (var i = 0; i < nodes.length; i++) {
	// 	// }
	// 	return id;
	// }

	// function makeDataArray(depth, d = jsonData.nodes[0]){

	// 	if(depth <= 0) return;
	// 	//add node to active path
	// 	var nodesToDelFormActive = [];
	// 	for (var i = 0; i < activePath.length; i++) {
	// 		if(activePath[i].depth >= depth){
	// 			for (var j = 0; j < jsonData.nodes.length; j++) {
	// 				if(jsonData.nodes[j].id == activePath[i].id){
	// 					jsonData.nodes[j].activePath = false;
	// 					nodesToDelFormActive.push(activePath[i].id);
	// 				}
	// 			}
	// 		}
	// 	}
	// 	for (var i = 0; i < nodesToDelFormActive.length; i++) {
	// 		for (var j = 0; j < activePath.length; j++) {
	// 			if(activePath[j].id == nodesToDelFormActive[i]){
	// 				activePath.splice(j, 1);
	// 			}
	// 		}
			
	// 	}
		
	// 	for (var i = 0; i < jsonData.nodes.length; i++) {
	// 		if(jsonData.nodes[i].id == d.id){
	// 			jsonData.nodes[i].activePath = true;
	// 			activePath.push({
	// 				"id" :jsonData.nodes[i].id,
	// 				"depth": depth
	// 				});
	// 		}
			
	// 	}


	// 	let nodes = jsonData.nodes;
	// 	var newNodes = [];
	// 	var newLinks = [];
	// 	var maxNodeId = nodes[nodes.length-1].id;



	// 	scrollNext = isHasChild(d);
	// 	var hasChild = isHasChild(d,false);

	// 	if(hasChild){
	// 		setDepth(depth+1);
	// 		buildData(depth+1);
	// 	}else{
	// 		setDepth(depth);
	// 		buildData(depth);
	// 	}

	// 	// add to full screen button
	// 	newNodes.push({
	// 		"id": "fullscreen",
	// 		// "label": "🖵",
	// 		"label": "Full\nscreen",
	// 		"parents": [0],
	// 		"depth": depth,
	// 		"fullscreen": true,
	// 		"functional": true
	// 	});

	// 	//click by "+" node to make it active need to add it to
	// 	//newNodes manually
	// 	if(isAdmin && (d.id >= maxNodeId || d.addNew) ){
	// 		newNodes.push(d);
	// 		newLinks.push(links.find(t => t.target.id == d.id));
	// 	}
		

	// 	if(!isAdmin){
	// 		newNodes = newNodes.filter(d => !d.addNew);
	// 	}

	// 	//check if all links has they nodes
	// 	checkLinks: for (var i = 0; i < newLinks.length; i++) {
	// 		for (var k = 0; k < newNodes.length; k++) {
	// 			if(typeof newLinks[i].source === 'object' ){
	// 				if(newLinks[i].source.id == newNodes[k].id){
	// 					continue checkLinks;
	// 				}
	// 			}else{
	// 				if(newLinks[i].source == newNodes[k].id){
	// 					continue checkLinks;
	// 				}
	// 			}
	// 		}
	// 		newLinks.splice(i, 1);
	// 	}

	// 	//delete not chosen way

	// 	//сравнение нод
	// 	// forNewNodes: for (var i = 0; i < newNodes.length; i++) {
	// 	// 	for (var k = window.nodes.length - 1; k >= 0; k--) {
	// 	// 		if(window.nodes[k].id == newNodes[i].id){
	// 	// 			window.nodes[k].depth = newNodes[i].depth;
	// 	// 			continue forNewNodes;
	// 	// 		}
	// 	// 	}
	// 	// 	window.nodes.push(newNodes[i]);
	// 	// }
	// 	window.nodes = newNodes.map( d => Object.assign( window.nodes.find(t => t.id == d.id) || {}, d) );
	// 	links = newLinks.map( d => Object.assign({}, d));


	// 	// console.log(nodes);
	// 	// console.log(newNodes);
	// 	// console.log(window.nodes);
	// 	// console.log(newLinks);
	// 	// exit();

	// 	function isHasChild(d, testForAdminChild = true){
	// 		if(isAdmin && !d.addNew && testForAdminChild) return true;
	// 		for (var i = 0; i < nodes.length; i++) {
	// 			for (var k = 0; k < nodes[i].parents.length; k++) {
	// 				if(nodes[i].parents[k] == d.id){
	// 					return true;
	// 				}
	// 			}
	// 		}
	// 		return false;
	// 	}

	// 	function setDepth(depth){
	// 		let curentDepth = 1;
	// 		let parentIds = [];
	// 		let oldparentIds = [];
	// 		for (;curentDepth <= depth; curentDepth++ ){
	// 			oldparentIds = parentIds;
	// 			parentIds = [];
	// 			for (var i = 0; i < nodes.length; i++){
	// 				let hasId = false;
	// 				for (var j = 0; j < oldparentIds.length; j++) {
	// 					for (var k = 0; k < nodes[i].parents.length; k++) {
	// 						if( nodes[i].parents[k] == oldparentIds[j] ){
	// 							hasId = true;
	// 						}
	// 					}
	// 				}
	// 				if(nodes[i].parents[0] == 0 && curentDepth == 1){
	// 					nodes[i].depth = 1;
	// 					parentIds.push(nodes[i].id);
	// 				}else if( hasId ){
	// 					nodes[i].depth = curentDepth;
	// 					parentIds.push(nodes[i].id);
	// 				}
	// 			}
	// 		}
	// 	}

	// 	function buildData(depth){
	// 		buildDataNodes: for (var i = 0; i < nodes.length; i++) {
	// 			if( nodes[i].depth && nodes[i].depth <= depth){
					
	// 				//Do node on active path?
	// 				var activePathChild = false;
	// 				for (var j = 0; j < activePath.length; j++) {
	// 					for (var k = 0; k < nodes[i].parents.length; k++) {
	// 						if( nodes[i].parents[k] == activePath[j].id ){
	// 							activePathChild = true;
	// 						}
	// 					}
	// 				}
	// 				if(nodes[i].activePath === true){
	// 					nodes[i].activePath = true;
	// 				}else if(activePathChild && nodes[i].depth <= (depth-1)){
	// 					nodes[i].activePath = 'fade';
	// 				}else if(activePathChild && nodes[i].depth > (depth-1)){
	// 					nodes[i].activePath = 'child';
	// 				}else{
	// 					nodes[i].activePath = false;
	// 					continue buildDataNodes;
	// 				}
	// 				// if(nodes[i].depth >= depth){
	// 				// 	var parentFlag = true;
	// 				// 	for (var k = 0; k < nodes[i].parents.length; k++) {
	// 				// 		if(nodes[i].parents[k] == d.id) parentFlag = false;
	// 				// 	}
	// 				// 	if(parentFlag) continue buildDataNodes;
	// 				// }

	// 				nodes[i].id = 1*nodes[i].id;
	// 				newNodes.push(nodes[i]);
	// 				if(isAdmin && d.id == nodes[i].id){
	// 					maxNodeId = 1*maxNodeId + 1;
	// 					newNodes.push(
	// 					{
	// 						"depth": nodes[i].depth+1,
	// 						"id": maxNodeId,
	// 						"label": "+",
	// 						"parents": [nodes[i].id],
	// 						"addNew": true
	// 					}
	// 					);
	// 					newLinks.push({
	// 						source: parseInt(nodes[i].id),
	// 						target: maxNodeId,
	// 						dashed: true,
	// 						value: 2
	// 					});
	// 				}

	// 				nodes[i].parents.forEach(function(parent) {
	// 					//core node hasn't links
	// 					if(parent == 0) return;

	// 					newLinks.push({
	// 						source: 1*parent,
	// 						target: parseInt(nodes[i].id),
	// 						value: 2
	// 					});
	// 				});

	// 			}
	// 		}
	// 	}
	// }

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

	// function makeNodeActive(currNode){
	// 	nodes.forEach( item => item.active = false );
	// 	currNode.active = true;
	// }

	window.simulationResize = function (){
		// width = window.innerWidth;
		// height = window.innerHeight;

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

		svg
		.attr("viewBox", svgViewPort);

		viewPort
		.style('width', width+'px')
		.style('height', height+'px');

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
	
	//prepare data to simulation
	function Tree(jsonPath, callback){
		var myThis = this;
		this.activeNode = null;
		this.getChildrenNodes = function(node){};
		this.getClosestParent = function(node){};
		this.getActivePath = getActivePath;
		this.getFullActivePath = getFullActivePath;
		this.makeNodeActive = makeNodeActive;
		this.cliсkOnNode = cliсkOnNode;
		this.jsonPath = jsonPath;
		this.admin = Admin(document.location.search == '?admin');
		this.stats = stats();
		this.getNodeById = getNodeById;
		//для использования нужно сделать очистку activePath с учётом возможности прижка между нодами
		this.showAllTree = showAllTree;
		this.backButton = backButton;
		/*
		* node = {
		*	id: int,
		*	active: bool,
		*	activePath: bool,
		*	depth: int,
		*	label: str,
		*	parents: arr,
		*	children: arr,
		*	functional: bool,
		*	function: str,
		*	addNew: bool,
		*	display: bool,
		*	goTo: int,
		* }
		*/
		this.nodes = [];
		this.nodesToDisplay = [];
		/*
		* link = {
		*	source: int || obj of node,
		*	target: int || obj of node,
		*	dashed: bool,
		*	value: int=2,
		*	isAnimation: bool,
		*	animation: {
		*		speed: int,
		*		cx: int,
		*		cy: int,
		*	},
		* }
		*/
		this.links = [];

		var isShowAllTree = false;
		var activePath = [];



		var jsonData = null;
		var simulationInit = false;
		var initCallback = callback;

		init(this.jsonPath);

		function init(jsonPath){
			//read data
			d3.json(jsonPath, readJsonData);
		}

		function readJsonData(jsonDataFromFile){

			jsonData = jsonDataFromFile;

			if(!simulationInit){
				simulationInit = true;
				makeNodeTree(jsonData);
				initCallback.apply(myThis, []);
			}
		}

		function makeNodeTree(jsonData){
			var nodes = [];
			myThis.nodes = nodes = jsonData.nodes;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].id = nodes[i].id*1;
				nodes[i].active = false;
				nodes[i].activePath = false;
				nodes[i].depth = undefined;
				nodes[i].children = [];
				nodes[i].functional = false;
				nodes[i].function = '';
				nodes[i].addNew = false;
				nodes[i].display = false;
				nodes[i].goTo = nodes[i].goTo*1 || false;
			}
			makeNodeActive(nodes[0]);
			updateNodes();
		}

		function setNodesDepth(widthChildrens = true){
			let curentDepth = 1;
			let parentIds = [];
			let oldparentIds = [];
			let currFullActivePath = getFullActivePath();
			let nodes = myThis.nodes;
			let depth = myThis.activeNode.depth;

			// //don't show childrens when goTo
			// if(myThis.activeNode.goTo !== false){
			// 	widthChildrens = false;
			// }

			if(isShowAllTree || !depth){
				//calculate all depht if need to show whole tree
				depth = nodes.length-1;
			}else{
				if(widthChildrens) depth++;
			}

			for (;curentDepth <= depth; curentDepth++ ){
				oldparentIds = parentIds;
				parentIds = [];
				for (var i = 0; i < nodes.length; i++){
					let hasId = false;
					for (var j = 0; j < oldparentIds.length; j++) {
						for (var k = 0; k < nodes[i].parents.length; k++) {
							//тут надо проверить oldparentIds[j] или nodes[i].parents[k]
							if(!isInArrayId(oldparentIds[j], currFullActivePath) && 
								nodes[i].depth !== undefined){
									continue;
							}
							if( nodes[i].parents[k] == oldparentIds[j]){
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
					}else if( nodes[i].functional ){
						nodes[i].depth = myThis.activeNode.depth;
					}
				}
			}
		}

		function setNodesChildrens(node){
			let nodes = myThis.nodes;
			var id = undefined;
			var nodeChildrens = [];

			for (var j = 0; j < nodes.length; j++) {
				id = nodes[j].id;
				nodeChildrens = [];

				if(nodes[j].functional) continue;

				for (var i = 0; i < nodes.length; i++) {
					for (var k = 0; k < nodes[i].parents.length; k++) {
						if( nodes[i].parents[k] == id ){
							nodeChildrens.push(nodes[i].id*1);
						}
					}
				}
				myThis.nodes[j].children = nodeChildrens;
			}
		}

		function makeNodeActive(currNode){
			// if('first' == currNode) currNode = myThis.nodes[0];
			if(currNode.functional) return;
			myThis.nodes.forEach( function(item){
				item.active = false;
				// if(item.depth && item.depth == currNode.depth){
				// 	item.activePath = false;
				// }
			});
			currNode = getNodeById(currNode.id)
			currNode.active = true;
			currNode.activePath = true;
			//add to active path if this not deleteDelay run
			if(activePath.length == 0 || activePath[activePath.length-1].id !== currNode.id){
				activePath.push(currNode);
			}
			myThis.activeNode = currNode;
		}

		function setNodesDisplay(widthChildrens = true){
			let nodes = myThis.nodes;
			let activeNode = myThis.activeNode;
			let depth = myThis.activeNode.depth;

			// //don't show childrens when goTo
			// if(myThis.activeNode.goTo !== false){
			// 	widthChildrens = false;
			// }

			if(!depth) {
				depth = nodes.length-1;
			}else{
				if(widthChildrens) depth++;
			}

			for (var i = 0; i < nodes.length; i++) {
				if(showNode(nodes[i], depth)){
					nodes[i].display = true;
				}else if(nodes[i].functional){
					switch (nodes[i].function){
						case 'back':
							if(myThis.activeNode.depth > 1){
								nodes[i].display = true;
							}else{
								nodes[i].display = false;
							}
							break;
						default:
							nodes[i].display = true;
							break;
							// throw new Error('Неизвестная функциональная нода.')
					}
				}else{
					nodes[i].display = false;
				}
			}

			if(widthChildrens){
				for (var i = 0; i < activeNode.children.length; i++) {
					for (var j = 0; j < nodes.length; j++) {
						if(nodes[j].id == activeNode.children[i]){
							nodes[j].display = true;
						}
					}
				}
			}
		}

		function showNode(node, depth){
			// if(node.depth <= depth && node.activePath == true || isShowAllTree){
			if(node.active || isShowAllTree){
				return true;
			}else{
				return false;
			}
		}

		function updateNodesToDisplay(deleteDelay = false){
			let nodes = myThis.nodes.map((node) => node);
			let nodesToDisplay = myThis.nodesToDisplay.map((node) => node);
			let nodeToHide = true;
			let nodeToAdd = true;

			//update-delete exiting nodes
			for (var i = 0; i < nodesToDisplay.length; i++) {
				nodeToHide = true;
				for (var j = 0; j < nodes.length; j++) {
					if(nodes[j].id == nodesToDisplay[i].id && nodes[j].display){
						Object.assign(nodesToDisplay[i], nodes[j]);
						nodeToHide = false;
					}
				}
				if( (nodeToHide && !deleteDelay) || (nodeToHide && nodesToDisplay[i].functional) ){
					for (var k = 0; k < myThis.nodesToDisplay.length; k++) {
						if(myThis.nodesToDisplay[k].id == nodesToDisplay[i].id)
						myThis.nodesToDisplay.splice(k, 1);
					}
				}
			}

			nodesToDisplay = myThis.nodesToDisplay;

			//add new
			for (var i = 0; i < nodes.length; i++) {
				if(nodes[i].display){
					nodeToAdd = true
					for (var j = 0; j < nodesToDisplay.length; j++){
						if(nodesToDisplay[j].id == nodes[i].id){
							nodeToAdd = false;
						}
					}
					if(nodeToAdd){
						myThis.nodesToDisplay.push(nodes[i]);
					}
				}
			}
		}

		function updateLinks(){
			let nodes = myThis.nodesToDisplay;
			myThis.links = [];

			for (var i = 0; i < nodes.length; i++) {

				if(nodes[i].functional) continue;

				nodes[i].parents.forEach(function(parent) {
					//core node hasn't links
					if(parent == 0) return;
					//node don't show
					if(!isInArrayId(parent, nodes)) return;

					myThis.links.push({
						source: getNodeById(parent*1),
						target: nodes[i],
						dashed: nodes[i].addNew,
						value: 2
					});
				});

			}
		}

		function isInArrayId(id, array = []){
			for (var i = 0; i < array.length; i++) {
				if(array[i].id == id){
					return true;
				}
			}
			return false
		}

		function getNodeById(id){
			let nodes = myThis.nodes;
			for (var i = 0; i < nodes.length; i++) {
				if(nodes[i].id == id){
					return myThis.nodes[i];
				}
			}
			return false;
		}

		var timerDDId = null;
		function cliсkOnNode(node, deleteDelay = false, callback = function(){}){
			if(node.goTo !== false){
				var goToNode = getNodeById(node.goTo);
				if(goToNode){
					node = goToNode;
				}
			}
			makeNodeActive(node);
			updateNodes(deleteDelay);


			if(deleteDelay){
				clearTimeout(timerDDId);
				timerDDId = setTimeout(function(node) {
					callback(node, node.index, myThis.nodesToDisplay, false);//replace nodesToDisplay to html list of nodes
				}, deleteDelay, node);
			}
		}

		
		function updateNodes(deleteDelay = false){
			addFunctionalButtons();
			myThis.admin.updateNodes();
			setNodesChildrens();
			setNodesDepth();
			setNodesDisplay();
			updateNodesToDisplay(deleteDelay);
			updateLinks();
		}

		function Admin(admin = false){
			var isAdmin = admin;
			var maxNodeId = 0;

			function getMaxId(nodes){
				let nodeIds = nodes.map((node) => node.id);
				return Math.max.apply(null, nodeIds);
			}

			function delAllNewNodes(){
				let nodes = myThis.nodes.map((node) => node);
				for (var i = 0; i < nodes.length; i++) {
					if(nodes[i].addNew){
						myThis.nodes.splice(i, 1);
					}
				}
			}

			function delAllNewNodesExceptActive(){
				let nodes = myThis.nodes.map((node) => node);
				for (var i = 0; i < nodes.length; i++) {
					if(nodes[i].addNew && !nodes[i].active){
						myThis.nodes.splice(i, 1);
					}
				}
			}

			function isHasNewNode(node){
				let childrens = node.children;
				let currNode = null;
				for (var i = 0; i < childrens.length; i++) {
					currNode = getNodeById(childrens[i]);
					if(currNode.addNew){
						return true;
					}
				}
				return false;
			}

			return {
				set: function(admin){
					isAdmin = !!admin;
				},
				get: function(admin){
					return isAdmin;
				},
				updateNodes: function(){
					let nodes = myThis.nodes.map((node) => node);

					if(isAdmin){
						delAllNewNodesExceptActive();
						for (var i = 0; i < nodes.length; i++) {
							//режым бесконечных плюсиков !nodes[i].addNew
							if(
								myThis.activeNode.id == nodes[i].id && 
								!nodes[i].addNew && 
								!isHasNewNode(nodes[i])
							){
								maxNodeId = getMaxId(myThis.nodes)*1 + 1;
								myThis.nodes.push({
									id: maxNodeId,
									active: false,
									activePath: false,
									depth: undefined,//nodes[i].depth+1
									label: "+",
									parents: [nodes[i].id],
									children: [],
									functional: false,
									function: '',
									addNew: true,
									display: false,
									goTo: false
								});
							}
						}
					}else{
						delAllNewNodes();
					}
				}
			}
		}


		function showAllTree(show = true){
			isShowAllTree = !!show;
		}

		function addFunctionalButtons(){
			addFunctionalButton(10000, 'назад', 'back');
			addFunctionalButton(10001, 'меню', 'menu');
		}

		function addFunctionalButton(id, name, function1){
			if(!getNodeById(id)){
				myThis.nodes.push({
					id: id,
					active: false,
					activePath: false,
					depth: undefined,
					label: name,
					parents: [],
					children: [],
					functional: true,
					function: function1,
					addNew: false,
					display: false,
					goTo: false
				});
			}
		}


		function backButton(deleteDelay = false, callback = function(){}){
			let currActivePath = getActivePath();

			//if firs node active
			if(currActivePath.length < 2) return;

			//clear previos activePath
			//spep back activePath
			//тут надо функцию которя буде удалять activePath во всех нодах в которых depth <= activeDepth
			//или это не тут а при клике на ноду нужно делать
			var backStepNode = currActivePath.pop();
			backStepNode.activePath = false;

			//simulate click on stepback node
			// console.dir(currActivePath);
			cliсkOnNode(currActivePath[currActivePath.length-1], deleteDelay, callback);
		}

		function getActivePath(){
			// let nodes = myThis.nodes;
			// let activePath = [];
			// for (var i = 0; i < nodes.length; i++) {
			// 	if(nodes[i].activePath){
			// 		activePath.push(nodes[i]);
			// 	}
			// }
			return activePath;//.sort( (a, b) => a.depth*1 - b.depth*1 )
		}

		function getFullActivePath(){
			let currActivePath = getActivePath();
			let fullActivePath = [];

			if( (currActivePath.length - 1) == 0 ){
				fullActivePath = currActivePath;
			}else{
				for (var i = currActivePath.length - 1; i > 0; i--) {
					var fullChain = makeFullChain();
					fullChain(currActivePath[i], currActivePath[(i-1)]);
				}
			}

			return fullActivePath;

			function makeFullChain(){
				var limmiter = 20;

				function findMissNods(parentsIds, parentId){
					limmiter--;
					if(limmiter <= 0) {
						// throw new Error('Невозможно найти fullActivePath.')
						console.error('Невозможно найти fullActivePath.')
						return false;
					}
					var result = [];
					for (var i = 0; i < parentsIds.length; i++) {

						//it is first node
						if(parentsIds[i] == 0 && parentId != 0){
							//wrong way
							return false;
						}
						//find node
						if(parentsIds[i] == parentId){
							let node = getNodeById(parentId);
							return node.id;
						}else{
							//search deeper
							let node = getNodeById(parentsIds[i]);
							// result.push( {parentId:parentsIds[i],node:node, child:findMissNods(node.parents, parentId)} );
							result.push([node.id,findMissNods(node.parents, parentId)].flat());
						}
					}
					//finde best way
					if(result.length > 0){
						let lessLengs = 9999;
						let lessLengsIndex = null;
						shortWay:for(let i=0; i<result.length; i++){
							//skip if in results false
							for (let j = 0; j < result[i].length; j++) {
								if(result[i][j] === false){
									continue shortWay;
								}
							}
							if(result[i].length < lessLengs){
								lessLengs = result[i].length;
								lessLengsIndex = i;
							}
						}
						if(lessLengsIndex === null){
							result = [false];
						}else{
							result = result[lessLengsIndex];
						}
					}
					return result;
				}

				return function fullChain(b, a){
					if( !isInArrayId(b.id, fullActivePath) ){
						fullActivePath.push(b);
					}
					let directDescendant = false
					for (let i = 0; i < b.parents.length; i++) {
						if(b.parents[i] == a.id){
							directDescendant = true;
						}
					}
					if(directDescendant){
						fullActivePath.push(a);
					}else{
						let missingNodes = findMissNods(b.parents, a.id);

						if(missingNodes){
							for (var i = 0; i < missingNodes.length; i++) {
								let node = getNodeById(missingNodes[i]);
								fullActivePath.push(node);
							}
						};
					}

				}
			}
		}

		function stats(){
			var isActive = false;
			//fps
			var startTime = 0;
			var frame = 0;

			var tickCount = 0;
			var simulationTime = 0;

			var wrapperStats = document.createElement("div");
			wrapperStats.setAttribute('style',"font-size: 24px;z-index: 100;position: absolute;top: 0;");

			//fps
			var fps = createStat('FPS: ');
			//counter
			var couter = createStat('FramesCount: ');
			//simTime
			var simTime = createStat('SimTime: ');


			var parent = document.querySelector('#my_data');

			function createStat(html, default1 = '--'){
				var wrapper = document.createElement("div");
				wrapper.innerHTML = html;
				var value = document.createElement("span");
				value.innerHTML = default1;
				wrapper.append(value);
				wrapperStats.append(wrapper);

				return value;
			}

			return{
				enable: function(){
					isActive = true;
					startTime = Date.now();
					frame = 0;
					if(parent){
						parent.append(wrapperStats);
					}
				},
				start: function(){
					tickCount = 0;
					simulationTime = Date.now();
				},
				tick: function(){
					if(isActive){
						//fps
						var time = Date.now();
						frame++;
						if (time - startTime > 1000) {
							fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
							startTime = time;
							frame = 0;
						}

						//counter
						tickCount++;
						couter.innerHTML = tickCount

						simTime.innerHTML = (Date.now() - simulationTime)/1000;
					}
				}
			}

		}



	}

});