require('dotenv').config();
const express = require('express');
const Person = require('./models/person');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(express.static('dist'));
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then((person) => {
    res.json(person);
  });
});

app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then((count) => {
      const currentDate = new Date();
      const dateString = currentDate.toString();
      res.send(`
          
          <p>Phonebook has info for ${count} people</p>
          <p>${dateString}</p>
          `);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((person) => {
      console.log(`successfully deleted ${person.id}`);

      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing',
    });
  }

  Person.findOne({ name: body.name })
    .then((existing) => {
      if (existing) {
        return res.status(400).json({
          error: 'name must be unique',
        });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      return person.save().then((savedPerson) => {
        res.json(savedPerson);
      });
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;
  Person.findById(req.params.id)
    .then((person) => {
      if (!person) {
        return res.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person.save().then((updatedPerson) => {
        res.json(updatedPerson);
      });
    })
    .catch((error) => next(error));
});

//error handling

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
