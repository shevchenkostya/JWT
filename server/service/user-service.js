require('dotenv').config()
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const MailService = require('./mail-service')
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');

const { User } = require('../db/models');


class UserService {
  async registration (email, password) {
    const candidate = await User.findOne({
      where:
    { email: email },
      nested: true,
      raw: true,
    });
    if(candidate){
        throw new Error(`User with email ${email} already registered`)
    }
    const passwordToString = password.toString()
    const hashPassword = await bcrypt.hash(passwordToString,10)
    const activationLink = uuid.v4()
    const user = await User.create({
        email,
        password: hashPassword,
        activationLink
    },{
    returning: true,
    plain: true})
    
    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}` )

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id,tokens.refreshToken)
    return{
        ...tokens,
        user:userDto
    }
  }
}

module.exports = new UserService();
