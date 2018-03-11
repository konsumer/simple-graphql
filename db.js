import level from 'level'
import sublevel from 'sublevel'
import seed from './starwars_seed.json'

export const db = level('./.database', {valueEncoding: 'json'})
export const users = sublevel(db, 'users')

// initialize starwars database
export const starwars = {reviews: sublevel(db, 'starwars_reviews')}
Object.keys(seed).forEach(k => {
  starwars[k] = sublevel(db, `starwars_${k}`)
  seed[k].forEach(v => {
    starwars[k].put(v.id, v)
  })
})

export default db
