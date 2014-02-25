var app = app || {};

$(function() {
    'use strict';

    var views = ['MainStoryView', 'MapView', 'PaginatedView', 'ReportSearch', 'AppView' ];
    _.each(views, function(view) {
        new app[view]();
    });

});
