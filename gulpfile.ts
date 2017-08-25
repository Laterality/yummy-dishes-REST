import * as gulp from "gulp";
import * as mocha from "gulp-mocha";
import * as ts from "gulp-typescript";

gulp.task("default", () => {
	const tsProject = ts.createProject("tsconfig.json");
	
	return tsProject.src()
	.pipe(tsProject())
	.js
	.pipe(gulp.dest(tsProject.options.outDir as string));
});

gulp.task("test", () => {
	gulp.src("./out/test/*.test.js")
	.pipe(mocha());
});
