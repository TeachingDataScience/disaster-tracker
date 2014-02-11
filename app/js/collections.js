var app = app || {};

(function() {
    'use strict';

    var Stories = Backbone.Collection.extend({

        model: app.story,

        url: 'http://api.rwlabs.org/v0/report/list',

        parse: function(resp) {

            var models = resp.data ?
                        resp.data.list || resp.data.info || {} :
                        {};

            return _.map(models, function(model) {
                return model.fields;
            });
        },

        sort: function(keyword) {

        },

    });

    app.stories = new Stories();
})();
