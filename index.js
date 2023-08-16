const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

app.use(express.static('build'))
app.use(express.json())
app.use(cors({origin: "http://localhost:3000"}))
app.use(requestLogger)
morgan.token('content', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

let persons = [
    {
      id: 1,
      name: "Antti Anttila",
      number: "123-456789"
    },
    {
        id: 2,
        name: "Pentti Penttilä",
        number: "234-567890"
      },
      {
        id: 3,
        name: "Kirsi Kirsilä",
        number: "345-678901"
      }
  ]

  app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
  })

  app.get('/api/info', (req, res) => {
    const personsSize = persons.length
    const timeStamp = new Date()
    res.send(`<p>Phonebook has info for ${personsSize} persons</p> <p>${timeStamp}</>`)
  })
  
  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    console.log(id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  const generateIdBetter = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(n => n.id))
      : 0
    return maxId + 1
  }

  const generateId = () => {
    const max = 1000000
    return Math.floor(Math.random() * max);
  }
  
  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }

    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
      }

    const isListed = persons.find(person => person.name === body.name)
    if (isListed) {
        return response.status(400).json({ 
            error: 'name is already on the list' 
          })
    }
  
    const person = {
      name: body.name,
      number: body.number || false,
      id: generateId(),
    }
  
    persons = persons.concat(person)
  
    response.json(person)
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })