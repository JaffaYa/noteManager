document.addEventListener( 'DOMContentLoaded', function( event ) {

	var appleDevices = ['iPhone'];
    if (appleDevices.indexOf(navigator.platform) > -1) {
        $("#fullscreenButton").hide();
    }
	
	var bodyClass = document.querySelector('body'); // temp
	var vActiveBack = document.querySelector('.v-active-back'); // temp
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

	document.querySelector('.v-active-btn').addEventListener('click', function(event){
		bodyClass.classList.toggle('v-active');
		vActiveBack.classList.toggle('hide');
		vActiveBack.classList.toggle('show');
		document.querySelector('.help-message').classList.toggle('hide');
		document.querySelector('.help-message').classList.toggle('show');
		setTimeout(function(){
			document.querySelector('.help-message').classList.toggle('show');
			document.querySelector('.help-message').classList.toggle('hide');
		}, 2000, simulation);
		document.querySelector('.paranja').classList.remove('active');
		bodyClass.classList.remove('menu-show', 'page-show'); // temp
	});

	document.querySelector('.v-active-back').addEventListener('click', function(event){
		bodyClass.classList.remove('v-active');
		this.classList.remove('show');
		this.classList.add('hide');
	});

	var debug = false;

	//graphic variables
	var width = window.innerWidth;
	var height = window.innerHeight;
	var verticalScreen = (height/width > width/height) || (width < 500) ? true : false;

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
	var showNodeDelay = 35; //задерка перед появлением ноды
	// var showSlideDelay = verticalScreen ? 550 : 250; //задерка сдвига перед появлением
	// var hideSlideDelay = verticalScreen ? 350 : 350; //задерка сдвига перед прятанием ** delay before link hide
	// var hideLinkDelay = verticalScreen ? 150 : 250; //задерка сдвига перед прятанием ** delay before link hide
	var showSlideDelay = verticalScreen ? 200 : 250; //задерка сдвига перед появлением
	var showLinkDelay = verticalScreen ? 35 : 35; //задерка сдвига перед появлением
	var hideSlideDelay = verticalScreen ? 0 : 0; //задерка сдвига перед прятанием ** delay before link hide
	var hideLinkDelay = verticalScreen ? 0 : 0; //задерка сдвига перед прятанием ** delay before link hide
	var showCssDuration = 700; //длина анимации появления в css
	var hideNodeCssDuration = 700; //длина анимации прятания ноды в css
	var hideLinkCssDuration = 700; //длина анимации прятания линка в css
	var startDelay = 1750; //доп задерка при старте


	// var deleteDelay = verticalScreen ? 900 : 800; //задержка до удаления из симуляции, но не с экрана
	var deleteDelay = verticalScreen ? 650 : 650; //задержка до удаления из симуляции, но не с экрана
	var firstScrean = true;
	//еще есть возможность добавить фукциональные клавиши(назад, меню)
	//в последовательность этой анимации - они будут отбражаться в последнею очередь

	//и еще по идеи можно сдлеать что бы пропадали линки и ноды тоже по очереди

	let backButtonPermision = true;
	let backButtonDelay = verticalScreen ? 950 : 950;

	let animState = make_animationState();


	//email send
	var emailUserId = null;
	var emailProvider = null;
	var emailTemplate = null;


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
		.attr("style", "position: absolute;left: 50%;top: 50%;");

	var htmlNodes = nodesCont.selectAll("div.node");
	var svgLinks = linksCont.selectAll("line");

	var jsonName = getParameterByName('jn');

	Math.randomDec = function (min, max, decimals) {
		return (Math.random() * (max - min) + min).toFixed(decimals || 2);
	};

	var jsonVersion = Math.randomDec(0, 999, 3);

	// if (!!jsonName) {
	// 	window.localStorage.setItem('jn', jsonName);
	// } else {
	// 	jsonName = window.localStorage.getItem('jn');
	// }
	
	// if no query params and no store (default value)
	if (!jsonName) {
		jsonName = 'v-1';
	}


	let url = `./json/${jsonName}.json?v=${jsonVersion}`
	console.log(url);

	function fileExists(url) {
		if(url){
			var req = new XMLHttpRequest();
			req.open('HEAD', url, false);
			req.send();
			return req.status === 200;
		} else {
			return false;
		}
	}
	if (!fileExists(url)) url = `./json/v-1.json?v=${jsonVersion}`

	window.model = new makeModel(url, simInit);
	//?jn=graphdata&node=1

	model.stats.enable(); // statistics enable
	// model.admin.set(false); // admin enable
	// model.showAllTree(); // all tree enable

	window.view = new makeView(model);

	var browserNavButtons = false;
	//on change url
	window.onpopstate = function(historyPopEvent) {
		browserNavButtons = true;

		let id = null;
		if(historyPopEvent.state){
			id = historyPopEvent.state.id;
		}
		if(id){
			let currActivePath = model.getActivePath();
			let animationRun = animState.get();

			//рефакторинг:
			//переделать backButton	и forwardButton на 
			//goto node

			if(backButtonPermision && !animationRun){
				backButtonPermision = false;

				if(model.isInArrayId(id,currActivePath)){
					model.userData.push(null, 'браузер назад');
					// console.dir('браузер назад');
					model.backButton(deleteDelay, deleteDelayCallback);
				}else{
					model.userData.push(null, 'браузер вперед');
					// console.dir('браузер вперед');
					model.forwardButton(id, deleteDelay, deleteDelayCallback);
				}

				setTimeout( () => {
					backButtonPermision = true;
				}, backButtonDelay );

			}else{
				return false;
			}
			
			// if(model.isInArrayId(id,currActivePath)){
			// 	model.userData.push(null, 'браузер назад');
			// 	// console.dir('браузер назад');
			// 	model.backButton(deleteDelay, deleteDelayCallback);
			// }else{
			// 	model.userData.push(null, 'браузер вперед');
			// 	// console.dir('браузер вперед');
			// 	model.forwardButton(id, deleteDelay, deleteDelayCallback);
			// }


			svgLinks = buildLinks(model.links);
			htmlNodes = buildNodes(model.nodesToDisplay);

			simulation.nodes(model.nodesToDisplay);
			simulation.force("link").links(model.links);
			// simulation.alphaTarget(0.1).restart();
			// simulation.alpha(0.5).restart();

			let time = 0;

			simulation.alphaTarget(0.5).restart();
			

			if(verticalScreen){
				setTimeout(function(simulation){
					simulation.alphaTarget(0.2);
					simulation.velocityDecay(0.4) 
				}, time+0, simulation);
				setTimeout(function(simulation){
					simulation.alphaTarget(0.5);
					simulation.velocityDecay(0.4) 
				}, time+150, simulation);
				setTimeout(function(simulation){
					simulation.alphaTarget(0);
					simulation.velocityDecay(0.9) 
				}, time+750, simulation);
			}else{
				setTimeout(function(simulation){
					simulation.alphaTarget(0.05);
					simulation.velocityDecay(0.7) 
				}, time+0, simulation);
				setTimeout(function(simulation){
					simulation.alphaTarget(0.1);
					simulation.velocityDecay(0.9) 
				}, time+500, simulation);
				setTimeout(function(simulation){
					simulation.alphaTarget(0.5);
					simulation.velocityDecay(0.5) 
				}, time+750, simulation);
				setTimeout(function(simulation){
					simulation.alphaTarget(0);
					simulation.velocityDecay(0.9) 
				}, time+1000, simulation);
			}

			animState.start();
			model.stats.restart();
		}

		browserNavButtons = false;
	};





	function simInit(){

		//init first data

		window.simulation = d3.forceSimulation(model.nodesToDisplay)
		.force("link", d3.forceLink(model.links).id(d => d.id).strength(view.linkStr).distance(view.linkDistance))
		.force("charge", view.isolateForce(d3.forceManyBody().strength(view.manyBodyStr).distanceMax(Infinity), d => !d.functional ) )// || d.function == 'logo'
		// .force("center", d3.forceCenter(0,0))
		.force("slideForce", d3.forceX(view.slideForce).strength(view.slideForceStr))
		.force("verticalForce", d3.forceY(view.verticalForce).strength(view.verticalForceStr))
		.force("radial", d3.forceRadial(view.radial).strength(view.radialStr).x(view.radialX()).y(view.radialY()) )
		.force("collide", view.isolateForce(d3.forceCollide().radius(view.getColideRadius).strength(view.colideRadiusStr()).iterations(view.getColideRadiusIterations()),view.collideForceIsolate))
		.force("order", d3.forceY(view.orderForce).strength(view.orderForceStr))


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

		//emailing init
		if(emailUserId){
			emailjs.init(emailUserId);
		}else{
			console.error('Incorrect user id.');
		}

		firstScrean = false;
		model.stats.restart();
		animState.start();

		simulation.on("tick", simulationTick);
		simulation.on("end", animationEnd);
	}




	function bubleClick(d, i, arr) {
		//prevent click by click in input tag
		if(window.event.type == 'click'){
			if( window.event.target.nodeName == 'INPUT' || 
				window.event.target.nodeName == 'TEXTAREA'
				){
				if( view.isMobileWidth() ){
					let nodeElem = view.findParenNodeElement(window.event.target);
					nodeElem.classList.add('inputMobile');
					bodyClass.classList.add('inputMobile-active');
					let node = model.getNodeById(nodeElem.__data__.id);
					node.fx = 0;
					node.fy = 0;
					model.mobileInpuntActive = true;
				}
				return;
			}
		}
		
		let backButton = false;

		//goToUrl
		if(d.goToUrl){
			// window.location.href = d.goToUrl;
			window.open(d.goToUrl);
			return;
		}


		
		//validate required node
		if(d.required !== undefined){
			if( !model.checkRequiredNode(d.required) ){
				return;
			}
		}


		if(!d.active){
			// playBubble(); // sound off
		}

		//apply click function
		if(d.functional){
			switch (d.function){
				case 'back':
					let animationRun = animState.get();

					if(backButtonPermision && !animationRun){
						//рефакторинг:
						//переделать логику кнопки назад
						//что бы она только устанавливала ноду
						//а запусткать весь пересчет поже для всех по cliсkOnNode
						model.userData.push(d);
						model.backButton(deleteDelay, deleteDelayCallback);
						backButton = true;
						backButtonPermision = false;
						setTimeout( () => {
							// console.log(backButtonPermision);
							backButtonPermision = true;
						}, backButtonDelay );
					}else{
						return false;
					}
					break;
				case 'menu':
					popupActive('menu');
					bodyClass.classList.toggle('menu-show'); // temp
					break;
				case 'logo':
					bodyClass.classList.toggle('v-active');
					vActiveBack.classList.toggle('show');
					vActiveBack.classList.toggle('hide');
					document.querySelector('.help-message').classList.toggle('show');
					document.querySelector('.help-message').classList.toggle('hide');
					setTimeout(function(){
						document.querySelector('.help-message').classList.toggle('show');
						document.querySelector('.help-message').classList.toggle('hide');
					}, 2000, simulation);
					break;
				default:
					throw new Error('Неизвестная нода.')
			}
		}
		//open iframe
		if(d.iframe){
			var iframe = document.querySelector('.iframe iframe');
			var iframeSrc = iframe.getAttribute("src");
			if(iframeSrc !=  d.iframe){
				iframe.setAttribute("src", d.iframe);
			}
			popupActive('iframe');
			bodyClass.classList.add('page-show'); // temp
		}
		//send email
		if(d.sendMail){
			//тут формируется {{{nodeInputs}}}
			//берем ключи обьекта model.nodeInputs и делаем с них массив типа "ключ - значение"
			let nodeInputsText = Object.keys(model.nodeInputs).map(function(key) {
				//шаблон 1 значения масива "ключ - значение"
				let input = model.nodeInputs[key];
				let keyText = input.mailname ? input.mailname : key;
		  		return keyText + ' - ' + input.val;
			}).join('<br>');//склеиваем масиив в 1 строчку с помощью <br>

			//тут формируется {{{shortUserData}}}
			let shortUserDataText = '';
			model.path.fullActivePath.get().map(d => {
				let div = document.createElement('div');
				div.innerHTML = d.label;
				return model.userData.getElementText(div);
			}).forEach( (item, i) => {
				if(!(i % 2)){
					shortUserDataText += '<b>'+item+'</b><br>';
				}else{
					shortUserDataText += item+'<br><br>';
				}
			});
			//.join('<br>');

			//тут формируется {{{userData}}}
			//запрашиваем массив всех действий пользователя и склеиваем его в строку
			let userDataText = model.userData.get().join('<br><br>');//склеиваем масиив в 1 строчку с помощью <br><br> 
		
			// console.log(shortUserDataText);
			sendMail(nodeInputsText, shortUserDataText, userDataText);
		}

		let doActive = model.isSlide(d);
		//if has no child
		if(!doActive){
			return;
		}

		//any way drag start simulation
		// // prevent simulation if click on the same node
		// let currActive = model.activeNode;
		// if(currActive.id == d.id) return;

		//calculate new model
		if(!backButton){
			model.cliсkOnNode(d, deleteDelay, deleteDelayCallback);
		}

		view.scrollNext = model.isSlide(model.activeNode);
	
		svgLinks = buildLinks(model.links);
		htmlNodes = buildNodes(model.nodesToDisplay);

		simulation.nodes(model.nodesToDisplay);
		simulation.force("link").links(model.links);
		// simulation.alphaDecay(0.022); //0.022 // скорость затухания alpha
		// simulation.alphaTarget(0.05).restart(); // чем меньше, тем меньше сила
		// simulation.alpha(1).restart();

		// setTimeout(function(simulation){
		// 	console.log('stop');
		// 	simulation.alphaTarget(0);
		// 	simulation.alphaDecay(0.0228);
		// }, deleteDelay+100, simulation);

		let time = 0;

		if(verticalScreen){
			setTimeout(function(simulation){
				simulation.alphaTarget(0.2);
				simulation.velocityDecay(0.4) 
			}, time+0, simulation);
			setTimeout(function(simulation){
				simulation.alphaTarget(0.5);
				simulation.velocityDecay(0.4) 
			}, time+150, simulation);
			setTimeout(function(simulation){
				simulation.alphaTarget(0);
				simulation.velocityDecay(0.9) 
			}, time+750, simulation);
		}else{
			setTimeout(function(simulation){
				simulation.alphaTarget(0.1);
				simulation.velocityDecay(0.5) 
			}, time+0, simulation);
			setTimeout(function(simulation){
				simulation.alphaTarget(0.3);
				simulation.velocityDecay(0.9) 
			}, time+500, simulation);
			setTimeout(function(simulation){
				simulation.alphaTarget(0.9);
				simulation.velocityDecay(0.9) 
			}, time+750, simulation);
			setTimeout(function(simulation){
				simulation.alphaTarget(0);
				simulation.velocityDecay(0.9) 
			}, time+1000, simulation);
			// setTimeout(function(simulation){
			// 	simulation.alphaTarget(0.5);
			// 	simulation.velocityDecay(0.9) 
			// }, time+0, simulation);
			// setTimeout(function(simulation){
			// 	simulation.alphaTarget(0.5);
			// 	simulation.velocityDecay(0.7) 
			// }, time+500, simulation);
			// setTimeout(function(simulation){
			// 	simulation.alphaTarget(0);
			// 	simulation.velocityDecay(0.9) 
			// }, time+750, simulation);
		}

		animState.start();
		model.stats.restart();

		return;
	}



	function simulationTick(){
		model.stats.tick();

		let tickCount = model.stats.getTickCount();

		// simulation.alphaDecay(simulation.alphaDecay() + 0.002);
		// if(tickCount == 150){
		// 	simulation.alphaTarget(0);
		// }
		// if(tickCount == 500){
		// 	simulation.alphaDecay(0.0228).restart();
		// }

		// console.log('alpha:'+Math.round( simulation.alpha()*10000)/10000   );
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

	function make_animationState(){
		let animationFlag = false;
		//limit time of animation state
		let timerLimiter = 1300; //not longer that 1s

		let startTime;

		return {
			start: function(){
				startTime = Date.now();
				return animationFlag = true;
			},
			stop: function(){
				return animationFlag = false;
			},
			get: function(){
				if( (Date.now() - startTime) > timerLimiter ){
					animationFlag = false;
				}

				return animationFlag;
			}
		};
	}

	function animationEnd(e){
		animState.stop();
		// console.log(animState.get());
	}

	function deleteDelayCallback(model){
		svgLinks = buildLinks(model.links);
		htmlNodes = buildNodes(model.nodesToDisplay);

		simulation.nodes(model.nodesToDisplay);
		simulation.force("link").links(model.links);
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
		.classed('show', d => d.display)
		.classed('hide', d => {
			let activeNodeCildren = model.activeNode.children
			if( d.active ) return false;
			if( d.functional ) return false;
			if( activeNodeCildren.includes(d.id) ) return false;
			return true;
		});	

		// d3nodes
		// .transition()
	 //    .duration(5000)
	 //    .easeVarying(d => d3.easePolyIn.exponent(d.exponent))
		

		//enter
		d3newNodes = d3nodes.enter().append('div')
		.classed('node', true)
		.classed('btn-functional', d => d.functional)
		.classed('btn-back', d => d.function == 'back')
		.classed('btn-menu', d => d.function == 'menu')
		.classed('btn-logo', d => d.function == 'logo')
		.classed('active', d => d.active)
		.attr("node-id", d => d.id)

		.call(
			d3.drag(simulation)
			.clickDistance(80)
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


		let d3newNodesLabels = d3newNodes.append("div")
		.classed('v-content', true)
		.html(d => model.setLabelVar(d.label) );

		d3newNodesLabels
		// .each(function(d, i) {
		// 	// view.setTextareaHeight(this);
		// })
		.on('mouseenter', view.cursor.onMouseHover)
		.on('mouseleave', view.cursor.onMouseHoverOut)
		.on('mousedown', view.cursor.onMouseDown)
		.on('mouseup', view.cursor.onMouseUp);

		//set handler for inputs
		d3newNodesLabels
		.select('input')
		.attr("value", d => {
			let div = document.createElement('div');
			div.innerHTML = d.label;
			let input = div.querySelector('input');
			if(input){
				let name = input.getAttribute('name');
				if(model.nodeInputs[name] && model.nodeInputs[name].val){
					return model.nodeInputs[name].val;
				}
			}
			return '';
		})
		.on('change', e => {
			let name = d3.event.target.getAttribute('name');
			let mailname = d3.event.target.getAttribute('mailname');
			model.nodeInputs[name] = {
				mailname: mailname,
				val: d3.event.target.value
			};	
			model.userData.push(null, 'ввод в инпут '+name+' значения '+d3.event.target.value);
		})
		.on('blur', e => {
			//remove mobile class on unfocus
			let nodeElem = view.findParenNodeElement(d3.event.target);
			nodeElem.classList.remove('inputMobile');
			bodyClass.classList.remove('inputMobile-active');
			let node = model.getNodeById(nodeElem.__data__.id);
			node.fx = null;
			node.fy = null;
			model.mobileInpuntActive = false;
			simulation.alpha(0.5).restart();

			//remove error class on unfocus
			nodeElem.classList.remove('error');
		});

		//set handler for textarea
		d3newNodesLabels
		.select('textarea')
		// .attr("value", d => {
		.html( d => {
			let div = document.createElement('div');
			div.innerHTML = d.label;
			let textarea = div.querySelector('textarea');
			if(textarea){
				let name = textarea.getAttribute('name');
				if(model.nodeInputs[name] && model.nodeInputs[name].val){
					return model.nodeInputs[name].val;
				}
			}
			return '';
		})
		.on('change', e => {
			let name = d3.event.target.getAttribute('name');
			let mailname = d3.event.target.getAttribute('mailname');
			model.nodeInputs[name] = {
				mailname: mailname,
				val: d3.event.target.value
			};	
			model.userData.push(null, 'ввод в textarea '+name+' значения '+d3.event.target.value);
		})
		.on('blur', e => {
			//remove mobile class on unfocus
			let nodeElem = view.findParenNodeElement(d3.event.target);
			nodeElem.classList.remove('inputMobile');
			bodyClass.classList.remove('inputMobile-active');
			let node = model.getNodeById(nodeElem.__data__.id);
			node.fx = null;
			node.fy = null;
			model.mobileInpuntActive = false;
			simulation.alpha(0.5).restart();

			//set textarea size in inactive state 
			view.setTextareaHeight(d3.event.target);

			//remove error class on unfocus
			nodeElem.classList.remove('error');
		})
		.each(function(d, i) {
			view.setTextareaHeight(this);
		})
		.on('input', e => {
			view.setTextareaHeight(d3.event.target);
		});


		d3newNodes.append("div")
		.classed('c1', true);

		d3newNodes.append("div")
		.classed('c2', true);

		if(debug){
			d3newNodes.append("div")
			.classed('c3', true)
			.style('width', d => view.getColideRadius(d)*2+'px')
			.style('height', d => view.getColideRadius(d)*2+'px')
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
			var counter = 0;

			return function(d){
				var result = 0;

				if(!firstScrean){
					result = counter * showNodeDelay + counter * showLinkDelay + showSlideDelay;//showCssDuration тут по идеи линка
					// result = counter * showNodeDelay + counter * showSlideDelay;//showCssDuration тут по идеи линка
				}else{
					result = counter * showNodeDelay + counter * showLinkDelay + startDelay;
					// result = counter * showNodeDelay + counter * showLinkDelay + startDelay;
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

		var strokeWidth = view.getLinkWidth();
		//enter
		d3newLinks = d3links
		.enter().append('line')
		// .attr("stroke-width", d => d.value)
		.attr('stroke-width', strokeWidth)
		.attr('stroke-dasharray', d => d.dashed ? '8 11' : 'unset');

		//add smooth animation
		d3newLinks
		// // .filter( d => showIds.includes(d.target.id) )
		.transition()
		.delay(makelinkDelay())
		.on('start', function repeat() {
			this.classList.add('show');
		});



		//exit
		d3links.exit()
		.transition()
		// .delay(hideLinkDelay)
		.delay(makehideLinkDelay)
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

		function makehideLinkDelay(){
			//if slide not goTo hide link without delay
			let node = model.activeNode;
			if(node.goTo){
				return hideLinkDelay;
			}else{
				return 0;
			}
		}

		function makelinkDelay(){
			var counter = 0;

			return function(d){
				var result = 0;

				if(!firstScrean){
					// result = counter * showLinkDelay + counter * showNodeDelay + showSlideDelay - 500;
					result = counter * showLinkDelay + counter * showNodeDelay + showSlideDelay + showLinkDelay;
				}else{
					// result = counter * showLinkDelay + counter * showNodeDelay + showCssDuration - 500 + startDelay;//showCssDuration тут по идеи ноды
					result = counter * showLinkDelay + counter * showNodeDelay + showSlideDelay + showLinkDelay + startDelay;//showCssDuration тут по идеи ноды
				}

				// console.log('link-counter',counter);
				// console.log('link-result',result);

				counter++;

				return result; 
			}
		}
	}




	function dragstarted(d) {
		// if (!d3.event.active) simulation.alphaTarget(1.7).restart();
		if(!model.mobileInpuntActive){
			if (!d3.event.active) 
			if(verticalScreen){
				simulation.alphaTarget(0.5).restart(); 
				simulation.velocityDecay(0.2);
			}else{
				simulation.alphaTarget(0.5).restart(); 
				simulation.velocityDecay(0.2);
			}
			model.stats.restart();
			d.fx = d.x;
			d.fy = d.y;
		}
	}

	function dragged(d) {
		if(!model.mobileInpuntActive){
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}
	}

	function dragended(d) {
		if(!model.mobileInpuntActive){
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
	}


	//resize
	window.addEventListener('resize', view.simulationResize);

	// document.addEventListener('keypress', keyFunc, false);

	function keyFunc(event){
		// console.dir(event);
		switch (event.code){
			case 'KeyF':
			bodyFullScreanTogle();
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

	//send email
	function sendMail(nodeInputsText, shortUserDataText, userDataText){
		var templateParams = {
			nodeInputs: nodeInputsText,
			shortUserData: shortUserDataText,
			userData: userDataText
		};

		if(emailProvider && emailTemplate){
			emailjs.send(emailProvider, emailTemplate, templateParams)
			.then(function(response) {
				console.log('SUCCESS!', response.status, response.text);
			}, function(error) {
				console.log('FAILED...', error);
			});
		}else{
			console.error('Can\'t send email.');
			console.log('emailProvider - '+emailProvider);
			console.log('emailTemplate - '+emailTemplate);
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
		this.forwardButton = forwardButton;
		this.backButton = backButton;
		this.updateNodesToDisplay = updateNodesToDisplay;
		this.updateLinks = updateLinks;
		this.isInArrayId = isInArrayId;
		this.isSlide = isSlide;
		this.userData = new makeUserDataPath();
		this.nodeInputs = {};
		this.mobileInpuntActive = false;
		this.checkRequiredNode = checkRequiredNode;
		this.path = new Path();
		this.setLabelVar = setLabelVar;
		/*
		* node = {
		*	id: int,
		*	active: bool,
		*	activePath: bool,
		*	depth: int,
		*	leftDepth: int, //for left animation
		*	label: str,
		*	parents: arr,
		*	children: arr,
		*	functional: bool,
		*	function: str,
		*	addNew: bool,
		*	display: bool,
		*	sendMail: bool,
		*	order: int,
		*	goTo: int.id,
		*	goToUrl: str,
		*	required: int.id,
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
		var backButtonFlag = false;
		var oneLinkNode = null;
		var oneLinkNodeFrom = null;



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
			emailUserId = jsonData.emailUserId || undefined;
			emailProvider = jsonData.emailProvider || undefined;
			emailTemplate = jsonData.emailTemplate || undefined;
			myThis.nodes = nodes = jsonData.nodes;
			//добавить номализацию строк
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].id = nodes[i].id*1;
				nodes[i].active = false;
				nodes[i].activePath = false;
				nodes[i].depth = undefined;
				nodes[i].leftDepth = undefined;
				nodes[i].children = [];
				nodes[i].functional = false;
				nodes[i].function = '';
				nodes[i].addNew = false;
				nodes[i].display = false;
				nodes[i].sendMail = !!nodes[i].sendMail || false;
				nodes[i].order = nodes[i].order*1 || undefined;
				nodes[i].goTo = nodes[i].goTo*1 || undefined;
				nodes[i].required = nodes[i].required*1 || undefined;
			}
			let startNode = setInitNode();
			makeNodeActive(startNode);
			myThis.userData.push(startNode);
			myThis.path.currentActivePath.push(startNode);
			updateNodes();

			function setInitNode(){
				// // console.dir(window.location);
				// let get = window.location.search;
				let id = getParameterByName('node');
				// if(get){
				// 	id = get.split('=')[1];
				// }
				if(id === null){
					id = 1;
				}
				return getNodeById(id);
			}
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

		function setNodesChildrens(){
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

			//add browser history state if it's no
			if(!browserNavButtons){
				let jsonName = getParameterByName('jn');
				let url = ''
				if (jsonName) url += '?jn=' + jsonName
				if (url.length> 0) url += '&node='+currNode.id
				else url = url += '?node='+currNode.id
				// window.location = "#id:"+currNode.id;
				history.pushState({ id: currNode.id, jn: jsonName }, '', url);
			}
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
					if(!nodes[i].display && !oneLinkNode) return;
					//only one link on slide
					if(oneLinkNode){
						if(oneLinkNode.id == nodes[i].id){
							if(oneLinkNodeFrom){
								if(parent == oneLinkNodeFrom.id){
									myThis.links.push({
										source: getNodeById(parent*1),
										target: nodes[i],
										dashed: nodes[i].addNew,
										value: 2
									});
								}
							}
							return;	
						}
					}

					//push new link
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

		function setLeftDepth(node, goToNode) {
			if(node.functional || goToNode.functional) return;

			//click on the same node
			if(node.id == goToNode.id) return;

			// // unset left depth for all nodes
			// if(1 == goToNode.id){
			// 	let nodes = myThis.nodes;

			// 	for (var i = 0; i < nodes.length; i++) {
			// 		nodes[i].leftDepth = false;
			// 	}
			// 	return;
			// }

			//set left depth
			let previosDepth = node.leftDepth || node.depth;
			// console.log('previosNode',previosDepth);

			goToNode.leftDepth = (previosDepth + 1);
			if(!goToNode.parents.includes(node.id)){
				goToNode.parents.push(node.id);
			}
			for (var i = 0; i < goToNode.children.length; i++) {
				let child = getNodeById(goToNode.children[i]);
				child.leftDepth = (previosDepth + 2);
			}
		}

		// var timerDDId = null;
		function cliсkOnNode(node, deleteDelay = false, callback = function(){}){

			let previosNode = myThis.activeNode;
			let goToFlag = false;
			if(node.goTo !== false){
				var goToNode = getNodeById(node.goTo);
				if(goToNode){
					goToFlag = true;
					previosNode = node;
					node = goToNode;
					//one link slide
					oneLinkNode = goToNode;
					oneLinkNodeFrom = previosNode;
				}
			}

			if(goToFlag){
				myThis.userData.push(previosNode);
			}
			myThis.userData.push(node);


			if(goToFlag){
				myThis.path.currentActivePath.push(previosNode);
			}
			if(!backButtonFlag){
				myThis.path.currentActivePath.push(node);
			}


			// backButtonFlag и goToFlag по сути выполняют одну логику
			// из - за того что в backButtonFlag устанавлеваеться каждый раз
			// а не только при goTo мб будут баги
			if(!backButtonFlag || goToFlag){
				setLeftDepth(previosNode, node);
			}


			// console.log(node.leftDepth || node.depth  );

			makeNodeActive(node);
			updateNodes(deleteDelay);

			//reser goTo var
			backButtonFlag = false;
			oneLinkNode = null;
			oneLinkNodeFrom = null;


			if(deleteDelay){
				// clearTimeout(timerDDId);
				timerDDId = setTimeout(function(model) {
					model.updateNodesToDisplay(false);
					model.updateLinks();
					callback(model);
				}, deleteDelay, myThis);
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

		function isSlide(node){
			if(node.function == 'back') return true;
			if(node.functional) return false;
			let hasChild = node.children.length > 0
			let hasgoTo = node.goTo !== undefined;
			return (hasChild || hasgoTo) && !node.iframe;
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
									leftDepth: undefined,
									label: "+",
									parents: [nodes[i].id],
									children: [],
									functional: false,
									function: '',
									addNew: true,
									display: false,
									sendMail: false,
									order: undefined,
									goTo: undefined,
									goToUrl: undefined,
									required: undefined
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
			// addFunctionalButton(10000, 'назад', 'back');
			// addFunctionalButton(10001, 'меню', 'menu');
			addFunctionalButton(10000, '<div class="icon"><img src="img/icons/back.png"></div>back', 'back');
			addFunctionalButton(10001, '<div class="icon"><img src="img/icons/menu-2.png"></div>menu', 'menu');
			addFunctionalButton(10002, '<div class="logo-main"><img src="img/logo-anim-500.gif"></div>', 'logo');
		}

		function addFunctionalButton(id, name, function1){
			if(!getNodeById(id)){
				myThis.nodes.push({
					id: id,
					active: false,
					activePath: false,
					depth: undefined,
					leftDepth: undefined,
					label: name,
					parents: [],
					children: [],
					functional: true,
					function: function1,
					addNew: false,
					display: false,
					sendMail: false,
					order: undefined,
					goTo: undefined,
					goToUrl: undefined,
					required: undefined
				});
			}
		}

		function backButton(deleteDelay = false, callback = function(){}){
			let currActivePath = getActivePath();

			//if firs node active
			if(currActivePath.length < 2 && isInArrayId(1,currActivePath)) return;

			//clear previos activePath
			//spep back activePath
			//тут надо функцию которя буде удалять activePath во всех нодах в которых depth <= activeDepth
			//или это не тут а при клике на ноду нужно делать
			var backStepNode = currActivePath.pop();
			backStepNode.activePath = false;

			currentNode = currActivePath[currActivePath.length-1];

			backButtonFlag = true;

			let curNodesArr = myThis.path.currentActivePath.pop(currentNode);

			if(curNodesArr.length > 1){
				//one link slide
				oneLinkNode = curNodesArr[0];//нода у которой больше 1 связи
				
				oneLinkNodeFrom = curNodesArr[curNodesArr.length-1];//нода с которой должна связаться
			}else{
				//one link slide
				oneLinkNode = backStepNode;//нода у которой больше 1 связи
				
				let fullPath = getFullActivePath(backStepNode)
				oneLinkNodeFrom = fullPath[fullPath.length-2];//нода с которой должна связаться
			}

			//simulate click on stepback node
			// console.dir(currActivePath);
			cliсkOnNode(currentNode, deleteDelay, callback);
		}

		function forwardButton(nodeId, deleteDelay = false, callback = function(){}){
			let node = getNodeById(nodeId);
			backButtonFlag = true;

			let curNodesArr = myThis.path.currentActivePath.push(node);

			if(curNodesArr.length > 1){
				//one link slide
				oneLinkNode = curNodesArr[curNodesArr.length-1];//нода у которой больше 1 связи
				
				oneLinkNodeFrom = curNodesArr[0];//нода с которой должна связаться
			}
			
			cliсkOnNode(node, deleteDelay, callback);
		}

		function Path(){
			let selfPath = this;
			//list of only active nodes
			this.activePath = null;
			//list of all nodes in path with goto
			this.fullActivePath = new FullActivePath();
			//list of all nodes what visited user
			this.fullPath = null;
			//list of all activity include functional buttons, browser buttons, text wrote in inputs and maybe send emails
			this.fullActivity = null;
			//list of nodes that take into account the back and forward buttons
			this.currentActivePath = new CurrentActivePath();


			function FullActivePath(){
				this.get = get;
				this.push = push;
				this.pop = pop;

				let fullActivePath = [];

				function get(){
					// return fullActivePath;
					return selfPath.currentActivePath.get().filter(d => d.active).map(d => d.node);
				}

				function push(node){
					
				}

				function pop(node = null){
					
				}
			}

			function CurrentActivePath(){
				this.get = get;
				this.push = push;
				this.pop = pop;
				/*
				 * currentActivePath = {
				 *	 active: bool,
				 *	 node: obj.node,
				 * }
				 */
				let currentActivePath = [];

				function get(){
					return currentActivePath;
				}

				function push(node){
					let newNodes = [];
					let beenInCAP = false;
					let beenInCAPpos = null;
					for (let i = 0; i < currentActivePath.length; i++) {
						let currDepth = currentActivePath[i].node.leftDepth ? currentActivePath[i].node.leftDepth : currentActivePath[i].node.depth;
						let nodeDepth = node.leftDepth ? node.leftDepth : node.depth;
						if(currentActivePath[i].node.id == node.id ||
							currDepth == nodeDepth
							){
							beenInCAP = true;
							beenInCAPpos = i;
						}
					}
					if(!beenInCAP){
						currentActivePath.push({
							active: true,
				 			node: node
						});
						newNodes.push(node);
					}else{
						for (let i = 0; i <= beenInCAPpos; i++) {
						let currDepth = currentActivePath[i].node.leftDepth ? currentActivePath[i].node.leftDepth : currentActivePath[i].node.depth;
						let nodeDepth = node.leftDepth ? node.leftDepth : node.depth;
							if(!currentActivePath[i].active){
								currentActivePath[i].active = true;
								if(currDepth == nodeDepth){
									currentActivePath[i].node = node;
								}
								newNodes.push(currentActivePath[i].node);
								
							}
						}
					}
					// console.log('push');
					// console.log(newNodes);
					return newNodes;
				}

				function pop(node = null){
					let newNodes = [];
					let lastElementPos = null;

					if(!node){
						for (let i = currentActivePath.length - 1; i >= 0; i--) {
							if(currentActivePath[i].active){
								lastElementPos = i;
								currentActivePath[i].active = false;
								newNodes.push(currentActivePath[i].node);
								break;
							}
						}
					}else{
						for (let i = currentActivePath.length - 1; i >= 0; i--) {
							if(currentActivePath[i].active && 
								node.id == currentActivePath[i].node.id
								){
								lastElementPos = i;
								break;
							}
						}
						if(lastElementPos !== null){
							for (let i = currentActivePath.length - 1; i > lastElementPos; i--) {
								if(currentActivePath[i].active){
									currentActivePath[i].active = false;
									newNodes.push(currentActivePath[i].node);
								}
							}
						}else{
							//если запрашиваемой ноды нет то сбросить все хранилище
							//и установить ноду как начальная
							currentActivePath = [{
								active: true,
					 			node: node
							}];
						}
					}
					// console.log('pop');
					// console.log(newNodes);
					return newNodes;
				}
			}

		}

		function getActivePath(){
			// let nodes = myThis.nodes;
			// let activePath = [];
			// for (var i = 0; i < nodes.length; i++) {
			// 	if(nodes[i].activePath){
			// 		activePath.push(nodes[i]);
			// 	}
			// }

			//if come to page with not firt node
			if( activePath.length <= 1 && !isInArrayId(1,activePath) ){
				activePath = getFullActivePath(activePath[activePath.length-1]);
				activePath = activePath.filter(d => !d.goTo);
			}

			return activePath;//.sort( (a, b) => a.depth*1 - b.depth*1 )
		}


		//рефакторинг:
		//нужны переменые либо свойства
		//активного пути, тот что пользователь прошел
		//полного активного пути, с нодами goto
		//нужен метод поиска полного и не полного пути
		//от текущей до начала, елси пользователь приходит 
		//не со стартовой ноды
		function getFullActivePath(node = null){
			let fullActivePath = [];

			if(node !== null){
				var fullChain = makeFullChain();
				fullChain(node, myThis.nodes[0]);
				return fullActivePath.reverse();
			}

			let currActivePath = getActivePath();

			if( (currActivePath.length - 1) == 0 ){
				fullActivePath = currActivePath;
			}else{
				for (var i = currActivePath.length - 1; i > 0; i--) {
					var fullChain = makeFullChain();
					fullChain(currActivePath[i], currActivePath[(i-1)]);
				}
			}


			return fullActivePath.reverse();

			function makeFullChain(){
				var limmiter = 200;

				function findMissNods(parentsIds, parentId){
					limmiter--;
					if(limmiter <= 0) {
						// throw new Error('Невозможно найти fullActivePath.')
						//можно дописать что бы искало еще и по goTo параметрамы
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
			wrapperStats.setAttribute('style',"font-size: 12px;z-index: 100;position: absolute;top: 0;");

			//fps
			var fps = createStat('FPS: ');
			//counter
			var couter = createStat('FramesCount: ');
			//simTime
			var simTime = createStat('SimTime: ');
			//alpha
			var alpha = createStat('Alpha: ', 'alpha');


			var parent = document.querySelector('#my_data');

			function createStat(html, default1 = '--'){
				var wrapper = document.createElement("div");
				wrapper.innerHTML = html;
				var value = document.createElement("span");
				
				wrapper.append(value);
				wrapperStats.append(wrapper);

				if('alpha' == default1){
					value.style.display = 'inline-block';
					value.style.background = 'steelblue';
					value.style.width = '1px';
					value.style.height = '1em';
				}else{
					value.innerHTML = default1;
				}

				return value;
			}

			function getTickCount(){
				return tickCount;
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



						//counter
						tickCount++;
						couter.innerHTML = tickCount

						simTime.innerHTML = (Date.now() - simulationTime)/1000;

						//alpha
						let simAlpha = simulation.alpha()
						alpha.innerHTML = Math.round(simAlpha*1000)/1000;
						alpha.style.width = simAlpha*100+'px';
					}
				},
				getTickCount: getTickCount
			}

		}

		function makeUserDataPath() {
			let userData = [];

			this.getElementText = getElementText;

			this.push = function(node, message = ''){
				let textToPush = '';
				//нужно отрефакторить
				if(node){
					let nodeList = document.querySelectorAll("div.node");
					if(nodeList.length){
						let nodeExist = false;
						nodeList.forEach( elem => {
							if( elem.__data__.id == node.id ){
								nodeExist = true;
								textToPush = getElementText(elem);
							}
						});
						if(!nodeExist){//если ноды еще не существует
							let div = document.createElement('div');
							div.innerHTML = node.label;
							textToPush = getElementText(div);
						}
					}else{//если нод еще не существует
						let div = document.createElement('div');
						div.innerHTML = node.label
						textToPush = div.innerText;
					}
				}
				if(message){
					textToPush = message;
				}
				if(textToPush){
					// console.log(textToPush);
					userData.push(textToPush);
				}	
			}

			this.get = function(){
				return userData;
			}

			function getElementText(elem){
				let input = elem.querySelector('input');
				let textArea = elem.querySelector('textarea');
				if(input){
					let name = input.getAttribute('name');
					let placeHolder = input.getAttribute('placeholder');
					let value = input.value;
					if(!value && myThis.nodeInputs[name]){
						value = myThis.nodeInputs[name].val;
					}
					return placeHolder +' "'+ value +'" '+ elem.innerText.trim();
				}else if(textArea){
					let name = textArea.getAttribute('name');
					let mailname = textArea.getAttribute('mailname');
					let text = textArea.value;
					if(!text && myThis.nodeInputs[name]){
						text = myThis.nodeInputs[name].val;
					}
					name = mailname ? mailname : name;
					return name +' - "'+ text +'" '+ elem.innerText.trim();
				}else{
					return elem.innerText;
				}
			}
		}

		function checkRequiredNode(nodeId){
			let node = getNodeById(nodeId);

			//нужно отрефакторить и графическую часть перенести
			// в вью, но при этом не выполнять сдвиг если не прошел валидацию

			let nodeVal = undefined;
			let nodeElem = undefined;
			let nodeList = document.querySelectorAll("div.node");
			if(nodeList.length){
				let nodeExist = false;
				nodeList.forEach( elem => {
					if( elem.__data__.id == node.id ){
						nodeExist = true;
						nodeElem = elem;
						nodeVal = getElementValue(elem);
					}
				});
				if(!nodeExist){//если ноды еще/уже не существует
					let div = document.createElement('div');
					div.innerHTML = node.label;
					nodeVal = getElementValue(div);
				}
			}else{//если нод еще не существует
				let div = document.createElement('div');
				div.innerHTML = node.label
				nodeVal = getElementValue(div);
			}

			if(!nodeVal){
				if(nodeElem) nodeElem.classList.add('error');
				setTimeout(function(){
					nodeElem.classList.remove('error')
				}, 750, simulation);
				return false;
			}

			return true;

			function getElementValue(elem){
				let input = elem.querySelector('input');
				let textArea = elem.querySelector('textarea');
				if(input){
					let value = input.value;
					if(!value && model.nodeInputs[name] && model.nodeInputs[name].val){
						value = model.nodeInputs[name].val;
					}
					return value.trim();
				}else if(textArea){
					let text = textArea.value;
					if(!text && model.nodeInputs[name] && model.nodeInputs[name].val){
						text = model.nodeInputs[name].val;
					}
					return text.trim();
				}else{
					return false;
				}
			}
		}

		function setLabelVar(label){
			let inputs = Object.keys(myThis.nodeInputs);

			for (let i = 0; i < inputs.length; i++) {
				label = label.replace('{'+inputs[i]+'}', myThis.nodeInputs[inputs[i]].val); 
			}
			const regex = /{.*}/ig;
			label = label.replace(regex, '');

			return label;
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
		this.radial = radial;
		this.radialStr = radialStr;
		this.radialX = radialX;
		this.radialY = radialY;
		this.orderForce = orderForce;
		this.orderForceStr = orderForceStr;
		this.simulationResize = throttle(simulationResize,50);
		this.getNodeRadius = getNodeRadius;
		this.isolateForce = isolateForce;
		this.getColideRadius = getColideRadius;
		this.colideRadiusStr = colideRadiusStr;
		this.getColideRadiusIterations = getColideRadiusIterations;
		this.collideForceIsolate = collideForceIsolate;
		this.getHtmlNodeById = getHtmlNodeById;
		this.getLinkWidth = getLinkWidth;
		this.scrollNext = true;
		this.isMobileWidth = isMobileWidth;
		this.findParenNodeElement = findParenNodeElement;
		this.setTextareaHeight = setTextareaHeight;
		this.cursor = new cursor();

		var width = window.innerWidth;
		var height = window.innerHeight;
		var verticalScreen = (height/width > width/height) || (width < 500) ? true : false;

		//init
		setHtmlFontSize();
		setBodyVertical();

		function isMobileWidth(){
			if(width >= 1366){
				return false;
			}else{
				return  true;
			}
		}

		function findParenNodeElement(elem){
			if(elem.parentElement){
				if( elem.parentElement.classList.contains('node') ){
					return elem.parentElement;
				}else{
					return findParenNodeElement(elem.parentElement);
				}
			}else{
				return false;
			}
		}

		function setTextareaHeight(elem) {
			var style = getComputedStyle(elem, null);
			var verticalBorders = Math.round(parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth));
			// var maxHeight = parseFloat(style.maxHeight) || 300;
			// var maxHeight = height/2;
			// var maxHeight = setHtmlFontSize('get')*5*0.8 + 20;
			var lineHeight = Math.round(parseFloat(style.lineHeight));
			var padding = Math.round(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			var maxHeight = lineHeight*5 + padding;

			elem.style.height = 'auto';

			var newHeight = elem.scrollHeight + verticalBorders;
			// var newHeight = elem.scrollHeight;

			elem.style.overflowY = newHeight > maxHeight ? 'auto' : 'hidden';
			elem.style.height = Math.min(newHeight, maxHeight) + 'px';
		}

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
		//максимальная сила реагирования manyBody
		function manyBodyDistanceMax(d){
			return forceSettings('manyBodyDistanceMax', d);
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

		//радиус радиальной силы
		function radial(d){
			return forceSettings('radial', d);
		}
		//мощность радиальной силы
		function radialStr(d){
			return forceSettings('radialStr', d);
		}
		//координата X для центра радиальной силы
		function radialX(d){
			return forceSettings('slideForce', model.activeNode);
		}
		//координата X для центра радиальной силы
		function radialY(d){
			return forceSettings('verticalForce', model.activeNode);
		}

		//радиус сферы столкновения
		function getColideRadius(d){
			return forceSettings('getColideRadius', d);
		}

		//сила с которой столкнутые сферы будут выталкивать друг друга
		function colideRadiusStr(){
			return 1;
		}

		//при увеличение этого праметра уменьшеться площать перекрытия 2 сфер при столкновении
		//но также увеличеться сложность просчетов
		function getColideRadiusIterations(){
			return 1;
		}

		//позиция силы ордера
		function orderForce(d){
			return forceSettings('orderForce', d);
		}
		//мощность сылы ордера
		function orderForceStr(d){
			return forceSettings('orderForceStr', d);
		}

		//где будет работать сила столкновения
		function collideForceIsolate(d){
			if(verticalScreen){
				if(!d.functional){
					return true;
				}else{
					return false;
				}
			}else{
				if(!d.functional){
					return true;
				}else{
					return false;
				}
			}
		}

		function forceSettings(force, d){
			let activeNode = model.activeNode;
			let childrens = activeNode.children;
			let activeDepth = activeNode.leftDepth ? activeNode.leftDepth : activeNode.depth;
			let scrollNext = true; 
			let nodeDepth = d.leftDepth ? d.leftDepth : d.depth;

			if( !model.isSlide(activeNode) &&
				childrens.length == 0 &&
				!activeNode.functional
				){
				activeDepth--;
			}

			//для мобилок, планшетов и всего у чего вертикальная оринетация экрана
			if(verticalScreen){
				if(!d.functional){
					//вертикальная о.э. - для обычных нод
					switch(force){
						//мощность силы линка
						case 'linkStr':
							return 0.005;
							break;
						//длина линки в пикселях
						case 'linkDistance':
							return 0;
							break;
						//мощность силы отталкивания(заряда)
						case 'manyBodyStr':
							return -50;
							break;
						//максимальная сила реагирования manyBody
						case 'manyBodyDistanceMax':
							return Infinity;
							break;
						//задаёт горизонтальную координату для каждой ноды
						case 'slideForce':
							if(d.active){
								// return (width/2 + width/2*(nodeDepth - activeDepth)) - width/2;
								return (width/2 + width/2*(nodeDepth - activeDepth)) - width/1.15;
							}else{
								// return (width/5 + width/2*(nodeDepth - activeDepth)) - width/2;
								return (width/5 + width/3*(nodeDepth - activeDepth)) - width/1.3;
							}
							break;
						//мощность силы которая задаеть горизонтальную координату
						case 'slideForceStr':
							return d.active ? 0.5 : 0.45;
							break;
						//сила задает вертикальную координату для каждой ноды
						case 'verticalForce':
							if(d.active){
								return (height/18 + (height*4/5)*(nodeDepth - activeDepth)) - height/4.5;
							}else{
								return (height/18 + (height*4/4.7)*(nodeDepth - activeDepth)) - height/1;
							}
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return d.active ? 0.5 : 0.25;
							break;
						//радиус радиальной силы
						case 'radial':
							let radialRadCoef = 375/250;
							return width/radialRadCoef;
							break;
						//мощность радиальной силы
						case 'radialStr':
							if(childrens.includes(d.id)){
								return 0.005;
							}else{
								return 0;
							}
							break;
						//радиус силы столкновения
						case 'getColideRadius':
							// let collRadCoef = 375/30;
							// let collRadCoef = 375/70;
							// return width/collRadCoef;
							// break;
							if(childrens.includes(d.id)){
								let collRadCoef = 375/45;
								return width/collRadCoef;
							}else{
								return 0;
							}
							break;
						//позиция силы ордера
						case 'orderForce':
							if(childrens.includes(d.id)){
								let order = childrens.map(d => model.getNodeById(d)).sort( (a,b) => {
									let ac = a.order ? a.order : a.id;
									let bc = b.order ? b.order : b.id;
									return ac - bc;
								} );
								let onePart = (height/order.length)*0.6;
								for (let i = 0; i < order.length; i++) {
									if(order[i].id == d.id){
										return onePart*(i+1) - onePart;
									}
								}
								return 0;
							}else{
								return 0;
							}
							break;
						//мощность сылы ордера
						case 'orderForceStr':
							if(childrens.includes(d.id)){
								return 0.4;
							}else{
								return 0;
							}
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
						//максимальная сила реагирования manyBody
						case 'manyBodyDistanceMax':
							return 0;
							break;
						//задает горизонтальную координату для каждой ноды
						case 'slideForce':
							switch (d.function){
								case 'back':
									// return (width/2 + width/2*(nodeDepth - activeDepth)) - (width/1.3 + getNodeRadius()*4);
									// console.log( (width/10 + getNodeRadius(d)) - width/2 );
									return (width/10 + getNodeRadius(d)) - width/2;
									break;
								case 'menu':
									// return (width/2 + width/2*(nodeDepth - activeDepth)) -  (getNodeRadius()*4 + 150);
									// console.log( width/2 - (width/10 + getNodeRadius(d)) );
									return width/2 - (width/10 + getNodeRadius(d));
									break;
								case 'logo':
									return 0;
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
							// return height/2 - (height/100 + getNodeRadius(d));
							return height/2 - (height/20 + getNodeRadius(d));
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return 0.3;
							break;
						//радиус радиальной силы
						case 'radial':
							return 500;
							break;
						//мощность радиальной силы
						case 'radialStr':
							return 0;
							break;
						//радиус силы столкновения
						case 'getColideRadius':
							return 0;
							break;
						//позиция силы ордера
						case 'orderForce':
							return 0;
							break;
						//мощность сылы ордера
						case 'orderForceStr':
							return 0;
							break;
						default:
							throw new Error('Неизвестная cила.');
							break;
					}
				}
			}else{//для горизонтальной ориентации экрана
				if(!d.functional){
					//горизонтальная о.э. - для обычных нод
					switch(force){
						//мощность силы линка
						case 'linkStr':
							return 0.005;
							break;
						//длина линка в пикселях
						case 'linkDistance':
							return 0;
							break;
						//мощность силы отталкивания(заряда)
						case 'manyBodyStr':
							return -50;
							// return -50;
							break;
						//максимальная сила реагирования manyBody
						case 'manyBodyDistanceMax':
							return Infinity;
							break;
						//задаеть горизонтальную координату для каждой ноды
						case 'slideForce':

							// console.log('id',d.id);
							// console.log('nodeDepth',nodeDepth);
							// console.log('activeDepth',activeDepth);
							if(d.active){
								// console.log('active-x:',(width/2 + width/2*(nodeDepth - activeDepth)) - width/2);
								return (width/2 + width/2*(nodeDepth - activeDepth)) - width/1.75;//в конце должно быть width/2 иначе на некоторых разрешениях экрана может отображаться не коректно
								// return 0;
							}else{
								// console.log('child-x:',(width/5 + width/2*(nodeDepth - activeDepth)) - width/2);
								// return (width/4 + width/2*(nodeDepth - activeDepth)) - width/2;
								// ноды с одинаковой глубиной но не активная, толкать принудильтельно назад
								if( (nodeDepth - activeDepth) == 0 ){
									return (width/4 + width/2*(nodeDepth - activeDepth - 1)) - width/2;
								}else{
									return (width/4 + width/2*(nodeDepth - activeDepth)) - width/2;
								}
							}

							break;
						//мощность силы которая задаеть горизонтальную координату
						case 'slideForceStr':
							return d.active ? 0.5 : 0.35;
							break;
						//сила задает вертикальную координату для каждой ноды
						case 'verticalForce':
							return d.active ? -(height*2/22) : 0.05;
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return d.active ? 0.5 : 0.015;
							break;
						//радиус радиальной силы
						case 'radial':
							// let radialRadCoef = 1400/450;
							let radialRadCoef = 1400/250;
							return width/radialRadCoef;
							break;
						//мощность радиальной силы
						case 'radialStr':
							if(childrens.includes(d.id)){
								return 0.65;
							}else{
								return 0;
							}
							break;
						//радиус силы столкновения
						case 'getColideRadius':
							// let collRadCoef = 2040/120;
							// let collRadCoef = 2040/100;
							// return width/collRadCoef;
							// break;
							if(childrens.includes(d.id)){
								let collRadCoef = 2040/100;
								return width/collRadCoef;
							}else{
								return 0;
							}
							break;
						//позиция силы ордера
						case 'orderForce':
							if(childrens.includes(d.id)){
								let order = childrens.map(d => model.getNodeById(d)).sort( (a,b) => {
									let ac = a.order ? a.order : a.id;
									let bc = b.order ? b.order : b.id;
									return ac - bc;
								} );
								let onePart = (height/order.length)*0.65;
								for (let i = 0; i < order.length; i++) {
									if(order[i].id == d.id){
										if(order.length > 1){
											return ((onePart * (i+1) - onePart) - height/6);
										}else{
											return (onePart * (i+1) - onePart);
										}
									}
								}
								return 0;
							}else{
								return 0;
							}
							break;
						//мощность сылы ордера
						case 'orderForceStr':
							if(childrens.includes(d.id)){
								return 0.5;
							}else{
								return 0;
							}
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
						//максимальная сила реагирования manyBody
						case 'manyBodyDistanceMax':
							return 0;
							break;
						//задаеть горизонтальную координату для каждой ноды
						case 'slideForce':
							switch (d.function){
								case 'back':
									// return (width/2 + width/2*(nodeDepth - activeDepth)) - (width/1.3 + getNodeRadius()*4);
									// console.log( (width/10 + getNodeRadius(d)) - width/2 );
									return (width/12 + getNodeRadius(d)) - width/2;
									break;
								case 'menu':
									// return (width/2 + width/2*(nodeDepth - activeDepth)) -  (getNodeRadius()*4 + 150);
									// console.log( width/2 - (width/10 + getNodeRadius(d)) );
									return width/2 - (width/12 + getNodeRadius(d));
									break;
								case 'logo':
									return 0;
									break;
								default:
									throw new Error('Неизвестная кнопка.')
									break;
							}
							break;
						//мощность силы которая задаеть горизонтальную координату
						case 'slideForceStr':
							return 0.25;
							break;
						//сила задает вертикальную координату для каждой ноды
						case 'verticalForce':
							return height/2 - (height/17 + getNodeRadius(d));
							break;
						//мощность силы которая задает вертикальную координату
						case 'verticalForceStr':
							return 0.25;
							break;
						//радиус радиальной силы
						case 'radial':
							return 500;
							break;
						//мощность радиальной силы
						case 'radialStr':
							return 0;
							break;
						//радиус силы столкновения
						case 'getColideRadius':
							let collRadCoef = 2040/100;
							return width/collRadCoef;
							break;
						//позиция силы ордера
						case 'orderForce':
							return 0;
							break;
						//мощность сылы ордера
						case 'orderForceStr':
							return 0;
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
			verticalScreen = (height/width > width/height) || (width < 500) ? true : false;
			svgViewPort = [-width / 2, -height / 2, width, height];

			setHtmlFontSize();
			setBodyVertical();

			svg
			.attr("viewBox", svgViewPort);

			viewPort
			.style('width', width+'px')
			.style('height', height+'px');

			simulation.force("link").links(model.links);
			simulation.force("charge").strength(self.manyBodyStr);
			simulation.force("slideForce").strength(self.slideForceStr);
			simulation.force("verticalForce").strength(self.verticalForceStr);
			simulation.force("collide").radius(self.getColideRadius);
			simulation.force("radial").strength(self.radialStr).x(self.radialX()).y(self.radialY());
			simulation.force("order").strength(self.orderForceStr);

			//change lick width
			var strokeWidth = self.getLinkWidth();
			linksCont.selectAll("line")
			.attr('stroke-width', strokeWidth);

			//change textarea height
			nodesCont.selectAll("div.node textarea")
			.each(function(d, i) {
				self.setTextareaHeight(this);
			});

			simulation.alpha(1).restart();
			model.stats.restart();
			animState.start();
		}

		function getLinkWidth(){
			return verticalScreen ? 2 : 4
		}

		function setBodyVertical(){
			if(verticalScreen){
				document.body.classList.add('vertical');
				document.body.classList.remove('horizontal');
			}else{
				document.body.classList.add('horizontal');
				document.body.classList.remove('vertical');
			}
		}

		function setHtmlFontSize(get){

			//коефициент сколько екранного пространства должена занимать активаная надпись
			let sizeCoeficient = verticalScreen ? 0.45 : 0.26;
			//значение в px сколько екранного пространства должена занимать активаная надпись
			let allTextWidth = width*sizeCoeficient;
			//примерное количесто букв
			let lettersNumber = 10;
			//коефициент буквы до размера шрифта
			let letters2fzCoeficient = 0.53;
			//значение в пикселях для 1 буквы
			let letter_fz = lettersNumber*letters2fzCoeficient;
			
			fz = allTextWidth/letter_fz;

			if(get == 'get'){
				return fz;
			}else{
				document.documentElement.style.fontSize = fz+'px';
			}
		}

		function getHtmlNodeById(id){
			let nodeList = document.querySelectorAll("div.node");
			if(nodeList.length){
				for (var i = 0; i < nodeList.length; i++) {
					if( nodeList[i].__data__.id == id ){
						return nodeList[i];
					}
				}
			}else{//если нод не существует
				return 'false';
			}
			// nodes = nodesCont.selectAll("div.node");
			// console.dir(nodes);
			// // return nodes.filter( d => d.id == id );
			// return ;
		}


		function getNodeRadius(node){
			// if(node.id){
			// 	console.log( getHtmlNodeById(node.id) );
			// }
			var rem = setHtmlFontSize('get');
			// var diameter = node.active ? rem*1.35 : rem*1.35*0.55;
			var func = node.functional ? 0.65 : 1;
			var diameter = node.active ? rem*1.35 : (rem*1.35)*0.55*func;
			// console.log( node.active ? rem*1.35 : rem*0.55 );
			return diameter/2;
			// return 70;
		}

		function isolateForce(force, filter) {
			var initialize = force.initialize;
			force.initialize = function() { initialize.call(force, model.nodesToDisplay.filter(filter)); };
			return force;
		}

		// cursor
		function cursor(){
			this.onMouseHover = onMouseHover;
			this.onMouseHoverOut = onMouseHoverOut;
			this.onMouseDown = onMouseDown;
			this.onMouseUp = onMouseUp;

			var mouseDownFlag = false;

			var $pointer1 = document.querySelector('.pointer-1');
			var $pointer2 = document.querySelector('.pointer-2');
			var $hoverables = document.querySelectorAll('.v-content');

			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mousedown', onMouseDown);
			document.addEventListener('mouseup', onMouseUp);
			for (let i = 0; i < $hoverables.length; i++) {
				$hoverables[i].addEventListener('mouseenter', onMouseHover);
				$hoverables[i].addEventListener('mouseleave', onMouseHoverOut);
			}

			function onMouseMove(e) {
			  	console.log('move');
			  	gsap.to($pointer1, .4, {
			  		x: e.pageX - 30,
			  		y: e.pageY - 30
			  	});
			  	gsap.to($pointer2, .1, {
			  		x: e.pageX - 12,
			  		y: e.pageY - 12
			  	});
			}
			function onMouseDown(e) {
			  	console.log('Down');
			  	mouseDownFlag = true;
			  	gsap.to($pointer1, .5, {
			  		scale: 0
			  	});
			  	gsap.to($pointer2, .3, {
			  		scale: 0
			  	});
			}
			function onMouseUp(e) {
			  	console.log('Up');
			  	mouseDownFlag = false;
			  	gsap.to($pointer1, .5, {
			  		scale: 1
			  	});
			  	gsap.to($pointer2, .3, {
			  		scale: 1
			  	});
			}

			function onMouseHover() {
			  	console.log('hover');
			  	if(!mouseDownFlag){
			  		gsap.to($pointer1, .3, {
			  			scale: 2
			  		});
			  		gsap.to($pointer2, .3, {
			  			scale: 0.5
			  		});
			  	}
			}
			function onMouseHoverOut() {
			  	console.log('out');
			  	if(!mouseDownFlag || 1){
				  	gsap.to($pointer1, .3, {
				  		scale: 1
				  	});
				  	gsap.to($pointer2, .3, {
				  		scale: 1
				  	});
				}
			}
		}

	}

	function getParameterByName(name, url = window.location.href) {
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
				results = regex.exec(url);
				
		if (!results) return null;
		if (!results[2]) return '';

		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

});