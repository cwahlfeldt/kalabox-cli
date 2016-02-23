/**
 * Module for global and app configs.
 *
 * @name config
 */

'use strict';

require('./deps.js');
var yaml = require('./../util/yaml.js');
var path = require('path');
var os = require('os');
var fs = require('fs');
var env = require('./env.js');
var log = require('./log.js');
var _ = require('lodash');

// Constants
var CONFIG_FILENAME = exports.CONFIG_FILENAME = 'kalabox.yml';
var APP_CONFIG_FILENAME = exports.APP_CONFIG_FILENAME = 'kalabox.yml';

// Default global
var DEFAULT_GLOBAL_CONFIG = {
  domain: 'kbox',
  engineRepo: 'kalabox',
  stats: {
    report: true,
    url: 'http://stats-v2.kalabox.io'
  },
  logLevel: 'debug',
  logLevelConsole: 'info',
  logRoot: ':sysConfRoot:/logs',
  downloadsRoot: ':sysConfRoot:/downloads',
  appsRoot: ':sysConfRoot:/apps',
  appRegistry: ':sysConfRoot:/appRegistry.json',
  globalPluginRoot: ':sysConfRoot:/plugins',
  configSources: [
    'DEFAULT_GLOBAL_CONFIG'
  ],
};

// Debug info logging function.
var log = require('./log.js').make('CORE CONFIG');

/*
 * Looks up a key of the config object and returns it.
 */
var lookupKey = function(config, keyToFind) {

  // Recursive function.
  var rec = function(o, prefix) {

    // Loop through each of the objects properties to find value.
    return _.find(o, function(val, key) {

      // Build namespaced name.
      var name = _.filter([prefix, key]).join('.');

      if (typeof val === 'string') {

        // If name of string value matches, return it.
        return (':' + name + ':') === keyToFind;

      } else if (typeof val === 'object') {

        // Recursively check object.
        return rec(val, name);

      } else {

        // Not a string or an object so just return false.
        return false;

      }

    });

  };

  // Init recursive function and return.
  return rec(config);

};

/**
 * Translate a value.
 * @memberof config
 */
var normalizeValue = exports.normalizeValue = function(config, v) {

  // Search value for regex matches.
  //var params = v.match(/:[a-zA-Z0-9-_]*:/g);
  var params;
  try {
    params = v.match(/:[a-zA-Z0-9-_]*:/g);
  }
  catch (err) {
    throw new Error(typeof v);
  }

  if (!params) {

    // No params were found, so just return original value.
    return v;

  } else {

    // Reduce list of params to final value.
    return _.reduce(params, function(acc, param) {

      // Get replacement value from config object based on param name.
      var replacementValue = lookupKey(config, param);

      if (!replacementValue) {

        // Replacement value was not found so just return value.
        return acc;

      } else {

        // Replace and return.
        return acc.replace(param, replacementValue);

      }

    }, v);

  }

};

/**
 * Walk the properties of the top level object, replacing strings
 * with other properties values.
 * @memberof config
 */
var normalize = exports.normalize = function(config) {

  // Recursive funciton.
  var rec = function(o) {

    // Loop through each property of the object.
    _.each(o, function(val, key) {

      if (typeof val === 'string') {

        // For string values normalize.
        o[key] = normalizeValue(config, val);

      } else if (typeof val === 'object') {

        // For object values recursively normalize.
        rec(val);

      }

    });

  };

  // Init recursive function with config.
  rec(config);

  // Return config.
  return config;

};

function sort(config) {
  var keys = Object.keys(config).sort();
  var retVal = {};
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    retVal[key] = config[key];
  }
  return retVal;
}

// @todo: implement
var KEYS_TO_CONCAT = [
  'configSources'
];

function mixIn(a, b) {
  for (var key in b) {
    var shouldConcat = _.contains(KEYS_TO_CONCAT, key);
    if (shouldConcat) {
      // Concat.
      if (_.isArray(a[key]) && _.isArray(b[key])) {
        a[key] = _.uniq(a[key].concat(b[key]));
        a[key].sort();
      } else {
        a[key] = b[key];
      }
    } else {
      // Override.
      a[key] = b[key];
    }
  }
  return sort(normalize(a));
}
exports.mixIn = mixIn;

var getPackageJson = function() {
  return require(path.join(env.getSourceRoot(), 'package.json'));
};

/**
 * Gets the kalabox environment config.
 * @returns {Object} config - The kalabox enviroment config.
 * @example
 * var envConfig = kbox.core.config.getEnvConfig();
 * // Print home directory to stdout.
 * console.log(envConfig.home);
 */
