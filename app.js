require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');

const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const router = require('./routes/index');

const MONGO_URL_DEV = 'mongodb://localhost:27017/bitfilmsdb';

const { MONGO_URL, NODE_ENV } = process.env;

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL : MONGO_URL_DEV);

const { PORT = 3000 } = process.env;
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(router);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT);
