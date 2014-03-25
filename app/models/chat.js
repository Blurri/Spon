var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var chatMessagesSchema = new Schema({
	created_at : { type : Date, default : Date.now },
	nickname : String,
	message : String 
})

var chatSchema = new Schema({
	messages : [chatMessagesSchema]
})



module.exports = mongoose.model('Chat', chatSchema);