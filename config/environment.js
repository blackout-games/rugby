/* jshint node: true */

module.exports = function(environment) {
  
  
  var offlineMode = true;
  var localIP = '192.168.20.5'; // Home
  //var localIP = 'localhost'; // Home
  //var localIP = '192.168.1.150'; // Nat's + parents
  
  /*********************/
  // Development API (Local)
  var devApiBase = '';
  var devApiProtocol = 'http';
  var devApiHost = localIP + ':4444';
  /*********************/
  
  /********************* 
  // Development API (Live, Test)
  var devApiBase = '/v1';
  var devApiProtocol = 'http';
  var devApiHost = 'apitest.blackoutrugby.com';
  /*********************/
  
  /*********************
  // Development API (Live, Production)
  var devApiBase = '/v1';
  var devApiProtocol = 'https';
  var devApiHost = 'api.blackoutrugby.com';
  /*********************/
  
  // Production API
  var apiBase = '/v1';
  var apiProtocol = 'https';
  var apiHost = 'api.blackoutrugby.com';
  
  /*********************/
  
  
  var ENV = {
    offlineMode: offlineMode,
    modulePrefix: 'rugby-ember',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    
    //assetFilesHost: 'https://s3.amazonaws.com/rugby-ember/',
    assetFilesHost: 'https://dah9mm7p1hhc3.cloudfront.net/',
    
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      apiProtocol: apiProtocol,
      apiHost: apiHost,
      apiBase: apiBase,
    },
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' use.typekit.net https://use.typekit.net connect.facebook.net https://connect.facebook.net", //  'unsafe-eval' 
      'font-src': "'self' use.typekit.net data: ",
      'connect-src': "'self' "+apiHost+" https://"+apiHost,
      'img-src': "'self' data: www.facebook.com p.typekit.net *",
      'style-src': "'self' 'unsafe-inline' use.typekit.net https://use.typekit.net",
      'frame-src': "web.facebook.com https://web.facebook.com s-static.ak.facebook.com https://s-static.ak.facebook.com www.facebook.com static.ak.facebook.com https://static.ak.facebook.com staticxx.facebook.com https://staticxx.facebook.com https://www.facebook.com *.youtube.com https://*.youtube.com *.vimeo.com https://*.vimeo.com *.youtube-nocookie.com https://*.youtube-nocookie.com *.facebook.com https://*.facebook.com"
    },
  };
  
  ENV.i18n = {
    defaultLocale: 'en-gb'
  };

  ENV['ember-simple-auth'] = {
    base: {
      store: 'session-store:local-storage',
      crossOriginWhitelist: [apiProtocol+'://'+apiHost],
      routeIfAlreadyAuthenticated: 'dashboard',
    }
  };
  
  ENV.moment = {
    // To cherry-pick specific locale support into your application.
    // Full list of locales: https://github.com/moment/moment/tree/2.10.3/locale
    includeLocales: ['fr','it','es','af','ru']
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    
    ENV.assetFilesHost = '/';
    ENV.APP.apiProtocol = devApiProtocol;
    ENV.APP.apiHost = devApiHost;
    ENV.APP.apiBase = devApiBase;
    ENV.contentSecurityPolicy['script-src'] += " " + localIP + ":4444 " + localIP + ":35729 ws://" + localIP + ":35729 ember.blackoutrugby.com:35729";
    ENV.contentSecurityPolicy['connect-src'] += " " + devApiHost + " " + localIP + ":4444 " + localIP + ":35729 ws://" + localIP + ":35729 ws://ember.blackoutrugby.com:35729 dah9mm7p1hhc3.cloudfront.net";
    ENV['ember-simple-auth'].base.crossOriginWhitelist = [devApiProtocol+'://'+devApiHost];
    
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
