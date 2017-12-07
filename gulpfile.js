/**
 * https://www.npmjs.com/package/gulp-typescript
 * https://www.npmjs.com/package/gulp-requirejs-optimize
 * https://raw.githubusercontent.com/requirejs/r.js/master/build/example.build.js
 */
const gulp = require("gulp");
const rxSource = "./node_modules/rxjs/src/**/*.ts";
const dist = "./dist";
const distJs = "./dist/js";
const rxDefinitions = "./dist/definitions";
const rxJs = "./dist/js/rxjs";
const rxJsName = "rxjs.js";

gulp.task("clear", function(callback) {
  const rimraf = require("rimraf");
  rimraf(dist, callback);
});

gulp.task("compile", ["clear"], function() {
  const merge = require("merge2");
  const ts = require("gulp-typescript");
  const tsResult = gulp.src(rxSource).pipe(
    ts({
      target: "es5",
      module: "amd", //
      moduleResolution: "node",
      //sourceMap: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      lib: ["es2017", "dom"],
      noImplicitAny: true,
      suppressImplicitAnyIndexErrors: true,
      noEmitHelpers: true,
      importHelpers: true,
      declaration: true
    })
  );

  return merge([
    tsResult.dts.pipe(gulp.dest(rxDefinitions)),
    tsResult.js.pipe(gulp.dest(rxJs))
  ]);
});

const bundle = () => {
  const rjs = require("gulp-requirejs");
  return rjs({
    logLevel: 2,
    //preserveLicenseComments: false,
    optimize: "none", //"uglify",
    generateSourceMaps: true,
    useStrict: true,
    baseUrl: distJs,
    include: ["rxjs/Rx"],
    out: rxJsName,
    //packages: [
    //  {
    //    name: "rxjs/operators",
    //    location: "rxjs/operators/",
    //    main: "index.js"
    //  }
    //],
    paths: {
      tslib: "empty:"
    },
    shim: {},
    map: {}
  }).pipe(gulp.dest(dist));
};

gulp.task("bundle", ["compile"], bundle);
gulp.task("bundle-only", bundle);

const minify = () => {
  const sourcemaps = require("gulp-sourcemaps");
  const uglify = require("gulp-uglify");
  const rename = require("gulp-rename");
  const plumber = require("gulp-plumber");
  return gulp
    .src(dist + "/" + rxJsName)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(gulp.dest(dist))
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(dist));
};

gulp.task("minify", ["bundle"], minify);
gulp.task("minify-only", minify);
