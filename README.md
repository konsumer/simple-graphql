# simple-graphql

This is a simple [schema-stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) GraphQL server. Use it as a template for your own servers.

* `src/schema/*.graphql` and `src/schema/*.js` are merged into typedefs & resolvers, so it's super-simple to add new stuff.
* I implemented the data-layer with leveldb, but you can use whatever you like.
* I made a simple JWT auth system, complete with `@auth()` directive, and included example endpoints that require authentications.
* I included directives from [graphql-custom-directives](https://github.com/lirown/graphql-custom-directives), to make getting the data you want easier

You can think of the whole thing as a strongly-typed database, with a GraphQL interface and a leveldb storeage-back, complete with JWT authentication.

## example queries

### User

Basic auth-system.

#### make a new user

You will see a token on the console, use that to `validate`

```graphql
mutation {
  signup (email: "konsumer@jetboystudio.com", password: "password") {
    id
  }
}
```

#### verify the new user

```graphql
mutation {
  validate (token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiQjFvR0k0ejVHIiwiZW1haWwiOiJrb25zdW1lckBqZXRib3lzdHVkaW8uY29tIiwicm9sZXMiOltdfSwiaWF0IjoxNTIxNzkyNTMwLCJleHAiOjE1MjE4Nzg5MzB9.ml4s3RlfWCAAIfem7qntZufzsvTouNv-n-dgOjaxlX8") {
    token
    user {
      id
      email
      roles
    }
  }
}
```

#### login

```graphql
mutation {
  login (email: "konsumer@jetboystudio.com", password: "password") {
    token
    user {
      id
      email
      roles
    }
  }
}
```

### Product

This is a basic CRUD example.

#### add a product

```graphql
mutation{
  productAdd (name:"cool shirt", description: "it's cool", price: 20) {
    id
  }
}
```

#### list products

```graphql
{
  productsAll {
    id
    name
  }
}
```

#### get one product

```graphql
{
  product (id: "Byor6NfqG") {
    id
    name
  }
}
```

#### update a product

```graphql
mutation{
  productUpdate (id:"Byor6NfqG", name: "really cool shirt") {
    id
    name
  }
}
```


### Star wars

This is a more complex relationship example.

#### search

For a search you have to use `...on` to pull fields for differnt types:

```graphql
{
  search (text:"luke") {
    ...on Character {
      id
      name
    }
    ...on Starship {
      id
      name
    }
  }
}
```

#### using the graph

You can drill into R2's friends of friends:

```graphql
{
  search (text:"r2") {
    ...on Character {
      name
      friends {
        name
        friends {
          name
        }
      }
    }
  }
}
```

or if you know the ID:

```graphql
{
  character (id:"2001") {
    friends {
      name
      friends {
        name
      }
    }
  }
}
```
