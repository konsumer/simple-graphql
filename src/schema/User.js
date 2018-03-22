import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import Model from '../Model'

export const User = Model('user')

// create a token for the user
export const sign = (data) => jwt.sign({ data }, process.env.JWT_SECRET, { expiresIn: '1h' })

// validate an expired (but otherwise valid) token
export const refresh = async (token) => {
  const { data } = await jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    ignoreExpiration: true
  })
  return sign(data)
}

export default {
  Query: {
    me: async (obj, args, { user }, info) => {
      try {
        return user.data
      } catch (e) {
        throw new Error('Invalid token')
      }
    }
  },

  Mutation: {
    register: async (obj, { email, password }, context, info) => {
      try {
        await User.get(email)
        return Promise.reject(new Error('Email is already taken.'))
      } catch (e) {
        const hashPw = await hash(password, 10)
        return User.put(email, { email, password: hashPw })
          .then(() => {
            const token = sign({email})
            return {
              email,
              token
            }
          })
      }
    },

    login: async (obj, { email, password }, context, info) => {
      try {
        const user = await User.get(email)
        const check = await compare(password, user.password)
        if (check) {
          const token = sign({email})
          return {
            email,
            token
          }
        } else {
          return Promise.reject(new Error('Bad email or password.'))
        }
      } catch (e) {
        return Promise.reject(new Error('User not found.'))
      }
    },

    refresh: async (obj, args, { token }, info) => {
      const t = await refresh(token)
      return {
        token: t.token,
        email: t.data.user.email
      }
    }
  }
}
