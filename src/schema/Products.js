/**
 * Basic CRUD example, with "must auth as ADMIN to write"
 */

import { generate as shortid } from 'shortid'
import Model from '../Model'

export const Product = Model('product')

export default {
  Query: {
    product: (obj, { id }, context, info) => Product.get(id),
    productsAll: (obj, args, context, info) => Product.findAll().then(r => r.results)
  },

  Mutation: {
    productAdd: async (obj, { name, description, price }, context, info) => {
      const id = shortid()
      return Product.put(id, {id, name, description, price})
        .then(() => ({ id, name, description, price }))
    },

    productUpdate: async (obj, { id, name, description, price }, context, info) => {
      const product = await Product.get(id)
      return Product
        .put(id, { ...product, id, name, description, price })
        .then(() => ({ id, name, description, price }))
    },

    productDelete: (obj, { id }, context, info) => Product.del(id)
  }
}
