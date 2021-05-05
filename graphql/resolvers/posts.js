import Post from "../../models/Post.js";
import checkAuth from "../../util/checkAuth.js";
//For each query, mutation or subscription it has its corresponding resolver
const postResolvers = {
    Query: {
        async getPosts(){
            try{
                //..sort({ createdAt: -1 }) es para que cuando se cree se almacene en orden desde la ultima creacion hacia el primero
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch(err){
                throw new Error(err)
            }
        },
        async getPost(parent, { postId }) {
			try {
				const post = await Post.findById(postId);

				if (post) {
					return post;
				} else {
					throw new Error('Post not found');
				}
			} catch (error) {
				throw new Error(error);
			}
		},

    },
    Mutation:{
        //Ahora como context tiene al requestBody podemos utilizarlo aqui
		async createPost(parent,{body},context){
			const user = checkAuth(context);

			if(body.trim()===''){
				throw new Error('Post body must not be empty')
			}

			const newPost = new Post({
				body,
				user:user.id,
				username:user.username,
				createdAt:new Date().toISOString()
			});

			const post = await newPost.save();
			
			context.pubsub.publish('NEW_POST',{
				newPost:post
			})
			return post;
		},
		async deletePost(_,{postId},context){
			const user = checkAuth(context);
			try {
				const post = await Post.findById(postId);
				if(user.username===post.username){
					await post.delete();
					return 'Post deleted successfully';
				}else{
					throw new AuthenticationError('Action not allowed');
				}
			} catch (error) {
				throw new Error(error);
			}
		}
	},
	Subscription:{
		newPost:{
			subscribe: (_,__,{pubsub})=>pubsub.asyncIterator('NEW_POST')
		}
	}
}

export default postResolvers