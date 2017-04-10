var exec = require('child_process').exec;
var gulp = require('gulp');

gulp.task('deploy', deployGAS);

/**
 * Deploys the GAS code up to the project.
 * Calls browserifyBundle, then buildGAS.
 *
 * @param  {callback} cb - a callback so the engine knows when it'll be done
 * @return {stream} the stream as the completion hint to the gulp engine
 */
function deployGAS(cb) {
    return exec('gapps push', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
}