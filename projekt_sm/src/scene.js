"use strict";

define(
		[	'src/cameraEngine',
			'src/cameraControls',
			'src/mustache',
			'src/urlUtils'
		],
		function (
			cameraEngine,
			cameraControls,
			mustache,
			urlUtils
		) {
	var scenes = [
			{
				name : "Drift, rozmycie tła",
				layers : [
					{
						name : "tła",
						source : "content/trela/background.jpg",
						focalDistance : 190,
						horizontalMotionBlur : 20
					},
					{
						name : "samochodu",
						source : "content/trela/foreground.png",
						focalDistance : 30,
					}
				],

				hdrToLdrMultiplier : 1.5,
				sceneEV : 3,
				EVOffset : 2.3,
				width : 540,
				height : 304,
				focalLength : 200,
				description: "W tej scenie zakładamy że fotograf podążął za autem i rozmyte jest tło."
			},
			{
				name : "Drift, rozmycie auta",
				layers : [
					{
						name : "tła",
						source : "content/trela/background.jpg",
						focalDistance : 190
					},
					{
						name : "samochodu",
						source : "content/trela/foreground.png",
						focalDistance : 30,
						horizontalMotionBlur : 8 
					}
				],
				hdrToLdrMultiplier : 1.5,
				sceneEV : 3,
				EVOffset : 2.3,
				width : 540,
				height : 304,
				focalLength : 200,
				description : "Jest to typowa scena z wyścigów, należy użyć dużej przsłony aby uniknąć rozmycia auta"
			}
		],
		sceneDefinition,
		leftToLoad,
		largeCanvas,
		layerImages,
		layerCanvases,
		layerContexts,
		hdrBuffer,
		mainContext,
		defocusedContextsCache, 
		drawSceneTimer,
		drawSceneTime = 100,
		drawSceneVariables = [],
		cameraSettings,
		initialising = true;

	var loadImage = function (sourceFile) {
		console.log("loading image " + sourceFile);
		leftToLoad++;
		var image = new Image();
		image.onload = imageLoaded;
		image.src = urlUtils.getResourceUrl(sourceFile);
		return image;
	};

	var imageLoaded = function () {
		console.log("image loaded");
		leftToLoad--;

		if (leftToLoad === 0) {
			onLoaded();
		}
	};

	var onLoaded = function () {
		$('#loading').hide();

		$.each(layerImages, function (i, layer) {
			addLayer(layer, i);
			addLayer(layer, i);
		});

		hdrBuffer.width = sceneDefinition.width;
		hdrBuffer.height = sceneDefinition.height;

		cameraSettings.focusLayer = sceneDefinition.layers.length - 1;

		if (sceneDefinition.layers.length > 1) {
			$('input[name=focus][value=back]').attr('disabled', false);
		} else {
			$('input[name=focus][value=back]').attr('disabled', true);
			$('input[name=focus][value=fore]').prop('checked', true);
		}

		$('input[name=focus]:checked').change();
		drawScene(['scene']);
	};

	var cacheSize = 0;
	var getDefocusedLayer = function (
			layerIndex, defocusBlurRadius, horizontalMotionBlur /* optional */) {
		horizontalMotionBlur = horizontalMotionBlur || 0;
		defocusBlurRadius = Math.abs(defocusBlurRadius);

		var round;
		if (defocusBlurRadius < 1) {
			round = 0.25;
		} else if (defocusBlurRadius < 6) {
			round = 0.5;
		} else {
			round = 1;
		}

		defocusBlurRadius = Math.round(defocusBlurRadius / round) * round;

		var cacheKey = "l:" + layerIndex + ", " + "r:" + defocusBlurRadius;

		if (!(cacheKey in defocusedContextsCache) || (horizontalMotionBlur > 0)) {
			defocusedContextsCache[cacheKey] = cameraEngine.fastBlur(
				layerCanvases[layerIndex], defocusBlurRadius + horizontalMotionBlur, defocusBlurRadius);

			cacheSize++;
			console.log("cache miss, cache size: " + cacheSize);
		}

		return defocusedContextsCache[cacheKey];
	};

	var focusChanged = function (cameraSettings) {
		console.time("focus");

		var bufferContext = hdrBuffer.getContext('2d');

		$.each(layerCanvases, function (i, layerCanvas) {
			var defocusBlurRadius,
				horizontalMotionBlur,
				defocusedBuffer,
				focus = sceneDefinition.layers[
					Math.min(cameraSettings.focusLayer, sceneDefinition.layers.length - 1)].focalDistance;

			defocusBlurRadius = Math.abs(
				1.0 / focus - 1.0 / sceneDefinition.layers[i].focalDistance) /
				(cameraSettings.aperture * cameraSettings.cameraSpec.cropFactor) *
				sceneDefinition.focalLength * sceneDefinition.focalLength / 160;

			horizontalMotionBlur = sceneDefinition.layers[i].horizontalMotionBlur || 0;

			console.log("hblur for layer " + i + " = " + horizontalMotionBlur);

			defocusedBuffer = getDefocusedLayer(i, defocusBlurRadius,
				horizontalMotionBlur * cameraSettings.shutter);
			bufferContext.drawImage(defocusedBuffer, 0, 0);
		});

		console.timeEnd("focus");
	};

	var addLayer = function (image, index) {
		layerCanvases[index] = document.createElement('canvas');
		layerCanvases[index].width = sceneDefinition.width;
		layerCanvases[index].height = sceneDefinition.height;
		layerContexts[index] = layerCanvases[index].getContext('2d');
		layerContexts[index].drawImage(image, 0, 0);
	};

	var drawScene = function (variablesChanged) {
		drawSceneVariables = drawSceneVariables.concat(variablesChanged);

		if (leftToLoad > 0) {
			console.log("drawScene cancelled, still loading");
			return;
		}

		clearTimeout(drawSceneTimer);
		drawSceneTimer = setTimeout(function () {
			var tempVars = drawSceneVariables;
			drawSceneVariables = [];
			actualDrawScene(tempVars);
		}, Math.min(drawSceneTime, 100));
	};

	var actualDrawScene = function (variablesChanged) {
		if (variablesChanged.indexOf("cameraSpec") > -1 || variablesChanged.indexOf("scene") > -1) {
			console.log("cameraSpec changed");

			if (cameraSettings.supportsFocalLength(
					sceneDefinition.focalLength / cameraSettings.cameraSpec.cropFactor)) {
				$('#simulationStatus').text("");
			} else {
				$('#simulationStatus').text('');
			}

			cameraControls.setup(cameraSettings, drawScene,
					sceneDefinition.focalLength / cameraSettings.cameraSpec.cropFactor);
			return;
		}

		var oldAperture = cameraSettings.aperture;
		cameraSettings.calculate(sceneDefinition.sceneEV,
				sceneDefinition.focalLength / cameraSettings.cameraSpec.cropFactor);
		cameraControls.updateDisplay();

		if (oldAperture !== cameraSettings.aperture) {
			variablesChanged.push('aperture');
		}

		console.log("f" + cameraSettings.aperture + "  " + cameraSettings.focus + "m  " +
			Math.floor(cameraSettings.ISO) + "ISO   " + cameraSettings.shutter + "s  " +
			cameraSettings.cameraSpec.cropFactor + "x");

		focusChanged(cameraSettings);

		var bufferContext = hdrBuffer.getContext('2d');

		var startTime = new Date().getTime();
		console.time("drawPhoto");
		console.log("camera EV = " + cameraSettings.EV());
		cameraEngine.drawPhoto(
			bufferContext.getImageData(0, 0, sceneDefinition.width, sceneDefinition.height),
			mainContext, sceneDefinition.sceneEV - cameraSettings.EV() + sceneDefinition.EVOffset,
			cameraSettings.cameraSpec.cropFactor * Math.sqrt(cameraSettings.ISO) * 256 / 600,
			sceneDefinition.hdrToLdrMultiplier);
		console.timeEnd("drawPhoto");

		drawSceneTime = new Date().getTime() - startTime;
	};

	var init = function (_cameraSettings, sceneSelectorElement) {
		cameraSettings = _cameraSettings;

		largeCanvas = document.getElementById('largeCanvas');
		hdrBuffer = document.createElement('canvas');

		if (!largeCanvas || !largeCanvas.getContext) {
			chromeFrameInstallPrompt();
			return;
		}
		else {
			mainContext = largeCanvas.getContext('2d');
			if (!mainContext) {
				chromeFrameInstallPrompt();
				return;
			}
		}

		var defaultScene = 1;

		loadScene(defaultScene);

		sceneSelectorElement.html(mustache.toHtml('sceneSelector', {scenes: scenes}));
		sceneSelectorElement.change(function () {
			var index = sceneSelectorElement.find('option').index(sceneSelectorElement.find('option:selected'));
			console.log('change scene: ', index);
			loadScene(index);
		});

		sceneSelectorElement.find('option').eq(defaultScene).prop('selected', true);
	};

	var loadScene = function (sceneIndex) {
		// reset
		leftToLoad = 0;
		layerImages = [];
		layerCanvases = [];
		layerContexts = [];
		defocusedContextsCache = {};

		sceneDefinition = scenes[sceneIndex];
		console.log("loading scene " + sceneIndex + ": " + sceneDefinition.name);
		$('#sceneInfo').html(mustache.toHtml('sceneInfo', sceneDefinition));

		$('#loading').fadeIn(400);

		$.each(sceneDefinition.layers, function (i, layerDefinition) {
			layerImages[i] = loadImage(layerDefinition.source);
		});
	};

	var chromeFrameInstallPrompt = function () {
		CFInstall.check({
			mode: "overlay",
			destination: "http://bethecamera.com"
		});
	};

	return {
		init : init,
		drawScene : drawScene,
		cache : function () {
			return defocusedContextsCache;
		},
		getFocalLength : function () {
			return sceneDefinition.focalLength;
		}
	};
});
