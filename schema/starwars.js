/**
 * Demo service with recursive data-types and stuff
 */

import { starwars } from '../db'
import uuid from 'uuid/v4'

/**
 * Helper function to not fail on no record
 */
const get = (table, id) => starwars[table].get(id)
  .catch(e => {})

/**
 * Helper to get all records from a table
 */
const getAll = (table) => new Promise((resolve, reject) => {
  const records = []
  starwars[table].createReadStream()
    .on('data', (data) => { records.push(data.value) })
    .on('error', (err) => { reject(err) })
    .on('end', () => { resolve(records) })
})

/**
 * Helper function to get a character by ID.
 */
const getCharacter = async (id) => await get('humans', id) || await get('droids', id)

/**
 * Allows us to query for a character's friends.
 */
const getFriends = (character) => character.friends.map(id => getCharacter(id))

/**
 * Allows us to fetch the undisputed hero of the Star Wars trilogy, R2-D2.
 */
const getHero = (episode) => episode === 'EMPIRE' ? get('humans', '1000') : get('droids', '2001')

/**
 * Allows us to fetch the ephemeral reviews for each episode
 */
const getReviews = (episode) => getAll('reviews').then(reviews => reviews.filter(r => r.episode === episode))

// I don't really know what these are for, I think it's to tell graphql where to insert the value in the graph
const toCursor = str => Buffer('cursor' + str).toString('base64')
const fromCursor = str => Buffer.from(str, 'base64').toString().slice(6)

const resolvers = {
  Query: {
    hero: (root, { episode }) => getHero(episode),
    character: (root, { id }) => getCharacter(id),
    human: (root, { id }) => get('humans', id),
    droid: (root, { id }) => get('droids', id),
    starship: (root, { id }) => get('starships', id),
    reviews: (root, { episode }) => getReviews(episode),
    search: async (root, { text }) => {
      const re = new RegExp(text, 'i')

      const humans = await getAll('humans')
      const droids = await getAll('droids')
      const starships = await getAll('starships')

      const allData = [
        ...humans,
        ...droids,
        ...starships
      ]

      return allData.filter((obj) => re.test(obj.name))
    }
  },

  Mutation: {
    createReview: (root, { episode, review }) => {
      review.episode = episode
      return starwars['reviews'].put(uuid(), review)
        .then(() => {
          return review
        })
    }
  },

  Character: {
    __resolveType: async (data, context, info) => {
      const human = await get('humans', data.id)
      const droid = await get('droids', data.id)

      if (human) {
        return info.schema.getType('Human')
      }
      if (droid) {
        return info.schema.getType('Droid')
      }
      return null
    }
  },

  Human: {
    height: ({ height }, { unit }) => {
      if (unit === 'FOOT') {
        return height * 3.28084
      }

      return height
    },
    friends: ({ friends }) => friends.map(getCharacter),
    friendsConnection: ({ friends }, { first, after }) => {
      first = first || friends.length
      after = after ? parseInt(fromCursor(after), 10) : 0
      const edges = friends.map((friend, i) => ({
        cursor: toCursor(i + 1),
        node: getCharacter(friend)
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
    },
    starships: ({ starships }) => starships.map(getStarship),
    appearsIn: ({ appearsIn }) => appearsIn
  },

  Droid: {
    friends: ({ friends }) => friends.map(getCharacter),
    friendsConnection: ({ friends }, { first, after }) => {
      first = first || friends.length
      after = after ? parseInt(fromCursor(after), 10) : 0
      const edges = friends.map((friend, i) => ({
        cursor: toCursor(i + 1),
        node: getCharacter(friend)
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
    },
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
      const human = await get('humans', data.id)
      const droid = await get('droids', data.id)
      const starship = await get('starships', data.id)
      if (human) {
        return info.schema.getType('Human')
      }
      if (droid) {
        return info.schema.getType('Droid')
      }
      if (starship) {
        return info.schema.getType('Starship')
      }
      return null
    }
  }
}

export default resolvers
