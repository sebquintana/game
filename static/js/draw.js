
var drawing;
var polyline;
var attempts;
var timer;
var svgs;
var categories = ["Pelota", "Abeja", "Celular"];
var examples = [
	{"word":"Celular","countrycode":"AU","timestamp":"2017-03-16 06:06:41.14669 UTC","recognized":true,"key_id":"5633848211668992","drawing":[[[9,9],[32,32]],[[9,12,8,9,6,8,0,9,64,109,114,136,150,155,150,153,150,149,135,93,28,14,11,14,12],[32,72,124,144,156,186,244,250,253,250,253,255,247,199,139,81,24,20,12,2,3,6,11,29,44]],[[12,145,147],[47,50,53]],[[8,14,70,102,141,147],[206,212,213,217,216,219]],[[87,76,67,62,66,76,88,89,87,76],[228,225,226,235,240,243,229,225,220,220]],[[68,100],[24,24]]]},
	{"word":"Pelota","countrycode":"MX","timestamp":"2017-03-15 19:31:59.22893 UTC","recognized":true,"key_id":"5640145120264192","drawing":[[[159,139,85,69,46,36,18,4,0,0,5,28,44,70,111,123,145,172,201,210,233,252,254,234,226,218,208,163],[6,0,4,10,24,42,62,89,113,145,171,215,228,236,238,235,234,226,205,190,167,130,81,46,41,43,41,24]],[[6,16,25,49,58,106,110,89,94,97,102],[82,98,102,134,135,116,110,67,65,57,2]],[[112,145,160,188,198,199,199,208,246,254,255],[111,138,145,124,110,96,107,119,154,167,179]],[[151,150,143,140,148,169],[147,162,177,205,219,237]],[[122,116,90,61,34,30,24,42],[125,126,139,165,183,190,192,203]]]},
	{"word":"Abeja","countrycode":"US","timestamp":"2017-03-06 00:28:58.85688 UTC","recognized":true,"key_id":"4727732971765760","drawing":[[[200,150,116,83,73,69,67,83,104,119,175,193,208,226,228,225,210,166],[97,86,88,110,123,138,183,203,218,222,224,213,192,138,120,114,106,101]],[[53,21],[159,152]],[[11,0],[151,149]],[[190,190],[148,148]],[[189,188,179],[92,140,229]],[[143,144,135,128],[105,118,158,216]],[[147,118,107],[96,182,232]],[[95,78,73],[94,157,230]],[[179,179,148,144,142],[112,118,189,204,231]],[[120,107,90],[92,134,226]],[[213,213],[139,139]],[[207,202,203],[139,146,155]],[[75,83,99,113,147,168,175,180,180,162,134],[106,55,12,1,0,9,16,25,37,71,107]],[[163,169,181,207,236,253,253,232,201],[95,67,40,25,22,39,62,87,106]]]}
];
const maxAttempts = 3;
const maxTimeSecs = 5;

$().ready(function()
{
	document.addEventListener('deviceready', function()
	{
		//loadData('/static/words/categories.txt', function(data) {categories = data;});

		for (var i = 0; i < categories.length; ++i)
		{
			var obj = $.parseJSON(categories[i]);
			examples[obj.word] = parseDatasetElement(obj);
		}
	}, false);

	setupButtonBehavior();
	setupAppFlow();
	setupDrawingControls();

	startNewGame();
});

// setup UI behavior for all buttons
function setupButtonBehavior()
{
	$('.button').on('mousedown touchstart', function()
	{
		var button = $(this);

		button.css('background-position','-' + button.css('width') + ' ' + button.css('background-position-y'));
		button.find('span').css('top', button.hasClass('button-large') ? '17px' : '14px');

		if (button.hasClass('button-drawing'))
		{
			button.find('div').css('top', '104px');
			button.find('svg').css('marginTop', '32px').css('marginLeft', '20px');
		}
	});

	$(window).on('mouseup touchend', function()
	{
		$('.button').each(function()
		{
			var button = $(this);

			button.css('background-position','0 ' + button.css('background-position-y'));
			button.find('span').css('top', button.hasClass('button-large') ? '9px' : '6px');

			if (button.hasClass('button-drawing'))
			{
				button.find('div').css('top', '97px');
				button.find('svg').css('marginTop', '25px').css('marginLeft', '25px');
			}
		});
	});
}

