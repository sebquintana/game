
var drawing;
var polyline;
var attempts;
var timer;
var svgs;
var categories = ["Pelota", "Abeja", "Celular"];
const maxAttempts = 3;
const maxTimeSecs = 5;

$().ready(function()
{
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
	
		var status = result.find('.timesup-drawing-status');
		status.html(svgs[i].name);

		container.append(result);
	}

	slideDown('.card-results');
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