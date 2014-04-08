module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false,
                compress: {
                    drop_console: false
                },
                banner: '/* <%= pkg.name %> */\n'
            },

            my_target: {
                files: {
                    'build/js/foundation.min.js' : ['lib/js/fastclick.js', 'lib/js/foundation.min.js', 'lib/js/foundation.magellan.js', 'lib/js/foundation-datepicker.js'],
                    'build/js/<%= pkg.name %>.js' : ['dev/js/init.js', 'dev/js/events.js', 'dev/js/models.js', 'dev/js/collections.js', 'dev/js/views.js', 'dev/js/graph-view.js', 'dev/js/app.js'],
                    'build/js/lib.min.js' : ['lib/js/underscore-1.5.2.js', 'lib/js/backbone-1.1.0.js', 'lib/js/mapbox.js', 'lib/js/leaflet.markercluster.js', 'lib/js/d3.v3.min.js']
                }
            }
        },

        cssmin: {
            combine: {
                files: {
                    'build/css/<%= pkg.name %>.min.css' : ['dev/css/markercluster.css', 'dev/css/style.css', 'dev/css/graph.css'],
                    'build/css/lib.min.css' : ['lib/css/foundation.css', 'lib/css/foundation-datepicker.css'/*, 'lib/css/font-awesome.css'*/]
                }
            }
        },

        watch: {
            scripts: {
                files: ['dev/js/*.js'],
                tasks: ['newer:uglify'],
                options: {
                    debounceDelay: 250
                }
            },
            styles: {
                files: ['dev/css/*.css'],
                tasks: ['newer:cssmin'],
                options: {
                    debounceDelay: 250
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['newer:uglify', 'newer:cssmin']);
}
