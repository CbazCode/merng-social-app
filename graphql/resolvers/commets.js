import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import Post from '../../models/Post.js';
import checkAuth from '../../util/checkAuth.js';

const commetsResolver = {
	Mutation: {
		createComment: async (_, { postId, body }, context) => {
			const { username } = checkAuth(context);
			if (body.trim() === '') {
				throw new UserInputError('Empty comment', {
					errors: {
						body: 'Comment body must not empty',
					},
				});
			}
			const post = await Post.findById(postId);
			if (post) {
				post.comments.unshift({
					body,
					username,
					createdAt: new Date().toISOString(),
				});
				await post.save();
				return post;
			} else {
				throw new UserInputError('Post not found');
			}
		},
        deleteComment: async (_,{postId,commentId},context) =>{
            // console.log(context);
            const {username} = checkAuth(context);
            
            const post = await Post.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex(c=>c.id===commentId);
                console.log(commentIndex)
                if(commentIndex<0){
                    throw new UserInputError('Comment already deleted')
                }
                //Para evitar que cualquier usuario elimine!
                if(post.comments[commentIndex].username===username){
                    post.comments.splice(commentIndex,1);
                    await post.save();
                    return post
                }else{
                    throw new AuthenticationError('Action not allowed');
                }
            }else{
                throw new UserInputError('Post not found');
            }


        },
        async likePost(_,{postId},context){
            const {username} = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                if(post.likes.find(like=>like.username===username)){
                    // Quirar like
                    post.likes = post.likes.filter(like=>like.username!==username);
                    
                }else{
                    //Aun no dio click en like -> Dar like
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save();
                return post;
            }else{
                throw new UserInputError('Post not found');
            }
        }
	},
};

export default commetsResolver;