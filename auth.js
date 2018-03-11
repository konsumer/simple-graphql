/**
 * JWT & other auth utils go in here
 */

import jwt from 'jsonwebtoken'
export { hash, compare } from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'not a good secret'

export const sign = (user, expiresIn = '1h') => jwt.sign({ data: { user } }, JWT_SECRET, { expiresIn })
export const verify = (token) => jwt.verify(token, JWT_SECRET)
