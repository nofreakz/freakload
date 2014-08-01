module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*\n' +
                ' *  <%= pkg.anme || pkg.author %> - v<%= pkg.version %>\n' +
                ' *  <%= pkg.description %>\n' +
                ' *  <%= pkg.homepage %>\n' +
                ' *\n' +
                ' *  Copyright (c) <%= grunt.template.today("yyyy") %>\n' +
                ' *  GNU License\n' +
                ' */\n'
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['src/freaksound.js'],
                dest: 'dist/freaksound.js'
            }
        },
        jshint: {
            files: ['src/freaksound.js'],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            my_target: {
                src: ['dist/freaksound.js'],
                dest: 'dist/freaksound.min.js'
            }
        },
        watch: {
            files: ['**/*'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};