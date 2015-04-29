module.exports = {
  "development": {
    "buildEnv": "development",
    "store": {
      "host": "localhost",
      "port": 6379
    },
    "assets": {
      "accessKeyId": "AKIAIPSBXKOJZPHTFHQA",
      "secretAccessKey": "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",
      "bucket": "rugby-ember-dev"
    }
  },

  "production": {
    "store": {
      "host": "ec2-174-129-216-46.compute-1.amazonaws.com",
      "port": 6379,
      "password": "96a5iaa4Y7cFk85Q"
    },
    "assets": {
      "accessKeyId": "AKIAIPSBXKOJZPHTFHQA",
      "secretAccessKey": "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",
      "bucket": "rugby-ember",
    }
  }
}
