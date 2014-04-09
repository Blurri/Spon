exports.development = {
	db : 'mongodb://localhost/devDrinkingBuddy'
}

exports.production = {
	db : 'mongodb://heroku:heroku@ds045627.mongolab.com:45627/heroku'
}

exports.test = {
	db : 'mongodb://localhost/testDrinkingBuddy'
}