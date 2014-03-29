var Event = require('../app/models/event');

var date1 = new Date();
date1.addHours(3)

// date1.setHours(date1.getHours() + 3);
var date2 = new Date();
date2.addHours(7);


var array = [
	{
		title : 'first event',
		where : 'In the Pub!',
		description : 'It should be fun at least',
		loc : [8, 47],
		start_time : date1,
		end_time : date2
	},
	{
		title : 'second event',
		where : 'Outside',
		description : 'enjoy the weather',
		loc : [9, 47],
		start_time : date1,
		end_time : date2
	},
	{
		title : 'third event',
		where : 'idk',
		description : 'wherever you like to go!',
		loc : [10, 47],
		start_time : date1,
		end_time : date2
	}
];


module.exports.seed = function () {

	Event.collection.remove(function (err) {
		console.log(err);	
	});

	for(var i in array) {

		new Event(array[i]).save(function (err, newEvent) {
			if (err) {
				console.log(err);
				console.log('ERROR SEED');
			}
			console.log(newEvent);
		})
	}
}