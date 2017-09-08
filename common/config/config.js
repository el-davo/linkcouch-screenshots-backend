let config = {
  selenium: {
    hub: process.env.seleniumHub || 'localhost'
  },
  aws: {
    s3_endpoint: process.env.s3_endpoint,
    port: process.env.s3_port
  }
};

module.exports = config;
