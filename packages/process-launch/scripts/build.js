const del = require('del');
const gulp = require('gulp');
const { buildLogger } = require('jege/server');
const path = require('path');
const ts = require('gulp-typescript');

const tsConfig = require('../tsconfig.json');

const log = buildLogger('[songkoro]');
const paths = {
  lib: path.resolve(__dirname, '../lib'),
  src: path.resolve(__dirname, '../src'),
};

gulp.task('clean', () => {
  const targetPaths = [
    `${paths.lib}/**/*`,
    `${paths.dist}/**/*`,
  ];
  log('clean', 'targetPaths: %s', targetPaths);

  return del(targetPaths);
});

gulp.task('tsc', () => {
  const srcPath = `${paths.src}/**/*.{js,jsx,ts,tsx}`;
  log('tsc', 'src: %s', srcPath);

  return gulp.src([srcPath])
    .pipe(ts(tsConfig.compilerOptions))
    .pipe(gulp.dest(paths.lib));
});

gulp.task('build', gulp.series('clean', 'tsc'));

function build(callback) {
  const buildTask = gulp.task('build');
  buildTask(callback);
}

module.exports = {
  build,
  gulp,
};

if (require.main === module) {
  build();
}
