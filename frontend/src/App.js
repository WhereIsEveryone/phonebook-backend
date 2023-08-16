import { useState, useEffect } from 'react'
import personService from './services/persons'

const Notification = ({ notification }) => {
  if (notification.message === null) {
    return null
  }

  const notificationStyle = {
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10
  }
  const successStyle = {...notificationStyle, color: 'green' }
  const errorStyle = {...notificationStyle, color: 'red' }
  const style = notification.success ? successStyle : errorStyle

  return (
    <div style={style}>
      {notification.message}
    </div>
  )
}

const PersonForm = ({newName, newNumber, handleSubmit, nameChange, numberChange}) => {
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          Nimi: <input value={newName} onChange={nameChange} /> <br />
          Numero: <input value={newNumber} onChange={numberChange} /> <br />
          <button type="submit">Lisää</button>
        </div>
      </form>
    </>
  )
}

const Filter = ({ newFilter, filterChange }) => {
  return (
    <>
      <p>Suodata: <input value={newFilter} onChange={filterChange} /></p>
    </>
  )
}

const PoistoNappi =({ handleDelete }) => {
  return (
    <>
      <button onClick={handleDelete}>Poista</button>
    </>
  )
}

const PersonLine = ({ id, name, number, handleDelete }) => {
  return (
    <>
      <p>{name} {number} <PoistoNappi handleDelete={() => handleDelete(id)} /></p>
    </>
  )
}

const ShowPersons = ({persons, handleDelete}) => {
  return (
    <>
      {persons.map(person =>
        <PersonLine
          key={person.id}
          id={person.id}
          name={person.name}
          number={person.number}
          handleDelete={handleDelete}
        />
      )}
    </>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [notificationMsg, setNotificationMsg] = useState({message: null, success: null})

  useEffect(() => {
    personService
      .getAll()
      .then(existingPersons => {
        setPersons(existingPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }
    if (persons.map(person => person.name).includes(newName)) {
      if (newNumber === '') {
        alert(`${newName} on jo luettelossa`)
      }
      else {
        if (window.confirm(`${newName} on jo luettelossa, korvaa numero uudella?`)) {
          updatePerson()
        }
      }
    }
    else {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setNotificationMsg( {message: `Henkilön ${newName} lisäys onnistui`, success: true} )
          timeOut()
        })
    }
  }
  
  const updatePerson = () => {
    const person = persons.find(p => p.name === newName)
    const updatedPerson = {...person, number: newNumber}
    const id = updatedPerson.id
    personService
      .update(id, updatedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(p => p.id !== id ? p : returnedPerson))
        setNotificationMsg( {message: `Henkilön ${newName} tietojen päivitys onnistui`, success: true} )
        timeOut()
      })
      .catch(error => {
        setPersons(persons.filter(person => person.id !== id))
        setNotificationMsg( {message: `Henkilöä ${newName} ei enää löydy palvelimelta`, success: false} )
        timeOut()
      })
  }

  const deletePerson = (id) => {
    const name = (persons.find(person => person.id === id)).name
    if (window.confirm(`Poista ${name}?`)) {
      personService
        .del(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setNotificationMsg( {message: `Henkilö ${name} poistettu`, success: true} )
          timeOut()
        })
        .catch(error => {
          setPersons(persons.filter(person => person.id !== id))
          setNotificationMsg( {message: `Henkilö ${name} on jo poistettu palvelimelta`, success: false} )
          timeOut()
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  const toShow = () => persons.filter(
    person  => person.name.toUpperCase().includes(newFilter.toUpperCase())
  )

  const timeOut = () => {
    setTimeout(() => {
      setNotificationMsg( {message: null, success: null} )
    }, 5000)
  }

  return (
    <div>
      <h2>Puhelinluettelo</h2>
      <Notification notification={notificationMsg}/>
      <h3>Lisää uusi henkilö</h3>
      <PersonForm newName={newName} newNumber={newNumber} handleSubmit={addPerson} nameChange={handleNameChange} numberChange={handleNumberChange} />
      <h3>Numerot</h3>
      <Filter newFilter={newFilter} filterChange={handleFilterChange} />
      <ShowPersons persons={toShow()} handleDelete={deletePerson}/>
    </div>
  )

}

export default App
