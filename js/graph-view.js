var app = app || {};

(function ($) {

    'use strict';
    var GraphView = Backbone.View.extend({

        el: '#historical-chart',

        margin: {
            top             : 40,
            right           : 10,
            bottom          : 20,
            left            : 10
        },

        width       : 1000,
        height      : 600,
        x           : d3.scale.ordinal(),
        y           : d3.scale.linear(),
        xAx         : d3.svg.axis(),
        yAx         : d3.svg.axis(),

        initialize: function() {
            this.listenTo(app.historical, 'reset', this.render);
            app.historical.fetch({reset: true});

            this.svg = d3.select('#historical-chart')
                .append('svg:svg')
                .attr('width', this.width)
                .attr('height', this.height);

            this.height -= (this.margin.top + this.margin.bottom);
            this.width -= (this.margin.right + this.margin.left);
        },

        render: function(resp) {
            console.log(resp);



        }

    });

    app.historicalGraph = new GraphView();

})(jQuery);
