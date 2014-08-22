module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        meta: {
            banner: '/*\n' +
                ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
                ' *  <%= pkg.description %>\n' +
                ' *  <%= pkg.homepage %>\n' +
                ' *\n' +
                ' *  Copyright (c) <%= grunt.template.today("yyyy") %>\n' +
                ' *  MIT License\n' +
                ' */\n'
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['src/js/jquery.freakload.js'],
                dest: 'dist/js/jquery.freakload.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            my_target: {
                src: ['dist/js/jquery.freakload.js'],
                dest: 'dist/js/jquery.freakload.min.js'
            }
        },
        less: {
            development: {
                options: {
                    paths: ['dist/css']
                },
                files: {
                    'dist/css/main.css': 'src/less/main.less'
                }
            },
            production: {
                options: {
                    paths: ['dist/css'],
                    compress: true,
                    cleancss: true
                },
                files: {
                    'dist/css/main.min.css': 'src/less/main.less'
                }
            }
        },
        jshint: {
            files: ['./*.js', 'src/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        jasmine: {
            src: 'src/**/*.js',
            options: {
                vendor: [
                    'assets/vendor/jquery/dist/jquery.min.js',
                    'assets/vendor/jasmine-jquery/lib/jasmine-jquery.js'
                ],
                specs: 'test/*.spec.js'
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    livereload: true
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ['./*.js', 'test/**/*.js', 'src/**/*.js'],
                tasks: ['jshint', 'concat', 'uglify']
            },
            css: {
                files: '**/*.less',
                tasks: ['less']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine')
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('server', ['connect', 'watch']);
    grunt.registerTask('test', ['jshint', 'jasmine']);
    grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'less']);
};