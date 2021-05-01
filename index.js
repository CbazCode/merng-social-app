import { ApolloServer, PubSub } from 'apollo-server'
import mongoose from 'mongoose'


import MONGODB from './config.js'
import typeDefs from './graphql/typeDefs.js'
import resolvers from './graphql/resolvers/index.js'    

const pubsub = new PubSub();
const server = new ApolloServer({
    typeDefs,
    resolvers,
    //Aquí obtenemos cualquier cosa que se haya pasado antes de este servidor de publicaciones y obtenemos la solicitud y la respuesta de Express
    //Con esto toma el requestBody y solo lo reenvia al context, entonces podemos acceder a ese requestBody a travez del context
    context: ({req}) => ({req, pubsub})
})

mongoose.connect(MONGODB.URI, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log('MongoDB connected')
        return server.listen({port: 5000})
    })
    .then(res => {
        console.log(`Server runnig as ${res.url}`)
    })
    .catch(err => {
        console.log(err)
    })
