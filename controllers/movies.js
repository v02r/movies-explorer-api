const BadRequestErr = require('../errors/BadRequestErr');
const ConflictErr = require('../errors/ConflictErr');
const NotFoundErr = require('../errors/NotFoundErr');
const Movie = require('../models/movie');
const ForbiddenErr = require('../errors/ForbiddenErr');

const getMovies = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const movies = await Movie.find({ owner });

    res.status(200).send(movies);
  } catch (error) {
    next(error);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
    } = req.body;
    const movie = await Movie.create({
      owner,
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
    });
    res.status(200).send(movie);
  } catch (error) {
    if (error.code === 11000) {
      next(new ConflictErr('Такой фильм уже существует'));
    } else if (error.name === 'ValidationError') {
      next(new BadRequestErr('Невозможно создать фильм - данные введены не верно'));
    } else {
      next(error);
    }
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      next(new NotFoundErr('Фильм не найден'));
      return;
    }

    if (owner.toString() === movie.owner.toString()) {
      const deletedMovie = await Movie.findByIdAndDelete(movieId);
      res.status(200).send(deletedMovie);
    } else {
      next(new ForbiddenErr('Невозможно удалить фильм другого пользователя'));
    }
  } catch (error) {
    if (error.name === 'CastError') {
      next(new BadRequestErr('Невозможно удалить фильм'));
    } else {
      next(error);
    }
  }
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
