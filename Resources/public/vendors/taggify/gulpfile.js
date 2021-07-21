/* globals require, process */

'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    Server = require('karma').Server,
    gutil = require('gulp-util');

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('lint', function () {
    return gulp.src('src/js/taggify.js').pipe(jshint());
});

gulp.task('default', ['lint', 'test']);
