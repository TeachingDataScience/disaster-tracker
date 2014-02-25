var app = app || {};

(function ($) {

    'use strict';

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

            this.listenTo(app.stories, 'reset', this.addStories);
            this.listenTo(app.tweets, 'reset', this.addTweets);

            app.events.trigger('app:start');

            app.tweets.fetch({
                reset: true
            });
        },

        addStories: function() {
            app.stories.each(this.addStory, this);
        },

        addStory: function(story, index) {
            var disaster = story.attributes.disaster;

            if (disaster && disaster.length) {
                // figure out if it's the same disaster we're tracking here
            }

            var reportView = new app.ReportView({ model: story });
            this.$reports.append(reportView.render().el);
        },

        addTweets: function() {
            console.log(app.tweets);
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
            this.$below = this.$('#search-options');
            this.$toggle = this.$('#expand-search');
            this.toggled = false;

            app.events.once('app:start', this.newApiSearch, this);

            // call datepicker on our input fields
            this.$dates = {
                start: this.$('#datepicker-start'),
                end: this.$('#datepicker-end')
            };

            // TODO deal with default
            _.each(this.$dates, function($date) {
                $date.fdatepicker({
                    format: 'mm-dd-yyyy'
                });
            });
        },

        params: {
            limit: 30,
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
            value: 'haiyan',
            fields: {
                0: 'title'
            },
            operator: 'OR'
        },

        updateQuery: function() {

            return false;
        },

        newApiSearch: function() {
            console.log('in start!');
            app.stories.fetch({
                reset: true,
                data: _.extend({}, this.params, { query: this.query })
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
