const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const git = require('gulp-git');
const uglify = require('gulp-uglify'); //混淆、压缩
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint'); //代码语法检查
const concat = require('gulp-concat'); //合并代码，即将项目中各种JS合并成一个JS文件
const zip = require('gulp-zip'); //zip压缩
const scp = require('gulp-scp2');

const runSequence = require('run-sequence');
const argv = require('minimist')(process.argv.slice(2)); //读取命令行参数
const fs = require('fs');
const path = require('path');
const del = require('del');
const moment = require('moment');

const config = require('./pack.config');

const exclude = new Set(['node_modules', 'dist']);

const DEST_DIR = 'dist/';
const ORIGIN_DIR = 'origin/';
const SRC_MAP = 'src-map';
const SRC_DIR = '';

let pkgName = '';

//gulp checkout --tag v1.0.0
gulp.task('checkout', ['commit'], function () {
  let gitTag = argv.tag || config.gitTag;
  git.checkout(gitTag, function (err) {
    if (err) throw err;
  });
});

//清理、不混肴压缩发布、打包、上传
gulp.task('default', function (cb) {
  runSequence('clean', ['unmix', 'copy'], 'zip', 'scp', cb);
});

//清理、混肴压缩发布、打包、上传
gulp.task('prod', function (cb) {
  runSequence('clean', ['mix', 'copy'], 'zip', 'scp', cb);
});



gulp.task('clean', function () {
  return del([
    //删除
    'dist/**/*',
    //保留
    '!dist/**/*.json'
  ]);
});

gulp.task('file_scp', function () {
  let uploads = config.upload;
  let t = null;
  uploads.forEach(function (item) {
    let paths = item.paths;
    paths.forEach(function (target) {
      t = gulp.src(target.localPath)
        .pipe(scp({
          host: item.host,
          username: item.username,
          password: item.password,
          dest: target.remotePath
        }))
        .on('error', function (err) {
          console.log(err);
        });
    });

  });

  return t;
});


gulp.task('copyCfg', function () {

  let output_cfgs = config.output.cfgs;
  let t = null;
  output_cfgs.forEach(function (cfg) {
    t = gulp.src(config.input.cfgs)
      .pipe(gulp.dest(cfg));
  });

  return t;
});

gulp.task('copy', function () {
  let task = null;
  console.error('---------------config.input.plugins', config.input.plugins);
  config.input.plugins.forEach(function (item) {
    console.error('---------------item', item);
    task = gulp.src(item[0])
      .pipe(gulp.dest(item[1]));
  });
  return task;
});

gulp.task('commit', function () {
  return gulp.src(SRC_DIR)
    .pipe(git.add())
    .pipe(git.commit());
});

// 监视文件变化，自动执行任务
gulp.task('watch', function () {
  return gulp.watch(config.input.js, ['mix']);
});

gulp.task('zip', function () {
  let timeStamp = moment().format("YYYYMMDHHmmss");
  pkgName = `fishjoy${timeStamp}.zip`;
  console.log('pkgName:', pkgName);
  return gulp.src(config.input.zip)
    .pipe(zip(pkgName))
    .pipe(gulp.dest(config.output.zip));
});

gulp.task('scp', function () {
  return gulp.src(config.output.zip + pkgName)
    .pipe(scp({
      host: config.scp.host,
      username: config.scp.username,
      password: config.scp.password,
      dest: config.scp.remotePath
    }))
    .on('error', function (err) {
      console.log(err);
    });
});

gulp.task('eslint', function () {
  return gulp.src(config.input.js)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('error', function (err) {
      console.log('eslint error:', err.stack);
      gulp.emit('end');
    });
});

gulp.task('map', function () {
  return gulp.src(config.input.js)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'es2016', 'es2017'],
      plugins: [
        ["transform-runtime", {
          "polyfill": false,
          "regenerator": true
        }]
      ]
    }))
    .pipe(sourcemaps.write(config.output.sourcemap))
    .on('error', function (err) {
      console.log('eslint error:', err.stack);
      gulp.emit('end');
    });
});


gulp.task('mix', function () {
  return gulp.src(config.input.js)
    .pipe(babel({
      presets: ['es2015', 'es2016', 'es2017'],
      plugins: [
        ["transform-runtime", {
          "polyfill": false,
          "regenerator": true
        }]
      ]
    }))
    // 压缩混淆
    .pipe(uglify())
    //重命名
    // .pipe(rename({ extname: '.min.js' }))
    //合并成一个文件
    // .pipe(concat('index.min.js'))
    // 3\. 另存压缩后的文件
    .pipe(gulp.dest(config.output.dist))
    .on('error', function (err) {
      console.log(err.stack);
      gulp.emit('end');
    });
});

gulp.task('unmix', function () {
  return gulp.src(config.input.js)
    .pipe(babel({
      presets: ['es2015', 'es2016', 'es2017'],
      plugins: [
        ["transform-runtime", {
          "polyfill": false,
          "regenerator": true
        }]
      ]
    }))
    .pipe(gulp.dest(config.output.dist))
    .on('error', function (err) {
      console.log(err.stack);
      gulp.emit('end');
    });
});