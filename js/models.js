var app = app || {};

(function() {

    'use strict';

    app.story = Backbone.Model.extend({

        // this is the story model. I'm going to make a separate one for tweets
        defaults: {
            body: '',
            country: [],
            date: {},
            disaster: [],
            origin: '',
            source: [],
            title: '',
            url: '',
            vulnerable_groups: [],
            headline: [],
            language: []
        },
    });

    app.tweet = Backbone.Model.extend({});

    app.marker = Backbone.Model.extend({});
})();
