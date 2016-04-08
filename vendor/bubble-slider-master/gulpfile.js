// ==================================================
// require plugins
// ==================================================

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var changed = require('gulp-changed');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var cleancss = require('gulp-clean-css');
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browsersync = require('browser-sync').create();

// ==================================================
// gulp tasks
// ==================================================

// start server
gulp.task('server', function() {
  browsersync.init({
    open: false,
    server: './' // static server
  });
});

// process jade files
function jadeTask(src, dest) {
  gulp.src(src)
    .pipe(plumber())
    .pipe(changed(dest, {extension: '.html'}))
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(dest))
    .pipe(browsersync.stream({match: '**/*.html'}));
}

gulp.task('jade', function() {
  jadeTask('./demo/*.jade', './');
});

// process stylus files
function stylusTask(src, dest) {
  gulp.src(src)
    .pipe(plumber())
    .pipe(changed(dest, {extension: '.css'}))
    .pipe(stylus({'include css': true}))
    .pipe(autoprefixer({browsers: ['last 4 versions']}))
    .pipe(sourcemaps.init())
    .pipe(cleancss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest))
    .pipe(browsersync.stream({match: '**/*.css'}));
}

gulp.task('stylus:src', function() {
  stylusTask('./src/*.styl', './build/');
});

gulp.task('stylus:demo', function() {
  stylusTask('./demo/*.styl', './demo/');
});

// process coffeescript files
function coffeeTask(src, dest) {
  gulp.src(src)
    .pipe(plumber())
    .pipe(changed(dest, {extension: '.js'}))
    .pipe(coffee({bare: true}))
    .pipe(sourcemaps.init())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest))
    .pipe(browsersync.stream({match: '**/*.js'}));
}

gulp.task('coffee', function() {
  coffeeTask('./src/*.coffee', './build/');
});

// ==================================================
// watch files
// ==================================================

gulp.task('watch', function() {
  // source files
  gulp.watch('./src/*.styl', ['stylus:src']);
  gulp.watch('./src/*.coffee', ['coffee']);

  // demo files
  gulp.watch('./demo/*.jade', ['jade']);
  gulp.watch('./demo/*.styl', ['stylus:demo']);
});

// ==================================================
// default task
// ==================================================

gulp.task('default', ['server', 'watch']);
