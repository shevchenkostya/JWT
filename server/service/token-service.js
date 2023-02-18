require('dotenv').config()
const jwt = require('jsonwebtoken');
const { Token }  = require('../db/models')

class TokenService {
  generateTokens(payload) {
    // expiresIn - время жизни токена
    const accesToken = jwt.sign(payload, process.env.JWT_ACCES_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return { accesToken, refreshToken };
  }
  async saveToken(user_id,refreshToken){
    const tokenData = await Token.findOne({
        where:{
            user_id
        }
    })
    if (tokenData){
        tokenData.refreshToken = refreshToken;
        return tokenData.save()
    }
    const token = await Token.create({user_id,refreshToken},{
      returning: true,
      plain: true,
    })
    return token
  }
}

module.exports = new TokenService();
