import { useState, useEffect } from 'react';
import Filter from './components/Filter';
import Form from './components/Form';
import RenderPeople from './components/RenderPeople';
import peopleService from './services/persons';
import Notification from './components/Notification';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    peopleService.getAll().then((initialPerson) => setPersons(initialPerson));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const checkDuplicate = persons.find((person) => person.name === newName);
    if (!checkDuplicate) {
      const personObject = {
        name: newName,
        number: newNumber,
        id: String(persons.length + 1),
      };
      peopleService.createPerson(personObject).then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setNewName('');
        setNewNumber('');
        setNotification({ text: `Added ${newName}`, type: 'success' });
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      });
    } else {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`,
        )
      ) {
        const existingPerson = persons.find(
          (person) => person.name === newName,
        );
        if (existingPerson.number === newNumber) {
          alert(`phone number cannot be the same`);
          return;
        } else {
          const updatedPerson = {
            ...existingPerson,
            number: newNumber,
          };
          peopleService
            .updatePerson(updatedPerson)
            .then((returnedPerson) => {
              setPersons(
                persons.map((p) =>
                  p.id === returnedPerson.id
                    ? { ...p, number: returnedPerson.number }
                    : p,
                ),
              );
              setNewName('');
              setNewNumber('');
              setNotification({
                text: `${newName} number has been changed successfully`,
                type: 'success',
              });
              setTimeout(() => {
                setNotification(null);
              }, 5000);
            })
            .catch(() => {
              setNotification({
                text: `Information of ${newName} has already been removed from server`,
                type: 'error',
              });
              setTimeout(() => {
                setNotification(null);
              }, 5000);
            });
        }
      } else return;
    }
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const filterSelection = (event) => {
    setFilter(event.target.value);
  };

  const personsToShow = persons.filter((person) => {
    return person.name.toLowerCase().includes(filter.toLowerCase());
  });

  const handleDelete = (id) => {
    const personToDelete = persons.find((p) => p.id === id);
    if (!personToDelete) {
      return;
    }
    if (window.confirm(`Do you want to delete ${personToDelete.name}?`)) {
      peopleService.deletePerson(id).then(() => {
        setPersons((prevPersons) => prevPersons.filter((p) => p.id !== id));
      });
    } else return;
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} />
      <Filter filter={filter} filterSelection={filterSelection} />
      <h2>add a new</h2>
      <Form
        handleSubmit={handleSubmit}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <RenderPeople handleDelete={handleDelete} personsToShow={personsToShow} />
    </div>
  );
};

export default App;
