var EventView = require('./controllers/events').newEvent;


exports.start = function (EventListener) {

    var eventListener = EventListener;
    var AppRouter = Backbone.Router.extend({
        routes: {
            "newEvent/:lng/:lat": "newEvent" 
        }
    });
    // Initiate the router
    var app_router = new AppRouter;

    app_router.on('route:newEvent', function(lng, lat) {
        // alert(lng + 'hallo' + lat);
        var view = new EventView();
        view.render(eventListener);
    })

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();   
}