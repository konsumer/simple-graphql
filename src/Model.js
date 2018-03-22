/**
 * Setup an efficient mongo-like leveldb "table" (sublevel), complete with promise-returning findOne/findAll
 * see https://github.com/eugeneware/jsonquery-engine for info
 */

import path from 'path'
import Level from 'level'
import Sublevel from 'sublevel'
import LevelQuery from 'level-queryengine'
import jsonqueryEngine from 'jsonquery-engine'

process.env.DB_LOCATION = process.env.DB_LOCATION || '/tmp/data-server'
const dbdir = path.resolve(path.dirname(__dirname), process.env.DB_LOCATION)
const db = Level(dbdir, { valueEncoding: 'json' })

export const Model = (table, indexes) => {
  indexes = indexes || []
  const DB = LevelQuery(Sublevel(db, table))

  DB.query.use(jsonqueryEngine())

  indexes.forEach(i => {
    DB.ensureIndex('email')
  })

  DB.findAll = (query = {}, start = 0, count = -1, cb) => {
    const promise = new Promise((resolve, reject) => {
      const out = {results: []}
      let i = 0
      const end = start + count
      const st = DB.query(query)
      st
        .on('data', d => {
          if (count === -1 || (i >= start && i < end)) {
            out.results.push(d)
          }
          i++
          if (count !== -1 && i >= end) {
            st.end()
          }
        })
        .on('stats', s => { out.stats = s })
        .on('end', () => resolve(out))
        .on('error', e => reject(e))
    })

    // support promises & callbacks
    if (cb && typeof cb === 'function') {
      promise.then(cb.bind(null, null), cb)
    }
    return promise
  }

  DB.findOne = (query = {}, cb) => DB.findAll(query, 0, 1, cb).then(r => r.results[0])

  return DB
}

export default Model
