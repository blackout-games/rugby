module.exports = function(deployTarget) {
  var ENV = {};

  if (deployTarget === 'production') {
    ENV.build = {
      environment: 'production',
    };
    
    ENV['ssh-tunnel'] = {
      username: process.env['SSH_USERNAME'],
      privateKeyPath: process.env['SSH_KEY_PATH'],
      host: process.env['REDIS_HOST'],
      srcPort: process.env['REDIS_PORT'],
    };

    ENV.redis = {
      keyPrefix: 'rugby-ember',
      allowOverwrite: true,
      host: 'localhost',
      port: process.env['REDIS_PORT']
    };
    ENV.s3 = {
      accessKeyId: process.env['AWS_ACCESS_KEY'],
      secretAccessKey: process.env['AWS_SECRET_KEY'],
      bucket: 'rugby-ember',
      region: 'us-east-1'
    };
  }

  return ENV;

};