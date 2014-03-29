module.exports = function (grunt) {
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);


	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		//==============
		//BOWER
		//?=============
		bower : {
			install : {
				options : {
					targetDir : 'client/requires',
					layout : 'byComponent'
				}
			}
		},
		//==============
		// CLEAN 
		//==============
		clean : {
			build :['build'],
			dev : {
				src : ['build/app.js', 'build/<%= pkg.name %>.css', 'build/<%= pkg.name %>.js']
			},
			prod : ['dist']
		},

		sass: {
	      options: {
	        includePaths: ['bower_components/foundation/scss']
	      },
	      dist: {
	        // options: {
	        //   outputStyle: 'compressed'
	        // },
	        files: {
	          'client/css/app.css': 'scss/app.scss'
	        }        
	      }
	    },
		//==============
		// BROWSERIFY
		//==============
		browserify : {
			vendor : {
				src : ['client/requires/**/*.js'],
				dest : 'build/vendor.js',
				options : {
					shim : {
						jquery : {
							path : 'client/requires/jquery/js/jquery.js',
							exports : '$'
						},
						underscore : {
							path : 'client/requires/underscore/js/underscore.js',
							exports : '_'
						},
						backbone : {
							path : 'client/requires/backbone/js/backbone.js',
							exports : 'Backbone',
							depends : {
								jquery : '$',
								underscore : '_'
							}
						},
						gmaps : {
							path : 'client/requires/gmaps/js/gmaps.js',
							exports : 'gmaps',
							depends : {
								jquery : '$'
							}
						},
						moment : {
							path : 'client/requires/momentjs/moment.js',
							exports : 'moment'
						}
					}
				}
			},
			app : {
				files : {
					'build/app.js' : ['client/js/app.js']
				},
				options : {
					external : ['jquery', 'underscore', 'backbone' ],
					transform : ['hbsfy']
				}
			}
		},
		


		//==================
		// CONCAT
		//==================
		concat : {
			'build/<%= pkg.name %>.js' : ['build/vendor.js', 'build/app.js'],
			'build/<%= pkg.name %>.css' : [
				'client/css/*.css',
				'client/requires/*/css/*.css',
				'client/requires/*/*.css'
			]
		},
		//=================
		// COPY
		//=================
		copy : {
			dev : {
				files : [{
					src : 'build/<%= pkg.name %>.js',
					dest : 'public/js/<%= pkg.name %>.js'
				}, {
					src : 'build/<%= pkg.name %>.css',
					dest : 'public/css/<%= pkg.name %>.css'
				}, {
					src : 'client/img/*',
					dest : 'public/img/'
				}]
			},
			prod : {
				files : [{
					src : ['client/img/*'],
					dest : 'dist/img/'
				}]
			}
		},
		//===============
		// CSS MINIFICATION
		//===============
		cssmin : {
			minify : {
				src : ['build/<%= pkg.name %>.css'],
				dest : 'dist/css/<%= pkg.name %>.css'
			}
		},
		//==================
		// JAVASCRIPT UGLIFY
		//==================
		uglify : {
			compile : {
				options : {
					compress : true,
					verbose : true
				},
				files : [{
					src : 'build/<%= pkg.name %>.js',
					dest : 'dist/js/<%= pkg.name %>.js'
				}]
			}
		},
		//===================
		// WATCH CLIENT CODE
		//===================
		watch : {
			scripts : {
				files : ['client/views/*', 'client/js/*', 'client/js/**/*', 'client/**/*', 'scss/*.scss'],
				tasks : ['sass','clean:dev', 'browserify:app', 'concat', 'copy:dev']
			}
		},
		//===================
		// NODEMON
		//===================
		nodemon : {
			dev : {
				options : {
					file : 'server.js',
					watchedFolders : ['app', 'server.js'],
					env : {
						PORT : '3000'
					}
				}
			}
		},
		//==================
		// CONCURRENT
		//==================

		concurrent : {
			dev : {
				tasks : ['nodemon', 'watch:scripts'],
				options :{
					logConcurrentOutput : true
				}
			}
		},
		//====================
		//JSHINT
		//====================
		jshint : {
			all : ['Gruntfile.js', 'client/js/**/*.js', '!client/views/*'],
			dev : ['client/src/**/*.js'],
			options :{
				jshintignore : '.jshintignore'
			}
		}
	});

	grunt.registerTask('init:dev', ['clean', 'bower', 'browserify:vendor']);

	grunt.registerTask('build:dev', ['clean:dev', 'sass' ,'browserify:app', 'jshint:dev', 'concat', 'copy:dev']);

	grunt.registerTask('build:prod', ['clean:prod','sass' ,'browserify:vendor', 'browserify:app' ,'jshint:all', 'concat', 'cssmin', 'uglify', 'copy:prod']);

	grunt.registerTask('server', ['build:dev' , 'concurrent:dev']);

}