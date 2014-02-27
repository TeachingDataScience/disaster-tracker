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

            this.page = 0;

            return _.map(models, function(model) {
                var fields = model.fields,

                    // truncate the body to 300 characters
                    html = fields['body-html'],
                    lead = html ? html.trunc(140) : 'No description available',

                    // get a date string
                    date = fields.date,
                    dateline = date && date.created ? this.getDate(date.created) : '';

                    return _.extend({}, fields, {lead: lead, dateline: dateline});
            }, this);
        },

        getPage: function() {
            var start = this.page * this.perPage,
                end = start + this.perPage;
            end = (end < this.total) ? end : this.total;
            return this.models.slice(start, end);
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
        }
    });

    var Tweets = Backbone.Collection.extend({
        model: app.tweet,
        url: 'https://s3-us-west-2.amazonaws.com/reliefweb/tweets.json',
        //url: '/data/tweets.json',
        parse: function(resp) {
            return resp.slice(0, 12);
        }
    });

    var Markers = Backbone.Collection.extend({
        url:'/data/current.geojson'
    });

    var Historical = Backbone.Collection.extend({
        url: '/data/ph-disasters-all.json',
        entitles: [],
        parse: function(resp) {

            this.entities = _.chain(resp)
                .groupBy(function(obj) { return obj.dis_type })
                .keys().value();

            return resp;
        },

        yearsFrom: function(start) {
            var years = _.chain(this.models)
                .groupBy(function(model) { return model.attributes.year })
                .toArray()
                .filter(function(year) {
                    return parseInt(year[0].attributes.year, 10) >= start
                })
                .value();
            return years;
        }
    })

    var Demographic = Backbone.Collection.extend({
        url:'http://data.undp.org/resource/e6xu-b22v.json',
    });

    var Demographic0 = Backbone.Collection.extend({
        url:'http://data.undp.org/resource/wxub-qc5k.json',
    });

    app.stories = new Stories();
    app.tweets = new Tweets();
    app.markers = new Markers();
    app.historical = new Historical();
    app.demographics = new Demographic();
    app.demographics0 = new Demographic0();
})();
