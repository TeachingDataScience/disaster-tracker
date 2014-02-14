var app = app || {};

String.prototype.trunc = String.prototype.trunc || function(n) {
    return this.length > n ? this.substr(0, this.substr(0, n - 1).lastIndexOf(' ')) + '...' : this;
};

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

                // here is where you do stuff with models
                // alright

                var lead = model.fields['body-html'] ?
                        model.fields['body-html'].trunc(300) : 'No description available';

                return _.extend({}, model.fields, {lead: lead});
            });
        },

        sort: function(keyword) {

        },

    });

    app.stories = new Stories();
})();
