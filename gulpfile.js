"use strict";
exports.__esModule = true;
var gulp = require("gulp");
var mocha = require("gulp-mocha");
var ts = require("gulp-typescript");
gulp.task("default", function () {
    var tsProject = ts.createProject("tsconfig.json");
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(gulp.dest(tsProject.options.outDir));
});
gulp.task("test", function () {
    gulp.src("./out/test/*.test.js")
        .pipe(mocha());
});
