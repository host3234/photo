"use strict";

define(function () {
	var cameras = [
		{
			name : "Pełna klatka DSLR",
			cropFactor: 1,
			ISO: {
				extraMin: 50,
				min: 100,
				max: 6400,
				extraMax: 25600
			},
			lens: [
				{
					focalLength : 70,
					maxAperture : 2.8
				},
				{
					focalLength : 200,
					maxAperture : 2.8
				}
			]
		},
	];
	return {
		cameras : cameras
	};
});
