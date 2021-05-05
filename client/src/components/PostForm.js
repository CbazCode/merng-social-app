import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { gql } from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';

import { FETCH_POST_QUERY } from '../util/graphql';

import { useForm } from '../util/hooks';
const PostForm = () => {
	const { value, onChange, onSubmit } = useForm(createPostCallback, {
		body: '',
	});

	const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
		variables: value,
		
		update: (proxy, result) => {
			//hacemos esto para mostrar la mutacion en el front porque como apollo lo toma de cache al no actulizarse no se muestra el cambio
			//accesamos directo a la cache para actualizar la cache con cada post creado, toda la cache que se tiene hasta le momento lo almacenamos en data
			const data = proxy.readQuery({
				query: FETCH_POST_QUERY,
			});

			//almacenamos en cache el nuevo post
			data.getPosts.push(result.data.createPost);
			proxy.writeQuery({ query: FETCH_POST_QUERY, data });
			value.body = '';
		},
		refetchQueries: [{ query: FETCH_POST_QUERY }],
	});

	function createPostCallback() {
		createPost()
			.then(() => {})
			.catch((e) => {});
	}

	return (
		<>
			<Form onSubmit={onSubmit}>
				<h2>Create a post:</h2>
				<Form.Field>
					<Form.Input
						placeholder="Hi world!"
						name="body"
						onChange={onChange}
						value={value.body}
						error={error ? true : false}
					/>
					<Button type="submit" color="teal">
						Submit
					</Button>
				</Form.Field>
			</Form>
			{error && (
				<div className="ui error message" style={{ marginBottom: 20 }}>
					<ul className="list">
						<li>{error.graphQLErrors[0].message}</li>
					</ul>
				</div>
			)}
		</>
	);
};
const CREATE_POST_MUTATION = gql`
	mutation createPost($body: String!) {
		createPost(body: $body) {
			id
			body
			createdAt
			username
			likes {
				id
				username
				createdAt
			}
			likeCount
			comments {
				id
				body
				username
				createdAt
			}
			commentCount
		}
	}
`;
export default PostForm;
