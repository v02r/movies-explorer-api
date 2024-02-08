const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET, NODE_ENV } = process.env;
const BadRequestErr = require('../errors/BadRequestErr');
const ConflictErr = require('../errors/ConflictErr');
const NotFoundErr = require('../errors/NotFoundErr');

const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    await User.findUserByCredentials(email, password)
      .then((user) => {
        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
          {
            expiresIn: '7d',
          },
        );

        res.status(200).send({ token });
      });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
    });
    return res.status(200).send({
      name: user.name,
      _id: user._id,
      email: user.email,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequestErr('Данные введены неверное, невозможно создать пользователя'));
    } if (error.code === 11000) {
      return next(new ConflictErr('Пользователь уже зарегестрирован'));
    }
    return next(error);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const userInfo = await User.findById(req.user._id);

    if (!userInfo) {
      next(new NotFoundErr('Пользователь не найден'));
    } else {
      res.status(200).send(userInfo);
    }
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).send({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequestErr('Невозможно обновить данные пользователя'));
    }
    next(error);
  }
};

module.exports = {
  createUser,
  getUserInfo,
  updateUser,
  signin,
};
