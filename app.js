require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');

const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { signIn, signUp } = require('./validation/validation');
const { createUser, signin } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundErr = require('./errors/NotFoundErr');

const MONGO_URL_DEV = 'mongodb://localhost:27017/moviesdb';

const { MONGO_URL, NODE_ENV } = process.env;

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL : MONGO_URL_DEV);

const { PORT = 3000 } = process.env;
const app = express();

app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', signUp, createUser);
app.post('/signin', signIn, signin);

app.use(auth);
app.use('/', require('./routes/users'));
app.use('/', require('./routes/movies'));

app.use((req, res, next) => {
  next(new NotFoundErr('Страница не найдена'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server starts on ${PORT}`);
});
