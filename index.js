const express = require( 'express' )
const morgan = require( 'morgan' )
const app = express()

morgan.token( 'body', ( request, response ) => {
  const ret = request.method === 'POST'
    ? JSON.stringify( request.body )
    : ' '
    return ret
})

app.use( morgan( ':method :url :status :res[content-length] - :response-time ms :body' ) )
app.use( express.json() )

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

const generateId = () => {
  const existingIds = persons.map( n => n.id )
  let newId

  do {
    newId = Math.floor( Math.random() * 100 + 1 )
  } while ( existingIds.find( x => x === newId ) )

  return newId
}

app.get( '/info', ( request, response ) => {
  response.send( `<p>Phonebook has info for ${persons.length} people</p>
              <p>${new Date()}</p>` )
})

app.get( '/api/persons', ( request, response ) => {
  response.json( persons )
})

app.get( '/api/persons/:id', ( request, response ) => {
  const id = Number( request.params.id )
  const person = persons.find( person => person.id === id )
  
  if ( person ) {
    response.json( person )
  } else {
    response.status( 404 ).end()
  }
})

app.delete( '/api/persons/:id', ( request, response ) => {
  const id = Number( request.params.id )
  persons = persons.filter( person => person.id !== id )

  response.status( 204 ).end()
})

app.post( '/api/persons', ( request, response ) => {
  const body = request.body

  if ( !body.name ) {
    return response.status( 400 ).json({
      error: 'name required'
    })
  }

  if ( !body.number ) {
    return response.status( 400 ).json({
      error: 'number required'
    })
  }

  if ( persons.find( x => x.name === body.name ) ) {
    return response.status( 400 ).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat( person )

  response.json( person )
})

const port = 3001
app.listen( port, () => {

})