import level from 'level'
import sublevel from 'sublevel'
import seed from './starwars_seed.json'

export const db = level('./.database', {valueEncoding: 'json'})
export const users = sublevel(db, 'users')
export const products = sublevel(db, 'products')

/**
 * Helper function to not fail on no record
 */
export const get = (table, id) => table.get(id)
  .catch(e => {})

/**
 * Helper to get all records from a table
 */
export const getAll = (table) => new Promise((resolve, reject) => {
  const records = []
  table.createReadStream()
    .on('data', (data) => { records.push(Object.assign({id: data.key}, data.value)) })
    .on('error', (err) => { reject(err) })
    .on('end', () => { resolve(records) })
})

// initialize starwars database
export const starwars = {reviews: sublevel(db, 'starwars_reviews')}
Object.keys(seed).forEach(k => {
  starwars[k] = sublevel(db, `starwars_${k}`)
  seed[k].forEach(v => {
    starwars[k].put(v.id, v)
  })
})

export default db