function setupAppFlow()
{
	// slide down the card to show the new challenge
	$('#new-card').click(function() {
		newChallenge();
	});

	// slide up the card and show the canvas
	$('#gotit').click(function()
	{
		$('.home').hide();
		startNewDrawing();
		slideUp('.card-challenge');
	});

	$('#popup-quit-cancel').on('click', function() {
		$('.popup-wrapper').hide();
	});

	$('#popup-quit-quit').on('click', function() {
		startNewGame();
	});

	$('#button-timesup-play').on('click', function() {
		startNewGame();
	});
}

// initialize graphics context and events
function initGraphics()
{
	$('#drawing').html('');

	drawing = SVG('drawing');

	drawing.on('mousedown', function(e) {
		onMouseDown(e);
	});

	drawing.on('touchstart', function(e) {
		onMouseDown(e.touches[0]);
	});

	drawing.on('mousemove', function(e) {
		onMouseMove(e);
	});

	drawing.on('touchmove', function(e)
	{
		e.preventDefault();
		onMouseMove(e.touches[0]);
	});

	drawing.on('mouseup', function(e) {
		onMouseUp(e);
	});

	$(window)
	.on('mouseup', function(e) {
		onMouseUp(e);
	})
	.on('touchend', function(e)	{
		onMouseUp(e.touches[0]);
	})
	.on('resize', function()
	{
		var w = $(window).width();
		var h = $(window).height() - $('.topbar').height();

		drawing.size(w, h);
	})
	.resize();
}

function onMouseDown(e)
{
	polyline = drawing.polyline().attr({stroke: '#000000', 'stroke-width': 6, 'fill-opacity': 0});
	polyline.draw(e);
}

function onMouseMove(e)
{
	if (polyline) {
		polyline.draw('point', e);
	}
}

function onMouseUp(e)
{
	if (polyline) {
		polyline.draw('stop', e);
	}
}

function setupDrawingControls()
{
	$('#button-clear').on('click', function() {
		initGraphics();
	});

	$('#button-skip').on('click', function() {
		newChallenge();
	});

	$('.button-close').on('click', function() {
		$('.popup-wrapper').show();
	});
}

function startNewGame()
{
	attempts = 0;
	svgs = [];

	$('#button-skip').show();
	$('.card-container').hide();
	$('.canvas').hide();
	$('.popup-wrapper').hide();
	$('.home').show();
}

function newChallenge()
{
	if (timer) {
		clearInterval(timer);
	}

	if (attempts > 0)
	{
		var svg = $('#drawing svg');
		var obj = svgs[attempts - 1];

		obj.w = svg.width();
		obj.h = svg.height();
		obj.data = svg.html();
		obj.bbox = bbox(svg);
		obj.xml = new XMLSerializer().serializeToString(svg.get(0));

		save('drawing' + attempts + '.txt', obj.xml);
	}

	++attempts;

	if (attempts > maxAttempts)
	{
		showResults();
		return;
	}

	$('.card-challenge .level').html('Dibujando ' + attempts + '/' + maxAttempts);

	var challenge = selectCategory();

	var obj = {name:challenge};
	svgs.push(obj);



	$('.challenge').html(challenge);
	$('.canvas .topbar #topbar-text').html('Dibujar: ' + challenge);

	slideDown('.card-challenge');
}

function startNewDrawing()
{
	if (timer) {
		clearInterval(timer);
	}

	initGraphics();

	if (attempts >= maxAttempts) {
		$('#button-skip').hide();
	}

	$('.canvas').show();

	var counter = maxTimeSecs;
	$('#clock-time').html('00:05');

	timer = setInterval(function()
	{
		--counter;

		if (counter > 0) {
			$('#clock-time').html('00:' + (counter > 9 ? counter : '0' + counter));
		}
		else
		{
			clearInterval(timer);
			newChallenge();
		}

	}, 1000);
}

function slideDown(card) {
	$(card).css('top','-100%').show().animate({top: '0'}, 400);
}

function slideUp(card)
{
	$(card).animate({top: '-100%'}, 400, function() {
		$(card).hide();
	});
}

function selectCategory()
{
	if (!categories) {
		return 'error';
	}

	var temp = [];

	for (var i = 0; i < categories.length; ++i)
	{
		var contains = false;

		for (var j = 0; j < svgs.lenght; ++j)
		{
			if (svgs[j].name == categories[i])
			{
				contains = true;
				break;
			}
		}

		if (contains) {
			continue;
		}

		temp.push(categories[i]);
	}

	return categories[Math.floor((Math.random() * temp.length))];
}

