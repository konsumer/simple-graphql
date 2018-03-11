import { users } from '../db'
import { hash, compare, sign, verify } from '../auth'

export default {
  Query: {
    me: async (obj, { token }, context, info) => {
      const ok = verify(token)
      return ok.data.user
    }
  },

  Mutation: {
    register: async (obj, { email, password }, context, info) => {
      try {
        await users.get(email)
        return Promise.reject('Email is already taken.')
      } catch (e) {
        const hashPw = await hash(password, 10)
        return users.put(email, { email, password: hashPw })
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
        const user = await users.get(email)
        const check = await compare(password, user.password)
        if (check) {
          const token = sign({email})
          return {
            email,
            token
          }
        } else {
          return Promise.reject('Bad email or password.')
        }
      } catch (e) {
        return Promise.reject('User not found.')
      }
    }
  }
}
