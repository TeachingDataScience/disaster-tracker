(function ($) {

    'use strict';

    function getToday() {
        var date = new Date(),
            parsed = [date.getMonth() + 1, date.getDate(), date.getFullYear()];

        parsed[0] = parsed[0] < 10 ? '0'.concat(parsed[0]) : parsed[0];
        parsed[1] = parsed[1] < 10 ? '0'.concat(parsed[1]) : parsed[1];
        return parsed.join('-');
    }

    app.MapView = Backbone.View.extend({
        el: '#app-map',
        template: _.template($('#marker-template').html()),

        initialize: function() {
            // create markers to place on the map
            this.listenTo(app.markers, 'reset', this.addMarker);
            app.markers.fetch({ reset: true });

            // initialize the map
            this.map = L.mapbox.map('app-map', 'reliefweb.map-hoc0l4hc', {
                minZoom: 3,
                maxZoom: 8,
                scrollWheelZoom: false
            });
        },

        addMarker: function(){
            var view = this,
                featureCollection = app.markers.toJSON();

            _.each(featureCollection, function(f){
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


    app.ReportView = Backbone.View.extend({
        el: '#report-list',
        tagName: 'div',
        template: _.template($('#report-template').html()),

        initialize: function() {
            this.listenTo(app.stories, 'reset', this.addReports);
            // is it necessary to do both resets and reflows?
            this.listenTo(app.stories, 'reflow', this.addReports);
        },

        addReports: function() {
            var template = this.template;
            this.$el.empty().html(_.map(app.stories.getPage(), function(model) {
                return template(model.toJSON());
            }).join(''));
        }
    });


    app.TweetView = Backbone.View.extend({
        el: '#tweet-list',
        tagName: 'div',
        template: _.template($('#tweet-template').html()),

        initialize: function() {
            this.listenTo(app.tweets, 'reset', this.addTweets);
            app.tweets.fetch({ reset: true });
        },

        addTweets: function() {
            var template = this.template;
            this.$el.empty().html(_.map(app.tweets.models, function(model) {
                return template(model.toJSON());
            }).join(''));
        }
    });


    app.DemographicTable = Backbone.View.extend({
        el: '#demographic-chart',
        tagName:'div',
        template: _.template($('#demo-template').html()),

        initialize: function() {
            this.listenTo(app.demographics, 'reset', this.addDemographics);
            app.demographics.fetch({ reset: true });
        },

        addDemographics: function(){
            var template = this.template;
            this.$el.empty().html(_.map(app.demographics.models, function(model) {
                return template(model.toJSON());
            }).join(''));
        }
    });


    app.ReportSearch = Backbone.View.extend({
        el: '#report-search',

        text: {
            hide: 'Hide',
            show: 'More Options'
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

        limit: 20,

        params: {
            limit: 0,
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
                    14: 'format'
                }
            }
        },

        filter: {
            operator: 'AND',
            conditions: {

                // keywords to exclude
                0: {
                    field: 'title',
                    value: '',
                    negate: true
                },

                // date ranges
                1: {
                    field: 'date.created',
                    value: {
                        from: '',
                        to: ''
                    },
                },

                // removing formats we don't want
                2: {
                    field: 'format.name',
                    value: {
                        0: 'News and Press',
                        1: 'Infographic',
                        2: 'Map'
                    },
                    operator: 'OR',
                    negate: true
                },

                3: {
                    field: 'country.iso3',
                    value: 'gin'
                },

                4: {
                    field: 'language.code',
                    value: 'en'
                },

                5: {
                    field: 'disaster.glide',
                    value: 'EP-2014-000041-GIN'
                }
            }
        },

        sort: {
            0: 'date:desc'
        },

        query: {
            value: '',
            fields: {
                0: 'title'
            },
            operator: 'OR'
        },

        updateQuery: function() {

            var target = '',
                dateStart,
                dateEnd;

            // check to make sure there is a query, and it's not a repeat
            // if no value, set to default in config, defined in init.js
            target = this.$forms.query.val();
            if (target && target !== this.query.value) {
                this.query.value = target;
            }
            else {
                //app.events.trigger('reports-search:error', this.$forms.query);
                this.query.value = '';
            }

            // verify there's a limit, if not set to 20
            target = parseInt(this.$forms.limit.val(), 10);
            if (!target || target === NaN) {
                this.params.limit = this.limit;
                this.$forms.limit.val('');
            }
            else if (target <= 0 || target > 1000) {
                //app.events.trigger('reports-search:error', this.$forms.limit);
            }
            else {
                this.params.limit = target;
            }

            // is start date later than end date?
            target = this.$forms.dateStart.val().split('-');
            dateStart = new Date(target[2], target[0], target[1]).getTime();

            target = this.$forms.dateEnd.val().split('-');
            dateEnd = new Date(target[2], target[0], target[1]).getTime();

            if (dateEnd < dateStart) {
                //app.events.trigger('reports-search:error', this.$forms.dateEnd);
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
            // console.log(_.extend({}, this.params, { query: this.query, filter: this.filter }));
            app.stories.fetch({
                reset: true,
                data: _.extend({}, this.params, {
                    query: this.query,
                    filter: this.filter,
                    sort: this.sort
                })
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
            // remove the old pagination items
            this.$('.pagination-item').remove();

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
            return this.template({num: index + 1, id: this.name.concat(index)});
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
                app.stories.jump(parseInt(event.currentTarget.id.slice(this.name.length), 10));
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

})(jQuery);
