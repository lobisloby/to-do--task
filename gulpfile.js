const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();

// Paths
const paths = {
  scss: {
    // Compile only the entry file, but watch all SCSS for changes
    src: 'app/scss/style.scss',
    watch: 'app/scss/**/*.scss',
    dest: 'css/'
  },
  js: {
    src: 'app/js/**/*.js',
    dest: 'js/min/'
  }
};

// Compile SCSS
function styles() {
  return src(paths.scss.src)
    .pipe(sourcemaps.init())
    // Make folder-based @use (e.g., 'global', 'components') resolve
    .pipe(sass({ includePaths: ['app/scss'] }).on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.scss.dest))
    .pipe(browsersync.stream());
}

// Minify JS
function scripts() {
  return src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.js.dest))
    .pipe(browsersync.stream());
}

// Browsersync
function browserSyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: '.',
    },
    notify: {
      styles: {
        top: 'auto',
        bottom: '0',
      },
    },
  });
  cb();
}
function browserSyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch files
function watchFiles() {
  watch(paths.scss.watch, styles);
  watch(paths.js.src, scripts);
  watch('*.html', browserSyncReload);
}

// Default task
exports.default = series(
  parallel(styles, scripts),
  browserSyncServe,
  watchFiles
);
