import { readFileSync as readFile } from 'fs'
import path from 'path'
import { sync as glob } from 'glob'
import { merge } from 'lodash'
import { makeExecutableSchema } from 'graphql-tools'
import { fileLoader, mergeTypes } from 'merge-graphql-schemas'
import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'

const PORT = process.env.PORT || 3000

let resolvers = {}
glob(path.join(__dirname, 'schema', '*.js')).forEach(f => {
  const mod = require(f)
  resolvers = merge(resolvers, mod.default || mod)
})
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, 'schema', '**/*.graphql')), { all: true })
const schema = makeExecutableSchema({typeDefs, resolvers})

const app = express()

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

app.listen(PORT, () => {
  console.log(`Listening on http://0.0.0.0:${PORT}/graphiql`)
})
