const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;
  return String(maxId + 1);
};

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = persons.find((person) => id === person.id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/info', (req, res) => {
  const personsLength = persons.length;
  const currentDate = new Date();
  const dateString = currentDate.toString();
  res.send(`
        
        <p>Phonebook has info for ${personsLength} people</p>
        <p>${dateString}</p>
        `);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing',
    });
  }

  const duplicatePerson = persons.some(
    (person) =>
      person.name.toLocaleLowerCase() === body.name.toLocaleLowerCase(),
  );

  if (duplicatePerson) {
    return res.status(400).json({
      error: 'name must be unique',
    });
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  res.status(201).json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
