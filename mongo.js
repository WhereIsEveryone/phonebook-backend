const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const nameToAdd = process.argv[3]
const numberToAdd = process.argv[4]

const url =
  `mongodb+srv://antpaan:${password}@cluster0.bdgmcyy.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

const Person = mongoose.model('Person', personSchema)

if (nameToAdd !== undefined) {
  if (numberToAdd !== undefined) {
    const person = new Person({
      name: nameToAdd,
      number: Number(numberToAdd)
    })
    person.save().then(result => {
      console.log(`Henkilö ${nameToAdd}, numero ${numberToAdd} lisätty puhelinluetteloon`)
      mongoose.connection.close()
    })
  }
}
else {
  Person.find({}).then(result => {
    console.log('Puhelinluettelo:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`) 
    })
    mongoose.connection.close()
  })
}