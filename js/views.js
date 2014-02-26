var app = app || {};

(function ($) {

    'use strict';

    function getToday() {
        var date = new Date(),
            parsed = [date.getMonth() + 1, date.getDate(), date.getFullYear()];

        parsed[0] = parsed[0] < 10 ? '0'.concat(parsed[0]) : parsed[0];
        return parsed.join('-');
    }

    app.MainStoryView = Backbone.View.extend({
        el: '#main-story',
        initialize: function() {
            app.events.on('map:loaded', this.show, this);
        },
        show: function() {
            this.$el.addClass('slide-in');
        }
    });

    app.MapView = Backbone.View.extend({
        el: '#app-map',
        template: _.template($('#marker-template').html()),

        events: {},

        initialize: function() {
            this.listenTo(app.markers, 'reset', this.addMarker);

            app.markers.fetch({
                reset: true
            });

            this.map = L.mapbox.map('app-map', 'jue.hb9ikea3',{
                minZoom:3,
                maxZoom:8,
                scrollWheelZoom:false
            });

            var onload = $.proxy(this.onload, this);

            window.setTimeout(onload, 800);
        },

        onload: function() {
            // this.show();
            app.events.trigger('map:loaded');
        },

        show: function() {
            this.$el.addClass('show');
        },

        fade: function() {
            this.$el.removeClass('show');
        },

        addMarker: function(){
            var view = this;

            var featureCollection = app.markers.toJSON();

            _.each(featureCollection,function(f){
                f.properties['marker-size'] = 'small';
                f.properties['marker-color'] = '#E68080';
                f.properties.popup = view.template(f);
            });

            L.geoJson(featureCollection, {
                pointToLayer: L.mapbox.marker.style,
                onEachFeature: function (feature, layer) {
                    var brief = L.popup({
                        closeButton: false,
                        minWidth: 320,
                        offset: new L.Point(0,-20)
                    })
                    .setContent(feature.properties.popup)
                    .setLatLng(layer.getLatLng());

                    view.map.openPopup(brief);
                    layer.bindPopup(brief);
                }
            }).addTo(this.map);
        }
    });

    app.AppView = Backbone.View.extend({

        el: '#disaster-app',
        initialize: function () {

            // model containers
            this.$reports = this.$('#report-list');
            this.$tweets = this.$('#tweet-list');

            this.listenTo(app.stories, 'reset', this.addReports);
            this.listenTo(app.tweets, 'reset', this.addTweets);

            app.events.trigger('app:start');

            app.tweets.fetch({
                reset: true
            });
        },

        addReports: function() {
            this.$reports.empty();
            app.stories.each(this.addStory, this);
        },

        addStory: function(story, index) {
            var disaster = story.attributes.disaster;

            if (disaster && disaster.length) {
                // figure out if it's the same disaster we're tracking here
            }

            var reportView = new app.ReportView({ model: story });
            this.$reports.append(reportView.render().el).fadeIn(200);
        },

        addTweets: function() {
            app.tweets.each(this.addTweet, this);
        },

        addTweet: function(tweet, index) {
            // TODO tweets should link
            var tweetView = new app.TweetView({model: tweet});
            this.$tweets.append(tweetView.render().el);
        }
    });

    app.ReportSearch = Backbone.View.extend({
        el: '#report-search',

        text: {
            hide: 'General',
            show: 'Advanced'
        },

        events: {
            'click #expand-search': 'toggleSearch',
            'submit': 'updateQuery'
        },

        initialize: function() {
            // listen for the initial query
            app.events.once('app:start', this.updateQuery, this);

            // hidden 'advanced search' form els
            this.$below = this.$('#search-options');
            this.$toggle = this.$('#expand-search');
            this.toggled = false;

            // cache form elements
            this.$forms = {
                query:      this.$('#report-query-value'),
                dateStart:  this.$('#datepicker-start'),
                dateEnd:    this.$('#datepicker-end'),
                limit:      this.$('#report-number'),
                exclude:    this.$('#report-exclude')
            };

            // init datepicker
            var opts = {format: 'mm-dd-yyyy'};
            this.$forms.dateStart
                .val('01-01-2013')
                .fdatepicker(opts);
            this.$forms.dateEnd
                .val(getToday())
                .fdatepicker(opts);
        },

        params: {
            limit: 20,
            fields: {
                include: {
                    0: 'body-html',
                    1: 'country',
                    2: 'date',
                    3: 'disaster',
                    4: 'file',
                    5: 'headline',
                    6: 'ocha_product',
                    7: 'origin',
                    8: 'source',
                    9: 'title',
                    10: 'url',
                    11: 'vulnerable_groups',
                    12: 'headline',
                    13: 'language',
                }
            }
        },

        query: {
            value: '',
            fields: {
                0: 'title'
            },
            operator: 'OR'
        },

        filter: {
            operator: 'AND',
            conditions: {
                0: {
                    field: 'title',
                    value: '',
                    negate: true
                },
                1: {
                    field: 'date.created',
                    value: {
                        from: '',
                        to: ''
                    },
                }
            }
        },

        updateQuery: function() {

            var target = '',
                dateStart,
                dateEnd;

            // check to make sure there is a query, and it's not a repeat
            // if no value, default to Haiyan
            target = this.$forms.query.val();
            if (target && target !== this.query.value) {
                this.query.value = target;
            }
            else {
                app.events.trigger('reports-search:error', this.$forms.query);
                this.query.value = 'Haiyan';
            }

            // verify there's a limit, if not set to 20
            target = parseInt(this.$forms.limit.val(), 10);
            if (!target || target === NaN) {
                this.params.limit = 20;
                this.$forms.limit.val('');
            }
            else if (target <= 0 || target > 1000) {
                app.events.trigger('reports-search:error', this.$forms.limit);
            }
            else {
                this.params.limit = target;
            }

            // is start date later than end date?
            target = this.$forms.dateStart.val().split('-');
            dateStart = new Date(target[2], target[1], target[1]).getTime();

            target = this.$forms.dateEnd.val().split('-');
            dateEnd = new Date(target[2], target[1], target[1]).getTime();

            if (dateEnd < dateStart) {
                app.events.trigger('reports-search:error', this.$forms.dateEnd);
            }
            else {
                this.filter.conditions[1].value.from = dateStart;
                this.filter.conditions[1].value.to = dateEnd;
            }

            // remove any commas from exclude
            target = this.$forms.exclude.val();
            if (target) {
                target = target.replace(/,/g, '');
                this.filter.conditions[0].value = target;
            }
            else {
                this.filter.conditions[0].value = 'zzzxxxxzzz';
            }

            this.newApiSearch();
            return false;
        },

        newApiSearch: function() {
            console.log(_.extend({}, this.params, { query: this.query, filter: this.filter }));
            app.stories.fetch({
                reset: true,
                data: _.extend({}, this.params, { query: this.query, filter: this.filter })
            });
        },

        toggleSearch: function() {
            // TODO since we're using pure css, problem with transparent element covering up stuff below.
            // implement a JS solution or a better CSS solution.
            this.toggled = !this.toggled;
            this.$below.toggleClass('hidden');

            var toggleText = this.toggled ?
                this.text.hide : this.text.show;

            this.$toggle.html(toggleText);

            return false;
        },

    });

    app.PaginatedView = Backbone.View.extend({

        el: '#report-pagination',
        template: _.template($('#pagination-template').html()),

        name: 'pager',

        events: {
            'click .prev': 'previous',
            'click .next': 'next',
            'click .pagination-item': 'jump'
        },

        initialize: function() {
            this.$after = this.$('.prev');

            this.listenTo(app.stories, 'reset', this.render);
            this.listenTo(app.stories, 'reflow', this.reflow);
        },

        render: function() {
            this.$after.empty();
            this.pageInfo = app.stories.pageInfo();

            var fragment = new Array(this.pageInfo.pages),
                i = 0,
                ii = fragment.length;

            for(; i < ii; ++i) {
                fragment[i] = this.renderOne(i);
            }

            this.$after.after($(fragment.join('')));
            this.refresh();
        },

        renderOne: function(index) {
            return this.template({num: index, id: this.name.concat(index)});
        },

        previous: function() {
            app.stories.previousPage();
            return false;
        },

        next: function() {
            app.stories.nextPage();
            return false;
        },

        jump: function(event) {
            var target = event.currentTarget.id.slice(this.name.length);

            if (this.pageInfo.page !== target) {
                app.stories.jump(event.currentTarget.id.slice(this.name.length));
            }

            return false;
        },

        reflow: function() {
            this.pageInfo = app.stories.pageInfo();
            this.refresh();
        },

        refresh: function() {
            this.$('.current').removeClass('current');
            this.$('.pagination-item').eq(this.pageInfo.page).addClass('current');
        }


    });

    app.TweetView = Backbone.View.extend({
        tagName: 'div',
        template: _.template($('#tweet-template').html()),
        render: function() {
            // check for number of model
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass('report medium-4 column')
            return this
        }
    });

    app.ReportView = Backbone.View.extend({

        tagName: 'div',
        template: _.template($('#report-template').html()),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass('report medium-6 column');
            return this;
        }

    });


})(jQuery);
