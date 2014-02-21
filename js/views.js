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
                f.properties['marker-color'] = '#FFF';
                f.properties.popup = view.template(f);
            });

            //var coords = _.map(featureCollection,function(m){return m.geometry.coordinates});
            var coords = _.map(featureCollection,function(m){return [m.geometry.coordinates[1],m.geometry.coordinates[0]]}); // LatLng
            var heatLayer = L.heatLayer(coords,{
                gradient: {
                    0.1:"#D86FD0",
                    1:"#D8A86F"
                }
            });

            var markerLayer = new L.MarkerClusterGroup({showCoverageOnHover:false});


            L.geoJson(featureCollection, {
                pointToLayer: L.mapbox.marker.style,
                onEachFeature: function (feature, layer) {

                    var brief = L.popup({
                        closeButton:false,
                        offset: new L.Point(0,-20)
                    }).setContent(feature.properties.popup);

                    layer.on('mouseover',function(){
                        brief.setLatLng(this.getLatLng());
                        view.map.openPopup(brief);
                    }).on('mouseout',function(){
                        view.map.closePopup(brief);
                    }).on('click',function(){
                        return
                    })
                }
            }).addTo(markerLayer);

            // somehow directly addTo(this.map) will only add individual marker layers
            this.map
            .addLayer(heatLayer)
            .addLayer(markerLayer);
        }
    });

    app.AppView = Backbone.View.extend({

        el: '#disaster-app',

        events: {
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


        initialize: function () {

            this.$reports = this.$('#report-list');

            //this.listenTo(app.stories, 'add', this.addOne);
            this.listenTo(app.stories, 'reset', this.addAll);
            //this.listenTo(app.stories, 'change:completed', this.filterOne);
            //this.listenTo(app.stories, 'filter', this.filterAll);
            //this.listenTo(app.stories, 'all', this.render);

            var query = {
                value: 'haiyan',
                fields: {
                    0: 'title'
                },
                operator: 'OR'
            }

            app.stories.fetch({
                reset: true,
                data: _.extend({}, this.params, { query: query })
            });
        },

        render: function () {

        },

        addAll: function() {
            app.stories.each(this.addOne, this);
        },

        addOne: function(story, index) {
            var disaster = story.attributes.disaster;

            if (disaster && disaster.length) {
                // figure out if it's the same disaster we're tracking here
            }

            var view = new app.ReportView({ model: story });
            this.$reports.append(view.render().el);
        },

    });

    app.ReportSearch = Backbone.View.extend({
        el: '#report-search',

        text: {
            hide: 'Hide search options &#x25B2;',
            show: 'Show search options &#x25BC;'
        },

        events: {
            'click #expand-search': 'toggleSearch',
        },

        initialize: function() {
            this.$below = this.$('#search-options');
            this.$toggle = this.$('#expand-search');
            this.toggled = false;

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

    app.ReportView = Backbone.View.extend({

        tagName: 'div',
        template: _.template($('#report-template').html()),

        events: {
        },

        initialize: function() {
        },


        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass('report medium-6 column');
            return this;
        }

    });


})(jQuery);