function loadData(filename, callback)
{
	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + filename,
		function(fileEntry)
		{
			fileEntry.file(function(file)
			{
				var reader = new FileReader();

				reader.onloadend = function(e) {
					callback(this.result.split(/\r?\n/));
				}

				reader.readAsText(file);
			});
		},
		function(e)
		{
			console.log('FileSystem Error');
			console.dir(e);
		}
	);
}

function save(filename, data)
{
	if (typeof cordova === 'undefined') {
		return;
	}

	var errorCallback = function(error) {
		alert("ERROR: " + error.code);
	};

	var successCallback = function(dir)
	{
		dir.getFile(filename, {create: true}, function(fileEntry)
		{
			fileEntry.createWriter(function(fileWriter)
			{
				fileWriter.onerror = errorCallback;
				fileWriter.write(data);
			},
			errorCallback);
		},
		errorCallback);
	};

	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, successCallback, errorCallback);
}

function showResults()
{
	var container = $('.card-results .card-row .container').html('');
	var template = $('.card-results .template');

	for (var i = 0; i < maxAttempts; ++i)
	{
		var result = template.clone(true);
		result.removeClass('template');
		
		var svg = result.find('svg');		
		svg.attr('viewBox','0 0 ' + svgs[i].w + ' ' + svgs[i].h).html(svgs[i].data);
		
		src = examples[svgs[i].name];
		
		var obj = $(src);
		obj.hide();
		result.find('button').append(obj);
		
		obj.attr('width', svg.attr('width'));
		obj.attr('height', svg.attr('height'));
		
		var status = result.find('.timesup-drawing-status');
		status.html(svgs[i].name);

		compare(svgs[i], src, status);
		container.append(result);
	}

	slideDown('.card-results');
}

function compare(svg1, ref, status)
{
	var fileData1 = new Blob([svg1.xml], {type: 'image/svg+xml;charset=utf-8'});
	var fileData2 = new Blob([ref], {type: 'image/svg+xml;charset=utf-8'});

	resemble(fileData1).compareTo(fileData2)
		.ignoreColors()
		.ignoreAntialiasing()
		.ignoreAlpha()
		.scaleToSameSize()
	.onComplete(function(data) {
		//status.html(status.html() + ' ' + data.misMatchPercentage + '%')
		status.html(status.html())
	});
}

function bbox(svg)
{
	var bbox = {};

	bbox.x1 = parseInt(svg.attr('width'));
	bbox.y1 = parseInt(svg.attr('height'));
	bbox.x2 = 0;
	bbox.y2 = 0;

	svg.find('polyline').each(function()
	{
		var points = $(this).attr('points').split(' ');

		for (var i = 0; i < points.length; ++i)
		{
			var point = points[i].split(',');
			var x = parseInt(point[0]);
			var y = parseInt(point[1]);

			bbox.x1 = Math.min(bbox.x1, x);
			bbox.x2 = Math.max(bbox.x2, x);
			bbox.y1 = Math.min(bbox.y1, y);
			bbox.y2 = Math.max(bbox.y2, y);
		}
	});

	return bbox;
}

function parseDatasetElement(obj)
{	
	var x1 = -1, y1, x2, y2;
	var polylines = [];
	
	for (var i = 0; i < obj.drawing.length; ++i)
	{
		var stroke = obj.drawing[i];
		var x = stroke[0];
		var y = stroke[1];
		
		var points = [];
		
		for (var j = 0; j < x.length; ++j) 
		{
			points.push(x[j] + ',' + y[j]);
			
			if (x1 != -1) 
			{
				x1 = Math.min(x[j],x1);
				x2 = Math.max(x[j],x2);
				y1 = Math.min(y[j],y1);
				y2 = Math.max(y[j],y2);
			}
			else
			{
				x1 = x[j];
				x2 = x[j];
				y1 = y[j];
				y2 = y[j];
			}
		}

		polylines.push(points.join(' '));
	}
	
	var w = x2 - x1;
	var h = y2 - y1;
	var svg = '<svg class="example" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' '  + h + 
		'" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">';
			  
	for (var i = 0; i < polylines.length; ++i) {
		svg += '<polyline points="' + polylines[i] + '" stroke="#000000" stroke-width="6" fill-opacity="0"/>';
	}
	
	svg += '</svg>';
	
	return svg;
}	
