$(function() {
    'use strict';

    $(document).foundation();
    $('.sub-nav dd').first().next().addClass('active');

    var views = [
        'MapView',
        'PaginatedView',
        'ReportSearch',
        'ReportView',
        'TweetView',
        'HistoricalGraph',
        'DemographicTable'
    ];

    _.each(views, function(view) {
        new app[view]();
    });

    app.events.trigger('app:start');

});
