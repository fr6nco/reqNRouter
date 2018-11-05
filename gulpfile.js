const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("build-ts", () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task("copy-config", () => {
    return gulp.src('./src/config/*')
        .pipe(gulp.dest('./dist/config'))
});

gulp.task("default", ["build-ts", "copy-config"]);