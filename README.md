# simple-graphql

This is a simple [schema-stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) GraphQL server. Use it as a template for your own servers.

* `src/schema/*.graphql` and `src/schema/*.js` are merged into typedefs & resolvers, so it's super-simple to add new stuff.
* I implemented the data-layer with leveldb, but you can use whatever you like.
* I made a simple JWT auth system, complete with `@auth()` directive, and included example endpoints that require authentications.
* I included directives from [graphql-custom-directives](https://github.com/lirown/graphql-custom-directives), to make getting the data you want easier

You can think of the whole thing as a strongly-typed database, with a GraphQL interface and a leveldb storeage-back, complete with JWT authentication.