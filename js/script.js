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

	var debug = false;


	//graphic variables
	var width = window.innerWidth;
	var height = window.innerHeight;
	var verticalScreen = height/width > width/height ? true : false;

	var svgViewPort = [-width / 2, -height / 2, width, height];

	//smooth animations
	//общая настройка
	var showDelay = 0;
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
	var showSlideDelay = 0; //задерка сдвига перед появлением
	var hideSlideDelay = 100; //задерка сдвига перед прятанием ** delay before link hide
	var hideLinkDelay = 0; //задерка сдвига перед прятанием ** delay before link hide
	var showCssDuration = 400; //длина анимации появления в css
	var hideNodeCssDuration = 400; //длина анимации прятания ноды в css
	var hideLinkCssDuration = 400; //длина анимации прятания линка в css
	var startDelay = 250; //доп задерка при старте

	var deleteDelay = 500; //задержка до удаления из симуляции, но не с экрана
	var firstScrean = true;
	//еще есть возможность добавить фукциональные клавиши(назад, меню)
	//в последовательность этой анимации - они будут отбражаться в последнею очередь

	//и еще по идеи можно сдлеать что бы пропадали линки и ноды тоже по очереди


	window.simulationResize = function (){};

	//data init
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





	window.model = new makeModel("json/graphdata.json", simInit);

	model.stats.enable();
	// model.admin.set(true);
	// model.showAllTree();

	window.view = new makeView(model);


	function getColideRadius(d){
		return 250;
	}


	function simInit(){

		//init first data

		window.simulation = d3.forceSimulation(model.nodesToDisplay)
		.force("link", d3.forceLink(model.links).id(d => d.id).strength(view.linkStr).distance(view.linkDistance))
		.force("charge", view.isolateForce(d3.forceManyBody().strength(view.manyBodyStr), d => !d.functional) )
		// .force("center", d3.forceCenter(0,0))
		.force("slideForce", d3.forceX(view.slideForce).strength(view.slideForceStr))
		.force("verticalForce", d3.forceY(view.verticalForce).strength(view.verticalForceStr))
		// .force("collide", d3.forceCollide().radius(getColideRadius))
		// еще радиальную силу добавить


		// simulation
		// .alpha(0.4)
		// .alphaMin(0.1)
		// .alphaTarget(0)
      	// .velocityDecay(0.4) // 0,4

		//300 кадров в секунду
		// simulation
		// .alphaDecay(1 - Math.pow(simulation.alphaMin(), simulation.alpha() / 300));
		// console.log(1 - Math.pow(simulation.alphaMin(), 1 / 300));





		// console.log('alpha:'+simulation.alpha());//1
		// console.log('alphaMin:'+simulation.alphaMin());//0,001
		// console.log('alphaTarget:'+simulation.alphaTarget());//0
		// console.log('alphaDecay:'+simulation.alphaDecay());//0,0228
		// console.log('velocityDecay:'+simulation.velocityDecay());//0,4

		svgLinks = buildLinks(model.links);
		htmlNodes = buildNodes(model.nodesToDisplay);

		firstScrean = false;
		model.stats.restart();

		simulation.on("tick", simulationTick);
	}




	function bubleClick(d, i, arr, delDelayFlag = true) {

		if(!d.active){
			playBubble();
		}

		// console.dir(d);

		// console.dir(arguments);
		//for back button
		if(d.functional) delDelayFlag = false;

		if(delDelayFlag){
			model.cliсkOnNode(d, deleteDelay, bubleClick);
		}else{
			model.cliсkOnNode(d);
		}

		//apply click function
		if(d.functional){
			switch (d.function){
				case 'back':
					model.backButton(deleteDelay, bubleClick);
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
	
		svgLinks = buildLinks(model.links);
		htmlNodes = buildNodes(model.nodesToDisplay);

		simulation.nodes(model.nodesToDisplay);
		simulation.force("link").links(model.links);
		simulation.alphaTarget(0.45).restart();
		// simulation.alpha(1).restart();

		model.stats.restart();

		return;
	}



	function simulationTick(){
		model.stats.tick();

		console.log('alpha:'+simulation.alpha());
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
		.classed('active', d => d.active)
		.classed('hide', d => {
			let activeNodeCildrens = model.activeNode.children
			if( d.active ) return false;
			if( d.functional ) return false;
			if( activeNodeCildrens.includes(d.id) ) return false;
			return true;
		});
		

		//enter
		d3newNodes = d3nodes.enter().append('div')
		.classed('node', true)
		.classed('btn-functional', d => d.functional)
		.classed('btn-back', d => d.function == 'back')
		.classed('btn-menu', d => d.function == 'menu')
		.classed('active', d => d.active)
		.attr("node-id", d => d.id)

		.call(
			d3.drag(simulation)
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
			)
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

		if(debug){
			let colideRadius = getColideRadius();
			d3newNodes.append("div")
			.classed('c3', true)
			.style('width', colideRadius*2+'px')
			.style('height', colideRadius*2+'px')
			.style('top', 0)
			.style('left', 0)
			.style('border-radius', '50%')
			.style('position', 'absolute')
			.style('transform', 'translate(-50%, -50%)')
			.style('background-color', '#ffeb3b57')
			.style('z-index', '5')
		}


		//exit
		d3exitNodes = d3nodes.exit();

		d3exitNodes
		.classed('hide', true)
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


		//return updated nodes list
		return nodesCont.selectAll("div.node");

		function makenodeDelay(){
			var counter = 2;

			return function(d){
				var result = 0;

				if(!firstScrean){
					// result = counter * showNodeDelay + counter * showLinkDelay + showSlideDelay + showCssDuration;//showCssDuration тут по идеи линка
					result = counter * showNodeDelay + counter * showLinkDelay -400;//showCssDuration тут по идеи линка
				}else{
					// result = counter * showNodeDelay + counter * showLinkDelay + startDelay;
					result = counter * showNodeDelay + counter * showLinkDelay + startDelay-400;
				}

				// console.log('node-counter',counter);
				// console.log('node-result',result);

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
		.delay(hideLinkDelay)
		// .delay(makelinkDelay())
		.duration(hideLinkCssDuration)
		.on('start', function(){
			this.classList.remove('show');
		})
		.on('end', function(){
			this.remove();
		});


		//return updated links list
		return linksCont.selectAll("line");

		
		function makelinkDelay(){
			var counter = 0;

			return function(d){
				var result = 0;

				if(!firstScrean){
					// result = counter * showLinkDelay + counter * showNodeDelay + showSlideDelay - 500;
					result = counter * showLinkDelay + counter * showNodeDelay + showSlideDelay;
				}else{
					// result = counter * showLinkDelay + counter * showNodeDelay + showCssDuration - 500 + startDelay;//showCssDuration тут по идеи ноды
					result = counter * showLinkDelay + counter * showNodeDelay + showCssDuration + showSlideDelay + startDelay;//showCssDuration тут по идеи ноды
				}

				// console.log('link-counter',counter);
				// console.log('link-result',result);

				counter++;

				return result; 
			}
		}
	}




	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(1.7).restart();
		model.stats.restart();
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


	//resize
	window.addEventListener('resize', view.simulationResize);

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
	function makeModel(jsonPath, callback){
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
			let currFullActivePath = getFullActivePath(myThis.activeNode);
			let nodes = myThis.nodes;
			let depth = myThis.activeNode.depth;

			// //don't show childrens when goTo
			// if(myThis.activeNode.goTo !== false){
			// 	widthChildrens = false;
			// }

			if(isShowAllTree || !depth || 1){
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

		function getFullActivePath(node = null){
			let currActivePath = getActivePath();
			let fullActivePath = [];

			if(node !== null){
				var fullChain = makeFullChain();
				fullChain(node, myThis.nodes[0]);
				return fullActivePath;
			}

			if( (currActivePath.length - 1) == 0 ){
				fullActivePath = currActivePath;
			}else{
				for (var i = currActivePath.length - 1; i > 0; i--) {
					var fullChain = makeFullChain();
					fullChain(currActivePath[i], currActivePath[(i-1)]);
				}
			}

			this.makeFullChain = makeFullChain;

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
			// wrapperStats.setAttribute('style',"font-size: 24px;z-index: 100;position: absolute;top: 0;");
			wrapperStats.setAttribute('style',"font-size: 24px;z-index: 100;position: absolute;top: 0;display: none;");

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
				restart: function(){
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

						if(tickCount == 150){
							simulation.alphaTarget(0);
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

	function makeView(model){
		var self = this;
		this.linkStr = linkStr;
		this.linkDistance = linkDistance;
		this.manyBodyStr = manyBodyStr;
		this.slideForce = slideForce;
		this.slideForceStr = slideForceStr;
		this.verticalForce = verticalForce;
		this.verticalForceStr = verticalForceStr;
		this.simulationResize = throttle(simulationResize,50);
		this.getNodeRadius = getNodeRadius;
		this.isolateForce = isolateForce;

		var width = window.innerWidth;
		var height = window.innerHeight;
		var verticalScreen = height/width > width/height ? true : false;

		//init
		setHtmlFontSize();

		//мощность силы линка(если линк это пружина то это сила ее натяжения)
		function linkStr(d){
			return forceSettings('linkStr', d);
		}
		//длина линки насколько понимаю в пикселях
		function linkDistance(d){
			return forceSettings('linkDistance', d);
		}
		//мощность силы отталкивания(если значение негатвное) или притягивания(елси значение позитивное) нод друг от друга
		function manyBodyStr(d){
			return forceSettings('manyBodyStr', d);
		}

		//сила задаеть горизонтальную координату для каждой ноды
		function slideForce (d){
			return forceSettings('slideForce', d);
		}
		//мощность силы которая задаеть горизонтальную координату для каждой ноды
		function slideForceStr (d){
			return forceSettings('slideForceStr', d);
		}

		//сила задает вертикальную координату для каждой ноды
		function verticalForce(d){
			return forceSettings('verticalForce', d);
		}
		//мощность силы которая задает вертикальную координату для каждой ноды
		function verticalForceStr(d){
			return forceSettings('verticalForceStr', d);
		}

		function forceSettings(force, d){
			let activeDepth = model.activeNode.depth;
			let scrollNext = true;
			//для мобилок, планшетов и всего у чего вертикальная оринетация экрана
			if(verticalScreen){
				if(!d.functional){
					//вертикальная о.э. - для обычных нод
					switch(force){
						//мощность силы линка
						case 'linkStr':
							return 0.065;
							break;
						//длина линки в пикселях
						case 'linkDistance':
							return 2;
							break;
						//мощность силы отталкивания(заряда)
						case 'manyBodyStr':
							return -1200;
							break;
						//задаеть горизонтальную координату для каждой ноды
						case 'slideForce':
							if(scrollNext){
								if(d.active){
									// return (width/2 + width/2*(d.depth - activeDepth)) - width/2;
									return (width/2 + width/2*(d.depth - activeDepth)) - width/1.2;
								}else{
									// return (width/5 + width/2*(d.depth - activeDepth)) - width/2;
									return (width/5 + width/2*(d.depth - activeDepth)) - width/1.3;
								}
							}else{
								// return (width/4 + width/2*(d.depth - activeDepth+1)) - width/2;
								return (width/4 + width/2*(d.depth - activeDepth+1)) - width/1.2;
							}
							break;
						//мощность силы которая задаеть горизонтальную координату
						case 'slideForceStr':
							return 0.12;
							break;
						//сила задает вертикальную координату для каждой ноды
						case 'verticalForce':
							if(scrollNext){
								if(d.active){
									return (height/18 + (height*4/5)*(d.depth - activeDepth)) - height/2;
								}else{
									return (height/18 + (height*4/5)*(d.depth - activeDepth)) - height/2;
								}
							}else{
								return (height/18 + (height*4/5)*(d.depth - activeDepth+1)) - height/2;
							}
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return 0.05;
							break;
						default:
							throw new Error('Неизвестная cила.');
							break;
					}
				}else{
					//вертикальная о.э. - для функциональныхи кнопок
					switch(force){
						//мощность силы линка
						case 'linkStr':
							return 0;
							break;
						//длина линки в пикселях
						case 'linkDistance':
							return 4;
							break;
						//мощность силы отталкивания(заряда)
						case 'manyBodyStr':
							return 0;
							break;
						//задаеть горизонтальную координату для каждой ноды
						case 'slideForce':
							switch (d.function){
								case 'back':
									// return (width/2 + width/2*(d.depth - activeDepth)) - (width/1.3 + getNodeRadius()*4);
									// console.log( (width/10 + getNodeRadius(d)) - width/2 );
									return (width/10 + getNodeRadius(d)) - width/1.5;
									break;
								case 'menu':
									// return (width/2 + width/2*(d.depth - activeDepth)) -  (getNodeRadius()*4 + 150);
									// console.log( width/2 - (width/10 + getNodeRadius(d)) );
									return width/2 - (width/10 + getNodeRadius(d));
									break;
								default:
									throw new Error('Неизвестная кнопка.')
									break;
							}
							break;
						//мощность силы которая задаеть горизонтальную координату
						case 'slideForceStr':
							return 0.3;
							break;
						//сила задает вертикальную координату для каждой ноды
						case 'verticalForce':
							return height/2 - (height/100 + getNodeRadius(d));
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return 0.3;
							break;
						default:
							throw new Error('Неизвестная cила.');
							break;
					}
				}
			}else{//для горизонтальной ориентации екрана
				if(!d.functional){
					//горизонтальная о.э. - для обычных нод
					switch(force){
						//мощность силы линка
						case 'linkStr':
							return 0.3;
							break;
						//длина линки в пикселях
						case 'linkDistance':
							return 400;
							break;
						//мощность силы отталкивания(заряда)
						case 'manyBodyStr':
							return -2000;
							break;
						//задаеть горизонтальную координату для каждой ноды
						case 'slideForce':
							if(scrollNext){
								if(d.active){
									// console.log('active-x:',(width/2 + width/2*(d.depth - activeDepth)) - width/2);
									return (width/2 + width/2*(d.depth - activeDepth)) - width/1.7;
								}else{
									// console.log('child-x:',(width/5 + width/2*(d.depth - activeDepth)) - width/2);
									return (width/5 + width/2*(d.depth - activeDepth)) - width/2;
								}
							}else{
								return (width/4 + width/2*(d.depth - activeDepth+1)) - width/2;
							}
							break;
						//мощность силы которая задаеть горизонтальную координату
						case 'slideForceStr':
							return 0.05;
							break;
						//сила задает вертикальную координату для каждой ноды
						case 'verticalForce':
							return d.active ? -(height*2/15) : 0;
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return 0.035;
							break;
						default:
							throw new Error('Неизвестная cила.');
							break;
					}
				}else{
					//горизонтальная о.э. - для функциональныхи кнопок
					switch(force){
						//мощность силы линка
						case 'linkStr':
							return 0;
							break;
						//длина линки в пикселях
						case 'linkDistance':
							return 4;
							break;
						//мощность силы отталкивания(заряда)
						case 'manyBodyStr':
							return 0;
							break;
						//задаеть горизонтальную координату для каждой ноды
						case 'slideForce':
							switch (d.function){
								case 'back':
									// return (width/2 + width/2*(d.depth - activeDepth)) - (width/1.3 + getNodeRadius()*4);
									// console.log( (width/10 + getNodeRadius(d)) - width/2 );
									return (width/20 + getNodeRadius(d)) - width/2;
									break;
								case 'menu':
									// return (width/2 + width/2*(d.depth - activeDepth)) -  (getNodeRadius()*4 + 150);
									// console.log( width/2 - (width/10 + getNodeRadius(d)) );
									return width/2 - (width/10 + getNodeRadius(d));
									break;
								default:
									throw new Error('Неизвестная кнопка.')
									break;
							}
							break;
						//мощность силы которая задаеть горизонтальную координату
						case 'slideForceStr':
							return 0.05;
							break;
						//сила задает вертикальную координату для каждой ноды
						case 'verticalForce':
							return height/2 - (height/100 + getNodeRadius(d));
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return 0.1;
							break;
						default:
							throw new Error('Неизвестная cила.');
							break;
					}
				}
			}
		}

		function simulationResize(resizeEvent){
			width = window.innerWidth;
			height = window.innerHeight;
			verticalScreen = height/width > width/height ? true : false;
			svgViewPort = [-width / 2, -height / 2, width, height];

			setHtmlFontSize();

			svg
			.attr("viewBox", svgViewPort);

			viewPort
			.style('width', width+'px')
			.style('height', height+'px');

			simulation.force("link").links(model.links);
			simulation.force("charge").strength(self.manyBodyStr);
			simulation.force("slideForce").strength(self.slideForceStr);
			simulation.force("verticalForce").strength(self.verticalForceStr);
			// simulation
			// .force("link", d3.forceLink(links).id(d => d.id).strength(view.linkStr).distance(view.linkDistance))
			// .force("charge", d3.forceManyBody().strength( view.manyBodyStr ))
			// .force("slideForce", d3.forceX(view.slideForce).strength(view.slideForceStr))
			// .force("y", d3.forceY().strength(0.015))
			simulation.alpha(1).restart();
			model.stats.restart();
		}

		function setHtmlFontSize(){

			//коефициент сколько екранного пространства должена занимать активаная надпись
			let sizeCoeficient = verticalScreen ? 1.3 : 0.29;
			//значение в px сколько екранного пространства должена занимать активаная надпись
			let allTextWidth = width*sizeCoeficient;
			//примерное количесто букв
			let lettersNumber = 10;
			//коефициент буквы до размера шрифта
			let letters2fzCoeficient = 0.53;
			//значение в пикселях для 1 буквы
			let letter_fz = lettersNumber*letters2fzCoeficient;
			
			fz = allTextWidth/letter_fz;

			document.documentElement.style.fontSize = fz+'px';
		}


		function getNodeRadius(node){
			// console.dir(getNodeElementById(node.id));
			// return width/48;
			return 70;
		}

		function isolateForce(force, filter) {
			var initialize = force.initialize;
			force.initialize = function() { initialize.call(force, model.nodesToDisplay.filter(filter)); };
			return force;
		}

	}

});