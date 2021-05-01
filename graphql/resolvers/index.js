import commetsResolver from "./commets.js";
import postResolvers from "./posts.js";
import usersResolvers from "./users.js";

const resolvers = {
    //Cada vez que una query, mutation o subscription retorne un post va a pasar por aqui
    Post:{
        likeCount:(parent)=> {
            //console.log('this the parent: ', parent);
            return parent.likes.length
        }
            ,
        commentCount:(parent, args, context, info)=>{ 
            console.log('this the parent: ', parent);
            console.log('this the args: ', args);
            console.log('this the info: ', info);
            return parent.comments.length
        }
    },
    Query: {
        ...postResolvers.Query,
        
    },
    Mutation:{
        ...usersResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commetsResolver.Mutation
    
    },
    Subscription: {
        ...postResolvers.Subscription
    }
}

export default resolvers