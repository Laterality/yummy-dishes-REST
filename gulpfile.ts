import * as fs from "fs";
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
	const arr = JSON.parse(fs.readFileSync("src/test/tests.json", "utf-8"));
	const tests = [];
	for(const t in arr) {
		if (arr[t]) {
			tests.push(`./out/test/${t}.test.js`);
		}
	}
	// gulp.src("./out/test/*.test.js")
	gulp.src(tests)
	.pipe(mocha());
});
