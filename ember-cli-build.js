/*jshint node:true*/
/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
 

module.exports = function(defaults) {
  var env = EmberApp.env()|| 'development';
  var isProductionLikeBuild = ['production', 'staging'].indexOf(env) > -1;

  var fingerprintOptions = {
    prepend: 'https://dah9mm7p1hhc3.cloudfront.net/',
    extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2'],
  };
  
  var app = new EmberApp(defaults, {
    // Add options here
    fingerprint: fingerprintOptions,
    emberCLIDeploy: {
      runOnPostBuild: (env === 'development') ? 'development-postbuild' : false,
      shouldActivate: false
    },
    sourcemaps: {
      enabled: !isProductionLikeBuild,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },
    sassOptions: {
      includePaths: [
        'app'
      ]
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  
  //app.import('vendor/rugby-ember.css');
  
  /**
   * Perfect scrollbar
   */
  app.import('bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.js');
  app.import('bower_components/perfect-scrollbar/css/perfect-scrollbar.css');

  /**
   * Animate.css
   */
  app.import('bower_components/animate.css/animate.css');

  /**
   * Fontello custom blackout icons
   */
  app.import('vendor/fontello/css/blackout.css');
  app.import('vendor/fontello/font/blackout.ttf', {
    destDir: 'font'
  });
  app.import('vendor/fontello/font/blackout.eot', {
    destDir: 'font'
  });
  app.import('vendor/fontello/font/blackout.svg', {
    destDir: 'font'
  });
  app.import('vendor/fontello/font/blackout.woff', {
    destDir: 'font'
  });
  app.import('vendor/fontello/font/blackout.woff2', {
    destDir: 'font'
  });
  
  /**
   * Air datepicker
   */
  app.import('bower_components/air-datepicker/dist/js/datepicker.js');
  app.import('bower_components/air-datepicker/dist/css/datepicker.css');
  app.import('bower_components/air-datepicker/dist/js/i18n/datepicker.en.js');
  
  /**
   * jQuery bubble slider
   */
  
  app.import('vendor/bubble-slider-master/build/jquery.bubble-slider.js');
  app.import('vendor/bubble-slider-master/build/bubble-slider.css');
  
  /**
   * Color library
   */
  app.import('bower_components/tinycolor/tinycolor.js');
  
  /**
   * Clipboard.js
   */
  app.import('bower_components/clipboard/dist/clipboard.js');
  
  /**
   * File Saver
   */
  app.import('bower_components/file-saver/FileSaver.js');


  return app.toTree();
  
};
