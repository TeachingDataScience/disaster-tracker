module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: false,
                compress: {
                    drop_console: true
                },
                banner: '/* <%= pkg.name %> */\n'
            },
            files: {
                'build/js/<%= pkg.name %>.js' : ['dev/js/init.js', 'dev/js/events.js', 'dev/js/models.js', 'dev/js/collections.js', 'dev/js/views.js', 'dev/js/graph-view.js', 'dev/js/app.js']
            }
        },

        cssmin: {
            combine: {
                files: {
                    'build/css/<%= pkg.name %>.min.css' : ['dev/css/markercluster.css', 'dev/css/style.css', 'dev/css/graph.css']
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['uglify', 'cssmin']);
}
