import postResolvers from "./posts.js";
import usersResolvers from "./users.js";

const resolvers = {
    Query: {
        ...postResolvers.Query,
        
    },
    Mutation:{
        ...usersResolvers.Mutation,
        ...postResolvers.Mutation
    
    },
}

export default resolvers