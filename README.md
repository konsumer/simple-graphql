# simple-graphql

This is a simple [schema-stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) GraphQL server. Use it as a template for your own servers.

`schema/*.graphql` and `schema/*.js` are merged into typedefs & resolvers, so it's super-simple to add new stuff.

I implemented the data-layer with leveldb, but you can use whatever you like.

I also made a simple JWT auth system, and included example endpoints that require authentications.

You can think of the whole thing as a strongly-typed database, with a GraphQL interface and a leveldb storeage-back, complete with JWT authentication.