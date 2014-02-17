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
            this.$el.addClass('report');
            return this;
        }

    });


})(jQuery);
