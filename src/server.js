import path from 'path'
import chalk from 'chalk'
import { makeExecutableSchema } from 'graphql-tools'
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cors from 'cors'
import jwt from 'express-jwt'
import { graphqlExpress } from 'apollo-server-express'
import { createExpressContext } from 'apollo-resolvers'
import { formatError } from 'apollo-errors'
import expressPlayground from 'graphql-playground-middleware-express'
import { fileLoader, mergeTypes } from 'merge-graphql-schemas'
import { sync as glob } from 'glob'
import { merge } from 'lodash'

import AuthDirective from './directives/AuthDirective'

require('pretty-error').start()

// merge a glob-pattern of files (and optional ignore-pattern) into an object
const globRequire = (pattern, ignore) => {
  let out = {}
  const options = ignore ? { ignore } : undefined
  glob(pattern, options).forEach(f => {
    const mod = require(f)
    out = merge(out, mod.default || mod)
  })
  return out
}

const schemaDir = path.join(__dirname, 'schema')
const resolvers = globRequire(path.join(schemaDir, '*.js'), path.join(schemaDir, '*.*.js'))
const typeDefs = mergeTypes(fileLoader(path.join(schemaDir, '**/*.graphql')), { all: true })
const schemaDirectives = {
  auth: AuthDirective
}
const schema = makeExecutableSchema({typeDefs, resolvers, schemaDirectives})

const app = express()
app.use(cors())
app.use(compression())

// token is optional, but will be parsed if set
app.use(jwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false
}))

app.use('/graphql', bodyParser.json(), graphqlExpress((req, res) => {
  const context = createExpressContext({ user: req.user }, res)
  return { schema, context, formatError, tracing: process.env.NODE_ENV === 'development' }
}))

if (process.env.NODE_ENV === 'development') {
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
}

// handle errors
app.use(function (err, req, res, next) {
  let e = formatError(err)
  if (!e.errors) {
    e = {errors: [{message: e.message, name: e.name}]}
  }
  res.json(e)
})

app.listen(process.env.PORT, () => {
  console.log(
    '😋  Server running at %s',
    chalk.keyword('blue').underline(`http://localhost:${process.env.PORT}${process.env.NODE_ENV === 'development' ? '/playground' : '/graphql'}`)
  )
})
