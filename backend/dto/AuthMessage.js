function AuthMessage(accessToken, refreshToken) {
  this.accessToken = accessToken;
  this.refreshToken = refreshToken;
}

module.exports = AuthMessage;