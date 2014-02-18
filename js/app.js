var app = app || {};

$(function() {
    'use strict';

    var views = ['MapView', 'AppView', 'PaginatedView', 'ReportSearch'];
    _.each(views, function(view) {
        new app[view]();
    });

});
