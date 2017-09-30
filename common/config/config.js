let config = {
  selenium: {
    hub: process.env.seleniumHub || 'localhost'
  },
  aws: {
    s3_endpoint: process.env.s3_endpoint,
    port: process.env.s3_port
  },
  mq: {
    host: process.env.mq_host || 'localhost',
    username: process.env.mq_username || 'user',
    password: process.env.mq_password || 'pass'
  }
};

module.exports = config;
