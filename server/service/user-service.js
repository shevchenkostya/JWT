require('dotenv').config();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const MailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

const { User } = require('../db/models');

class UserService {
  async registration(email, password) {
    const candidate = await User.findOne({
      where:
    { email },
      nested: true,
      raw: true,
    });
    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} already registered`);
    }
    const passwordToString = password.toString();
    const hashPassword = await bcrypt.hash(passwordToString, 10);
    const activationLink = uuid.v4();
    const user = await User.create({
      email,
      password: hashPassword,
      activationLink,
    }, {
      returning: true,
      plain: true,
    });

    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async activate(activationLink) {
    const user = await User.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Not valid activation link');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await User.findOne({
      where:
    { email },
      nested: true,
      raw: true,
    });
    if(!user){
      throw ApiError.BadRequest('User with this email not found');
    }
    const isPassEqual = await bcrypt.compare(password, user.password)
    if(!isPassEqual){
      throw ApiError.BadRequest('Invalid password');
  }
  const userDto = new UserDto(user);
  const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
}
async logout(refreshToken){
  const token = await tokenService.removeToken(refreshToken)
  return token
}

async refresh (refreshToken){
  if(!refreshToken){
    throw ApiError.UnauthorizedError()
  }
  const userData = tokenService.validateRefreshToken(refreshToken)
  const tokenFromDb = tokenService.findToken(refreshToken)
  if(!userData ||!tokenFromDb){
    throw ApiError.UnauthorizedError()
  }
  const user = await User.findByPk(userData.id)
  const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
 
}

async getAllUsers(){
  const users = await User.findAll()
  return users
} 
}

module.exports = new UserService();
