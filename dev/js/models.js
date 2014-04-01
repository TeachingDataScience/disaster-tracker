(function() {

    'use strict';

    app.story = Backbone.Model.extend({
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
})();
