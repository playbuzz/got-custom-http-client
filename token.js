const jwt = require('jsonwebtoken'),
  fs = require('fs'),
  path = require('path'),
  logger = require('winston');

let cert_priv;
try {
  cert_priv = fs.readFileSync(path.resolve(process.cwd(), 'node_modules/@playbuzz/cert/playbuzz-wildcard.rsa'));
} catch (err) {
  logger.warn(`Could not load certificate, ${err.message}`);
}

const generateToken = (service) => {
  try {
    return jwt.sign(service, cert_priv, {
      algorithm: 'RS512',
      audience: 'http://www.playbuzz.com',
      issuer: 'http://www.playbuzz.com',
      expiresIn: '5m'
    });
  } catch (err) {
    logger.error('Could not generate token', err);
    throw err;
  }
};

module.exports = {
  generateToken
};
