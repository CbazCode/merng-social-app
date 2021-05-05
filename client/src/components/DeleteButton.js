import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, { useState } from 'react';
import { Button, Confirm, Icon } from 'semantic-ui-react';
import { FETCH_POST_QUERY } from '../util/graphql';
import MyPopup from '../util/MyPopup';
import { useHistory } from "react-router-dom"

const DeleteButton = ({ postId, commentId, callback }) => {
	const history = useHistory()
	const [confirmOpen, setConfirmOpen] = useState(false);

	const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;
	const [deletePostOrMutation] = useMutation(mutation, {
		update: (proxy, result) => {
			setConfirmOpen(false);
			// remove post from cache (se podria decir que cuando se trata de algun valor nuevo o que se va a quitar de la cache se hace esto pero si solo se van a actualizar una de sus propiedades y son identificadas por el ID del objeto papa no es necesario hacer lo siguiete)
			if (!commentId) {
				const data = proxy.readQuery({
					query: FETCH_POST_QUERY,
				});
				
				console.log('data antes:', data.getPosts)
				// FIXME : no remueve de cache funciona porque genera error
				// data.getPosts.push(data);
				data.getPosts = data.getPosts.filter( (p) => {
					console.log(p.id)
					console.log(postId)
					return p.id !== postId
				})
				console.log('data despues:', data.getPosts)
				proxy.writeQuery({ query: FETCH_POST_QUERY, data });
			}

			if (callback) {
				callback();
			}
		},
		variables: {
			postId,
			commentId,
		},
		//refetchQueries: [{ query: FETCH_POST_QUERY }],
	});

	function deletedPostCallback() {
		deletePostOrMutation()
			.then(() => {
				if(!commentId){
					history.push('/')
				}
			})
			.catch((e) => {
				console.log(e)
			});
	}
	return (
		<>
			<MyPopup content={commentId ? 'Delete comment' : 'Delete post'}>
				<Button as="div" color="red" onClick={() => setConfirmOpen(true)} floated="right">
					<Icon name="trash" style={{ margin: 0 }} />
				</Button>
			</MyPopup>

			<Confirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={deletedPostCallback} />
		</>
	);
};

const DELETE_POST_MUTATION = gql`
	mutation deletePost($postId: ID!) {
		deletePost(postId: $postId)
	}
`;
const DELETE_COMMENT_MUTATION = gql`
	mutation deleteComment($postId: ID!, $commentId: ID!) {
		deleteComment(postId: $postId, commentId: $commentId) {
			id
			comments {
				id
				username
				createdAt
				body
			}
			commentCount
		}
	}
`;

export default DeleteButton;
