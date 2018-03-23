import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generate as shortid } from 'shortid'
import Model from '../Model'

export const User = Model('user', ['email'])

export default {
  Query: {
    me: async (obj, args, { user }) => {
      try {
        return user.data
      } catch (e) {
        throw new Error('Invalid token')
      }
    }
  },

  Mutation: {
    signup: async (obj, { email, password }) => {
      const existingUser = await User.findOne({email})
      if (existingUser) {
        throw new Error('That user already exists.')
      }
      const id = shortid()
      const data = { id, email, roles: [] }
      const newUser = { ...data, password: await hash(password, 10) }

      // implement your own side-channel here, like emailing a link or whatever
      const registerToken = await jwt.sign({ data }, process.env.REGISTER_SECRET, { expiresIn: '1d' })
      console.log('Register token:', registerToken)

      await User.put(id, newUser)
      return { ...data, registerToken }
    },

    validate: async (obj, { token }) => {
      const t = await jwt.verify(token, process.env.REGISTER_SECRET)
      const { id } = t.data
      const user = await User.get(id)
      const roles = ['USER']
      const newUser = { ...user, roles }
      await User.put(id, newUser)
      const data = { ...t.data, roles }
      const newToken = await jwt.sign({ data }, process.env.JWT_SECRET, { expiresIn: '1h' })
      return { user: data, token: newToken }
    },

    login: async (obj, { email, password }) => {
      const user = await User.findOne({email})
      if (!user) throw new Error('Bad email or password.')
      const legit = await compare(password, user.password)
      if (!legit) throw new Error('Bad email or password.')
      if (!user.roles || user.roles.indexOf('USER') === -1) {
        throw new Error('You must validate, first.')
      }
      const data = { ...user, password: undefined }
      const token = await jwt.sign({ data }, process.env.JWT_SECRET, { expiresIn: '1h' })
      return { user: data, token }
    },

    refresh: async (obj, args, { user }) => {
      // here you could check a data-source to see if it's been black-listed
      const data = user.data
      const newToken = await jwt.sign({ data }, process.env.JWT_SECRET, { expiresIn: '1h' })
      return {...data, token: newToken}
    }
  }
}
