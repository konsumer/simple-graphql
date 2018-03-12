/**
 * JWT & other auth utils go in here
 */

import jwt from 'jsonwebtoken'
export { hash, compare } from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'not a good secret'

// sign a user-object with a JWT that expires (default 1h)
export const sign = (user, expiresIn = '1h') => jwt.sign({ data: { user } }, JWT_SECRET, { expiresIn })

// verify a JWT
export const verify = (token) => jwt.verify(token, JWT_SECRET)

// refresh token. trade an existing token, expired or not, but otherwise valid, for a fresh token
// TODO: check a no-fly list for denial of refresh
export const refresh = async (token, expiresIn = '1h') => {
  try {
    const { data } = await jwt.verify(token, JWT_SECRET)
    return { data, token: jwt.sign({ data }, JWT_SECRET, { expiresIn }) }
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      const { data } = jwt.decode(token)
      return { data, token: jwt.sign({ data }, JWT_SECRET, { expiresIn }) }
    } else {
      throw (e)
    }
  }
}
