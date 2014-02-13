var app = app || {};

(function ($) {

    'use strict';

    var params = {
        limit: 20,
        fields: {
            include: {
                0: 'body',
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
                12: 'headline'
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
                }
            }

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
            var view = new app.ReportView({ model: story });
            this.$reports.append(view.render().el);
        },

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
            return this;
        }

    });


})(jQuery);