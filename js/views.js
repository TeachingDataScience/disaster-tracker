var app = app || {};

(function ($) {

    'use strict';

    var params = {
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
    };

    app.AppView = Backbone.View.extend({

        el: '#disaster-app',

        events: {
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

            new app.PaginationView//({ el: '#report-pagination' });

            app.stories.fetch({
                reset: true,
                data: _.extend({}, params, { query: query })
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

            }

            var view = new app.ReportView({ model: story });
            this.$reports.append(view.render().el);
        },

    });

    app.PaginationView = Backbone.View.extend({
        tagName: 'ul',

        template: _.template($('#pagination-template').html()),

        events: {

        },

        initialize: function() {
            this.perPage = 5;

            this.listenTo(app.stories, 'reset', this.addAll);
        },

        addAll: function() {

        },

        render: function() {
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
            this.$el.addClass('report');
            return this;
        }

    });


})(jQuery);
