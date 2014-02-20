var app = app || {};
var app = app || {};

String.prototype.trunc = String.prototype.trunc || function(n) {
    return this.length > n ? this.substr(0, this.substr(0, n - 1).lastIndexOf(' ')) + '...' : this;
};

(function() {
    'use strict';

    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    var Stories = Backbone.Collection.extend({

        model: app.story,
        url: 'http://api.rwlabs.org/v0/report/list',

        initialize: function() {
            this.page = 0;
            typeof(this.perPage) != 'undefined' || (this.perPage = 4);
        },

        parse: function(resp) {

            var models = resp.data ?
                        resp.data.list || resp.data.info || {} :
                        {};

            this.total = models.length;

            var paginated = models.slice(this.page * this.perPage, this.perPage);

            return _.map(paginated, function(model) {

                var fields = model.fields,

                    // truncate the body to 300 characters
                    html = fields['body-html'],
                    lead = html ? html.trunc(180) : 'No description available',

                    // get a date string
                    date = fields.date,
                    dateline = date && date.created ? this.getDate(date.created) : '';

                    return _.extend({}, fields, {lead: lead, dateline: dateline});
            }, this);
        },

        getDate: function(date) {
            var dateObj;
            try {
                dateObj = new Date(date);
            }
            catch(e) {
                return '';
            }
            return [dateObj.getDate(), months[dateObj.getMonth()] + ',', dateObj.getFullYear()].join(' ');
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

    var Markers = Backbone.Collection.extend({
        url:'/data/ph-disasters-locations.geojson',
        parse: function(resp) {
            return resp
        }
    })

    app.stories = new Stories();
    app.markers = new Markers();
})();
