var app = app || {};

(function ($) {

    'use strict';
    var GraphView = Backbone.View.extend({

        initialize: function() {

            console.log('Im alive!!');

        },




    });

    app.historicalGraph = new GraphView();

})(jQuery);
