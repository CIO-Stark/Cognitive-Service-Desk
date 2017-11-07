/*jslint node: true, nomen:true*/
(function () {
    'use strict';

    var gulp = require("gulp"),
        argv = require('yargs').argv,
        browserify = require("gulp-browserify"),
        imageResize = require("gulp-image-resize"),
        gutil = require("gulp-util"),
        watch = require("gulp-watch"),
        filter = require("gulp-filter"),
        uglify = require("gulp-uglify"),
        imagemin = require("gulp-imagemin"),
        rename = require("gulp-rename"),
        cssnano = require("cssnano"),
        cache = require("gulp-cache"),
        postcss = require("gulp-postcss"),
        autoprefixer = require("autoprefixer"),
        changed = require("gulp-changed"),
        supportedBrowsers = [">0.1%"],
        processors = [
            autoprefixer({
                "remove": false,
                "browsers": supportedBrowsers
            }),
            cssnano()
        ];

    gulp.task("build-analytics", ["browserify-analytics"]);

    gulp.task("watch-analytics", function () {
        gulp.watch("./public/analytics/js/*.js", ['browserify-analytics']);

    });

    gulp.task("browserify-analytics", function () {
        var production = gutil.env.type === "production";

        return gulp.src("./public/analytics/main.script.js", {read: false})

        // Browserify, and add source maps if this isn"t a production build
            .pipe(browserify({
                debug: !production
            }))

            // Rename the destination file
            .pipe(rename("bundle.js"))
            .pipe(gulp.dest("./public/analytics/dist/js/"))
            .pipe(uglify())
            .pipe(rename({suffix: ".min"}))

            // Output to the build directory
            .pipe(gulp.dest("./public/analytics/dist/js/"));
    });

    gulp.task("browserify-themes", function () {

        return gulp.src("./public/themes-disclaimer/main.script.js", {read: false})

        // Browserify, and add source maps if this isn"t a production build
            .pipe(browserify({
                debug: false
            }))

            // Rename the destination file
            .pipe(rename("bundle.js"))
            .pipe(uglify())
            .pipe(rename({suffix: ".min"}))

            // Output to the build directory
            .pipe(gulp.dest("./public/themes-disclaimer/dist/js/"));
    });

    gulp.task('browserify-sme', function () {

        return gulp.src(['browserify-sme-routine.js'], {read: false})
            .pipe(browserify({
                debug: false,
                extensions: ['.jsx']
            }))
            .pipe(uglify())
            .pipe(rename('bundle.js'))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('./public/sme-board/dist/'));
    });

    gulp.task('browserify-admin', function () {

        return gulp.src(['browserify-admin-routine.js'], {read: false})
            .pipe(browserify({
                debug: false,
                extensions: ['.jsx']
            }))
            .pipe(uglify())
            .pipe(rename('bundle.js'))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('./public/admin-board/dist/'));
    });

    gulp.task('default', ['minifyJS', 'minifyCSS', 'images', 'browserify']);

    gulp.task('browserify', function () {

        return gulp.src(['browserify-routine.js'], {read: false})
            .pipe(browserify({
                debug: false,
                extensions: ['.jsx']
            }))
            .pipe(uglify())
            .pipe(rename('bundle.js'))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('./public/ticket-board/dist/'));
    });

    
    
    gulp.task('minifyJS', function () {
        return gulp.src(['client/*/*.js'])
            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('client/dist/js/'));
    });
    
    gulp.task('minifyCSS', function () {

        return gulp.src(['./public/css/style.css'])
            .pipe(postcss(processors)).pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('./public/css/dist/'));
    });

    gulp.task('minifyCSSdev', function () {

        console.log(supportedBrowsers);
        return gulp.src(['./public/css/style.css'])
            .pipe(postcss([
                autoprefixer({
                    remove: false,
                    browsers: supportedBrowsers
                })
            ])).pipe(gulp.dest('./public/css/'));
    });
    
    
    gulp.task('images', function () {
        return gulp.src('public/images/disclaimer/*.+(png|jpg|jpeg|gif|svg)').pipe(cache(imagemin())).pipe(gulp.dest('public/images/disclaimer/dist'));
    });

}());