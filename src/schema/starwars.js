/**
 * Demo service with recursive data-types and stuff
 */

import { generate as shortid } from 'shortid'
import toTitleCase from 'titlecase'
import Model from '../Model'
import mock from '../starwars_seed.json'

// get a table for starwars, with type-field indexed.
export const Starwars = Model('starwars', ['type'])

// setup the database
Object.keys(mock).forEach(type => {
  mock[type].forEach(rec => {
    Starwars.put(rec.id, {...rec, type})
  })
})

// I don't really know what these are for, I think it's to tell graphql where to insert the value in the graph
const toCursor = str => Buffer.from('cursor' + str).toString('base64')
const fromCursor = str => Buffer.from(str, 'base64').toString().slice(6)

// DRY implementation of friendsConnection for characters
const friendsConnection = ({ friends }, { first, after }) => {
  first = first || friends.length
  after = after ? parseInt(fromCursor(after), 10) : 0
  const edges = friends.map((friend, i) => ({
    cursor: toCursor(i + 1),
    node: Starwars.get(friend)
  })).slice(after, first + after)
  const slicedFriends = edges.map(({ node }) => node)
  return {
    edges,
    friends: slicedFriends,
    pageInfo: {
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      hasNextPage: first + after < friends.length,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
    },
    totalCount: friends.length
  }
}

const resolvers = {
  Query: {
    // Allows us to fetch the undisputed hero of the Star Wars trilogy, R2-D2.
    hero: (root, { episode }) => Starwars.get(episode === 'EMPIRE' ? '1000' : '2001'),
    character: (root, { id }) => Starwars.get(id),
    human: (root, { id }) => Starwars.get(id),
    droid: (root, { id }) => Starwars.get(id),
    starship: (root, { id }) => Starwars.get(id),
    reviews: (root, { episode }) => Starwars.findAll({$and: [{type: 'review'}, {episode}]}).then(r => r.results),
    search: (root, { text }) => Starwars.findAll({ 'name': new RegExp(text, 'i') }).then(r => r.results.filter(r => ['human', 'droid', 'starship'].indexOf(r.type) !== -1))
  },

  Mutation: {
    createReview: (root, { episode, review }) => {
      const id = shortid()
      review = {...review, id, type: 'review', episode}
      return Starwars.put(id, review)
        .then(() => review)
    }
  },

  Character: {
    __resolveType: async (data, context, info) => {
      const character = await Starwars.get(data.id)
      return character ? info.schema.getType(toTitleCase(character.type)) : null
    }
  },

  Human: {
    height: ({ height }, { unit }) => unit === 'FOOT' ? height * 3.28084 : height,
    friends: ({ friends }) => friends.map(id => Starwars.get(id)),
    friendsConnection,
    starships: ({ starships }) => starships.map(id => Starwars.get(id)),
    appearsIn: ({ appearsIn }) => appearsIn
  },

  Droid: {
    friends: ({ friends }) => friends.map(id => Starwars.get(id)),
    friendsConnection,
    appearsIn: ({ appearsIn }) => appearsIn
  },

  FriendsConnection: {
    edges: ({ edges }) => edges,
    friends: ({ friends }) => friends,
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount
  },

  FriendsEdge: {
    node: ({ node }) => node,
    cursor: ({ cursor }) => cursor
  },

  Starship: {
    length: ({ length }, { unit }) => {
      if (unit === 'FOOT') {
        return length * 3.28084
      }
      return length
    },

    coordinates: () => {
      return [[1, 2], [3, 4]]
    }
  },

  SearchResult: {
    __resolveType: async (data, context, info) => {
      const thing = await Starwars.get(data.id)
      return thing ? info.schema.getType(toTitleCase(thing.type)) : null
    }
  }
}

export default resolvers
