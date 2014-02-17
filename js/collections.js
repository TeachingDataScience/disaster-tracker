var app = app || {};

String.prototype.trunc = String.prototype.trunc || function(n) {
    return this.length > n ? this.substr(0, this.substr(0, n - 1).lastIndexOf(' ')) + '...' : this;
};

(function() {
    'use strict';

    var Stories = Backbone.Collection.extend({

        model: app.story,
        url: 'http://api.rwlabs.org/v0/report/list',

        initialize: function() {
            this.page = 0;
            typeof(this.perPage) != 'undefined' || (this.perPage = 5);
        },

        parse: function(resp) {

            var models = resp.data ?
                        resp.data.list || resp.data.info || {} :
                        {};

            this.total = models.length;

            var paginated = models.slice(this.page * this.perPage, this.perPage);
            return _.map(paginated, this.truncate);
        },

        // trims leading paragraph to 300 characters and returns an object with that property
        truncate: function(model) {
            var lead = model.fields['body-html'] ?
                    model.fields['body-html'].trunc(300) : 'No description available';
            return _.extend({}, model.fields, {lead: lead});
        },

        // returns an object that describes the state of pagination
        pageInfo: function() {
            return {
                page: this.page,
                pages: Math.ceil(this.total / this.perPage),
                perPage: this.perPage,
            };
        },

        nextPage: function() {
            if (this.page < this.pageInfo().pages - 1) {
                this.page = this.page + 1;
                this.trigger('reflow');
            }
            return false;
        },

        previousPage: function() {
            if (this.page >= 1) {
                this.page = this.page - 1;
                this.trigger('reflow');
            }
            return false;
        },

        jump: function(toPage) {
            this.page = toPage;
            this.trigger('reflow');
            return false;
        },

        sort: function(keyword) {

        },

    });

    app.stories = new Stories();
})();
