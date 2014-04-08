(function ($) {

    'use strict';

    app.HistoricalGraph = Backbone.View.extend({

        el: '#historical-chart',

        margin: {
            top             : 20,
            right           : 40,
            bottom          : 20,
            left            : 10
        },

        width       : 800,
        height      : 300,
        x           : d3.scale.ordinal(),
        y           : d3.scale.linear(),

        set         : [],
        start       : 1981,
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
                    model.attributes.y0 = parseInt(memo, 10);
                    return memo + model.attributes.no_killed;
                }, 0);
            }));

            this.y.domain([0, max]);

            var y = this.y,
                x = this.x;
                S
            var xAx = d3.svg.axis()
                .scale(x)
                .tickSize(0)
                .tickPadding(6)
                .orient('bottom')
                .tickFormat(function(d) {
                    return d % 10 === 0 ? d : '';
                });

            var yAx = d3.svg.axis()
                .scale(y)
                .tickSize(0)
                .tickPadding(6)
                .ticks(4)
                .orient('right');

            var layer = this.svg.selectAll('layer')
                .data(this.set)
              .enter().append('g')
                .attr('class', 'layer');

            var rect = layer.selectAll('rect')
                .data(function(d) { return d })
              .enter().append('rect')
                .attr('x', function(d) { return x(parseInt(d.attributes.start, 10)) })
                .attr('y', function(d) { return y(d.attributes.y0 + d.attributes.no_killed) })
                .attr('width', x.rangeBand())
                .attr('height', function(d) { return y(d.attributes.y0) - y(d.attributes.y0 + d.attributes.no_killed) })
                .attr('class', function(d) {
                    var cls = d.attributes.dis_group.split(' ');
                    return cls[0].toLowerCase();
                });

            this.svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(xAx);

            this.svg.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + this.width + ',0)')
                .call(yAx);
        }
    });

})(jQuery);
