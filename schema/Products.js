/**
 * Basic CRUD example, with "must auth to write"
 */

import uuid from 'uuid/v4'
import { products, get, getAll } from '../db'
import { verify } from '../auth'

export default {
  Query: {
    getProduct: (obj, { id }, context, info) => get(products, id),
    getAllProducts: async (obj, args, context, info) => getAll(products)
  },

  Mutation: {
    createProduct: async (obj, {token, input}, context, info) => {
      const ok = verify(token)
      const id = uuid()
      return products.put(id, input)
        .then(() => Object.assign({}, input, {id}))
    },

    updateProduct: async (obj, {token, id, input}, context, info) => {
      const ok = verify(token)
      const product = await products.get(id)
      return products.put(id, Object.assign({}, product, input))
        .then(() => Object.assign({id}, product, input))
    },

    deleteProduct: (obj, {token, id}, context, info) => {
      const ok = verify(token)
      return products.del(id)
    }
  }
}
