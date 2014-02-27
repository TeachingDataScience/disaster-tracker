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

        set         : [],
        start       : 1940,
        end         : 2014,

        max         : 0,
        min         : 0,

        stack       : d3.layout.stack(),
        entities    : [],

        initialize: function() {

            this.listenTo(app.historical, 'reset', this.render);
            app.historical.fetch({reset: true});

            this.svg = d3.select('#historical-chart')
                .append('svg:svg')
                .attr('width', this.width)
                .attr('height', this.height)
              .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

            this.height -= (this.margin.top + this.margin.bottom);
            this.width -= (this.margin.right + this.margin.left);

            this.x.domain(d3.range(this.start, this.end))
                .rangeRoundBands([0, this.width], .08);

            this.y.range([this.height, 0]);

        },

        render: function() {

            this.set = app.historical.yearsFrom(this.start);

            var max = d3.max(_.map(this.set, function(year) {
                return _.reduce(year, function(memo, model) {
                    return memo + model.attributes.no_killed;
                }, 0);
            }));

            this.y.domain([0, max]);

            var y = this.y,
                x = this.x;

            _.each(this.set, function(year) {
                _.reduce(year, function(memo, model) {
                    model.attributes.y = y(model.attributes.no_killed + parseInt(memo, 10));
                    model.attributes.y0 = y(model.attributes.no_killed);
                    return memo + model.attributes.no_killed;
                }, 0);
            });

            var layer = this.svg.selectAll('layer')
                .data(this.set)
              .enter().append('g')
                .attr('class', 'layer');

            var rect = layer.selectAll('rect')
                .data(function(d) { return d })
              .enter().append('rect')
                .attr('x', function(d) { return x(parseInt(d.attributes.year, 10)) })
                .attr('y', this.height)
                .attr('width', x.rangeBand())
                .attr('height', 0)
                .attr('class', function(d) {
                    var cls = d.attributes.dis_type.split(' ');
                    console.log(cls[0]);
                    return cls[0].toLowerCase();
                });

            rect.transition()
                .delay(function(d, i) { return i * 10; })
                .attr('y', function(d) { return d.attributes.y })
                .attr('height', function(d) { return d.attributes.y0 });
        }

    });

    app.historicalGraph = new GraphView();

})(jQuery);
