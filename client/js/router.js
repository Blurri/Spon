var DetailEvent = require('./controllers/events').detailEvent;
var Event = require('./controllers/events').eventModel;

exports.start = function (collection) {
    var collection = collection;
    var AppRouter = Backbone.Router.extend({
        routes: {
            'detailEvent/:eventId' : 'detailEvent'
        }
    });
    // Initiate the router
    var app_router = new AppRouter;

    app_router.on('route:detailEvent', function(eventId) {
        
        var view = new DetailEvent();
        if (collection.get(eventId)) {
            view.render(collection.get(eventId));
        }else {
            var event = new Event();
            event.url = '/findEvent',
            event.fetch({data : {id : eventId}});
            view.render(collection.get(eventId));
        }
        app_router.navigate('/', true);
    
    })

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();   
}