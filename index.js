require( 'dotenv' ).config()
const express = require( 'express' )
const app = express()
const cors = require( 'cors' )
const morgan = require( 'morgan' )
const Person = require( './models/person' )

app.use( express.static( 'build' ) )
app.use( cors() )
app.use( express.json() )

morgan.token( 'body', ( request, response ) => {
  const ret = request.method === 'POST'
  ? JSON.stringify( request.body )
  : ' '
  return ret
})

app.use( morgan( ':method :url :status :res[content-length] - :response-time ms :body' ) )

app.get( '/info', ( request, response ) => {
  Person.countDocuments({})
  .then ( personsCount => {
    response.send( `<p>Phonebook has info for ${personsCount} people</p>
                <p>${new Date()}</p>` )
  })
})

app.get( '/api/persons', ( request, response ) => {
  Person.find({}).then( persons => {
    response.json( persons )
  })
})

app.get( '/api/persons/:id', ( request, response, next ) => {
  Person.findById( request.params.id )
  .then( person => {
    if ( person ) {
      response.json( person )
    } else {
      response.status( 404 ).end()
    }
  })
  .catch( error => next( error) )
})

app.delete( '/api/persons/:id', ( request, response, next ) => {
  Person.findByIdAndRemove( request.params.id )
  .then( result => {
    response.status( 204 ).end()
  })
  .catch( error => next( error) )
})

app.post( '/api/persons', ( request, response, next ) => {
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

  const person = new Person ({
    name: body.name,
    number: body.number,
  })

  person.save()
  .then( savedPerson => {
    response.json( savedPerson )
  })
  .catch( error => next( error ) )
})

app.put( '/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate( request.params.id, person, { new: true } )
  .then( updatedPerson => {
    response.json( updatedPerson )
  })
  .catch( error => next( error) )
})

const errorHandler = ( error, request, response, next ) => {
  console.error( error.message )

  if ( error.name === 'CastError' ) {
    return response.status( 400 ).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next( error )
}

app.use( errorHandler )

const PORT = process.env.PORT || 3001
app.listen( PORT, () => {
  console.log(`Server running on port ${PORT}`)
})