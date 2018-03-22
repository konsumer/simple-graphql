/**
 * Basic CRUD example, with "must auth to write"
 */

import { generate as shortid } from 'shortid'
import Model from '../Model'

export const Product = Model('product')

export default {
  Query: {
    product: (obj, { id }, context, info) => Product.get(id),
    productsAll: async (obj, args, context, info) => Product.findAll()
  },

  Mutation: {
    productAdd: async (obj, { input }, context, info) => {
      const id = shortid()
      return Product.put(id, input)
        .then(() => ({ ...input, id }))
    },

    productUpdate: async (obj, { id, input }, context, info) => {
      const product = await Product.get(id)
      return Product
        .put(id, { ...product, ...input })
        .then(() => ({ id, ...product, ...input }))
    },

    productDelete: (obj, { id }, context, info) => Product.del(id)
  }
}
