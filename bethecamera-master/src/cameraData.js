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
		// {
		// 	name : "Pełna klatka DSLR",
		// 	cropFactor: 1,
		// 	ISO: {
		// 		extraMin: 50,
		// 		min: 100,
		// 		max: 25600,
		// 		extraMax: 102400
		// 	},
		// 	lens: [
		// 		{
		// 			focalLength : 24,
		// 			maxAperture : 4
		// 		},
		// 		{
		// 			focalLength : 105,
		// 			maxAperture : 4
		// 		}
		// 	]
		// },
		// {
		// 	name : "1.6X Crop DSLR",
		// 	cropFactor : 1.6,
		// 	ISO: {
		// 		min: 100,
		// 		max: 6400,
		// 		extraMax: 12800
		// 	},
		// 	lens: [
		// 		{
		// 			focalLength : 50,
		// 			maxAperture : 1.8
		// 		}
		// 	]
		// },
		// {
		// 	name : "1.6X Crop DSLR",
		// 	cropFactor : 1.6,
		// 	ISO: {
		// 		min: 100,
		// 		max: 6400,
		// 		extraMax: 12800
		// 	},
		// 	lens: [
		// 		{
		// 			focalLength : 18,
		// 			maxAperture : 3.5
		// 		},
		// 		{
		// 			focalLength : 55,
		// 			maxAperture : 5.6
		// 		}
		// 	]
		// },
		// {
		// 	name : 'Kompakt',
		// 	cropFactor : 6.1,
		// 	ISO: {
		// 		min: 100,
		// 		max: 1600
		// 	},
		// 	lens: [
		// 		{
		// 			focalLength : 5,
		// 			maxAperture : 2.8
		// 		},
		// 		{
		// 			focalLength : 25,
		// 			maxAperture : 6.9
		// 		}
		// 	]
		// },
		// {
		// 	name : 'Telefon',
		// 	cropFactor : 7.64,
		// 	ISO: {
		// 		min: 80,
		// 		max: 1000
		// 	},
		// 	lens : [
		// 		{
		// 			focalLength : 3.85,
		// 			maxAperture : 2.8
		// 		}
		// 	]
		// }
	];

	return {
		cameras : cameras
	};
});
