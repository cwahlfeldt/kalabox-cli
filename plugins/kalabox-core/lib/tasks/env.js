'use strict';

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(kbox) {

  var _ = require('lodash');

  // ENV for core
  kbox.tasks.add(function(task) {
    task.path = ['env'];
    task.description = 'Print Kalabox environmental vars.';
    task.func = function(done) {
      _.forEach(process.env, function(value, key) {
        if (_.startsWith(key, 'KALABOX')) {
          console.log([key, value].join('='));
        }
      });
      done();
    };
  });

  // ENV for apps
  kbox.core.events.on('post-app-load', function(app) {
    kbox.tasks.add(function(task) {
      task.path = [app.name, 'env'];
      task.description = 'Stop and then start a running kbox application.';
      task.func = function(done) {
        var processEnv = _.cloneDeep(process.env);
        var appEnv = app.env.getEnv();
        _.forEach(_.merge(processEnv, appEnv), function(value, key) {
          if (_.startsWith(key, 'KALABOX')) {
            console.log([key, value].join('='));
          }
        });
        done();
      };
    });
  });

};
