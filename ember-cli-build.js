/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  
  var app = new EmberApp(defaults,{
    fingerprint: {
      prepend: 'https://dah9mm7p1hhc3.cloudfront.net/'
    },
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


  /**
   * Perfect scrollbar
   */
  app.import('bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.js');
  app.import('bower_components/perfect-scrollbar/css/perfect-scrollbar.css');

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


  return app.toTree();
  
};
