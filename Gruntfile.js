module.exports = function(grunt) {
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
                src: ['src/js/freaksound.js'],
                dest: 'dist/js/freaksound.js'
            }
        },
        jshint: {
            files: ['src/js/freaksound.js'],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            my_target: {
                src: ['dist/js/freaksound.js'],
                dest: 'dist/js/freaksound.min.js'
            }
        },
        less: {
            development: {
                options: {
                    paths: ["dist/css"]
                },
                files: {
                    "dist/css/main.css": "src/less/main.less"
                }
            },
            production: {
                options: {
                    paths: ["dist/css"],
                    compress: true,
                    cleancss: true
                },
                files: {
                    "dist/css/main.min.css": "src/less/main.less"
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: '**/*.js',
                tasks: ['jshint']
            },
            css: {
                files: '**/*.less',
                tasks: ['less']
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: "localhost",
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('server', [ 'connect', 'watch' ]);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less']);
};