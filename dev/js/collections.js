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
                    title = fields.title,
                    lead = title ? title.trunc(90) : 'No description available',

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
        url: 'https://s3-us-west-2.amazonaws.com/reliefweb/tweets.json',
    });

    var Markers = Backbone.Collection.extend({
        url:'data/current.geojson'
    });

    var Demographics = Backbone.Collection.extend({

        // original source for population data
        // url:'http://data.undp.org/resource/e6xu-b22v.json',

        // original source for life expectancy data
        // url:'http://data.undp.org/resource/wxub-qc5k.json',
        url: 'data/gin-demographics.json'
    });


    var Historical = Backbone.Collection.extend({
        url: 'data/gin-disasters-all.json',
        entitles: [],
        parse: function(resp) {
            this.entities = _.chain(resp)
                .groupBy(function(obj) { return obj.dis_group })
                .keys().value();

            return resp;
        },

        yearsFrom: function(start) {
            var years = _.chain(this.models)
                .groupBy(function(model) { return model.attributes.start })
                .toArray()
                .filter(function(year) {
                    return parseInt(year[0].attributes.start, 10) >= start
                })
                .value();
            return years;
        }
    });

    app.stories = new Stories();
    app.tweets = new Tweets();
    app.markers = new Markers();
    app.demographics = new Demographics();
    app.historical = new Historical();
})();