exports.getEnvConfig = function() {

  // Grab the provision and version lock file paths
  var provisionedFile = path.join(env.getSysConfRoot(), 'provisioned');
  var versionLockFile = path.resolve(env.getSourceRoot(), 'version.lock');

  // Grab version things\
  var locked = fs.existsSync(versionLockFile);
  var packageJson = getPackageJson();
  var nodeVersion = packageJson.version;
  var kboxVersion = (!locked) ? nodeVersion + '-dev' : nodeVersion;
  var imgVersion = (!locked) ? 'dev' : 'v' + nodeVersion;

  // Grab the installed file
  var iF = path.join(env.getSysConfRoot(), 'installed.json');
  var cI = (fs.existsSync(iF)) ? require(iF) : {KALABOX_VERSION:kboxVersion};

  // Check whether we are in a jx core binary or not
  var isBinary = (process.isPackaged || process.IsEmbedded) ? true : false;
  // Check whether we are in NW or not
  var isNw = _.has(process.versions, 'node-webkit');

  return {
    isBinary: isBinary || isNw,
    isNW: isNw,
    needsUpdates: (cI.KALABOX_VERSION !== kboxVersion),
    // @todo: deprecate "devMode" in favor of "locked"
    devMode: !locked,
    locked: locked,
    provisioned: fs.existsSync(provisionedFile),
    home: env.getHomeDir(),
    os: {
      type: os.type(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    },
    sysConfRoot: env.getSysConfRoot(),
    sysProviderRoot: env.getSysProviderRoot(),
    srcRoot: env.getSourceRoot(),
    version: kboxVersion,
    imgVersion: imgVersion,
    configSources: [
      'ENV_CONFIG'
    ]
  };
};

/**
 * Gets the default config. The default config is a combination of the
 * environment config and a set of default config values.
 *
 * @returns {Object} config - The kalabox default config.
 * @example
 * var defaultConfig = kbox.core.config.getDefaultConfig();
 * // Print global plugins
 * defaultConfig.globalPlugins.forEach(function(plugin) {
 *   console.log(plugin)  ;
 * });
 */
exports.getDefaultConfig = function() {
  return mixIn(this.getEnvConfig(), DEFAULT_GLOBAL_CONFIG);
};

/**
 * Document this
 * @memberof config
 */
var getReleaseConfigFilepath = exports.getReleaseConfigFilepath = function() {
  return path.join(env.getSourceRoot(), CONFIG_FILENAME);
};

var getGlobalConfigFilepath = function() {
  return path.join(env.getSysConfRoot(), CONFIG_FILENAME);
};

var loadConfigFile = function(configFilepath) {
  var loadedConfigFile = yaml.toJson(configFilepath);
  loadedConfigFile.configSources = [configFilepath];
  return loadedConfigFile;
};

/**
 * Gets the global config. The global config is a combination of the
 *   environment config, the default config, and any values overriden
 *   in the $HOME/.kalabox/kalabox.json config file.
 * @returns {Object} config - The kalabox global config.
 * @example
 * var globalConfig = kbox.core.config.getGlobalConfig();
 * // Print the entire global config.
 * console.log(JSON.stringify(globalConfig, null, '\t'));
 */
exports.getGlobalConfig = function() {
  var defaultConfig = this.getDefaultConfig();
  var filesToLoad = [
    getReleaseConfigFilepath(),
    getGlobalConfigFilepath()
  ];
  var globalConfig = _.reduce(filesToLoad, function(config, fileToLoad) {
    if (fs.existsSync(fileToLoad)) {
      var loadedConfigFile = loadConfigFile(fileToLoad);
      config = mixIn(config, loadedConfigFile);
    }
    return config;
  }, defaultConfig);
  return globalConfig;
};

var getAppConfigFilepath = function(dir) {
  return path.join(dir, APP_CONFIG_FILENAME);
};

/**
 * Gets the app config for an app. The app config is a combination of the
 *   environment config, the default config, any values overriden in the
 *   $HOME/.kalabox/kalabox.yml config file, and the kalabox.yml config
 *   file in the app's root directory.
 * @arg {string} app - The name of the app you'd like to get the config for.
 * @arg {string} appRoot [optional] - Directory to load the
 * app's config file from.
 * @returns {Object} config - The app's kalabox app config.
 * @example
 * var appConfig = kbox.core.config.getAppConfig('myapp');
 * // Print the entire app config.
 * console.log(JSON.stringify(appConfig, null, '\t'));
 */
exports.getAppConfig = function(dir) {

  // Grab the global config
  var globalConfig = this.getGlobalConfig();

  // Grab some stuff we need
  var appConfigFile = loadConfigFile(getAppConfigFilepath(dir));

  // Helper to mix in new config vals
  var appConfigOverride = function(key, val) {
    if (!appConfigFile[key]) {
      appConfigFile[key] = val;
    }
  };

  // Add some stuff to our config
  appConfigOverride('appRoot', dir);

  // Return the config
  log.debug('App config loaded.', mixIn(globalConfig, appConfigFile));
  return mixIn(globalConfig, appConfigFile);

};
