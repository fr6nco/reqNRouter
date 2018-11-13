const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

function handleError(err) {
    console.error(err);
}

gulp.task("build-ts", () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"))
        .on('error', handleError);
});

gulp.task("copy-config", () => {
    return gulp.src('./src/config/*')
        .pipe(gulp.dest('./dist/config'))
        .on('error', handleError)
});

gulp.task("default", ["build-ts", "copy-config"]);