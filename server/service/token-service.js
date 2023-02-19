require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Token } = require('../db/models');
const ApiError = require('../exceptions/api-error');

class TokenService {
  generateTokens(payload) {
    // expiresIn - время жизни токена
    const accesToken = jwt.sign(payload, process.env.JWT_ACCES_SECRET, { expiresIn: '30s' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return { accesToken, refreshToken };
  }

  validateAccesToken(token){
try {
  const userData = jwt.verify(token,process.env.JWT_ACCES_SECRET)
  return userData
} catch (error) {
  return null
}
  }

  validateRefreshToken(token){
    try {
      const userData = jwt.verify(token,process.env.JWT_REFRESH_SECRET)
      return userData
    } catch (error) {
      return null
    }
      }

  async saveToken(user_id, refreshToken) {
    const tokenData = await Token.findOne({
      where: {
        user_id,
      },
    });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await Token.create({ user_id, refreshToken }, {
      returning: true,
      plain: true,
    });
    return token;
  }

  async removeToken(refreshToken) {
    const tokenData = await Token.destroy({
      where: {
        refreshToken,
      },
    });
    return tokenData;
  }

  async findToken(refreshToken) {
    const tokenData = await Token.findOne({
      where: {
        refreshToken,
      },
    });
    return tokenData;
  }
}

module.exports = new TokenService();
