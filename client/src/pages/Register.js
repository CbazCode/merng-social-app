// import { gql } from 'apollo-server-core';
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { useForm } from '../util/hooks';

import { AuthContext } from '../context/auth';

const Register = (props) => {
	const context = useContext(AuthContext);
	const [errors, setErrors] = useState({});

	const { onChange, onSubmit, value } = useForm(registerUser, {
		username: '',
		password: '',
		confirmPassword: '',
		email: '',
	});
	//addUser ejecutara la mutation donde sea llamado en este caso no se le pasan variables porque ya fueron establecidas en el useMutation
	const [addUser, { loading }] = useMutation(REGISTER_USER, {
		//Funcion que se ejecuta si la mutation fue un exito
		// update(proxy, result){

		// }
		//Sirve tambien para actualizar la cache en caso haya borrado o creado de cosas
		update(_, { data: { register: userData } }) {
			context.login(userData);
			props.history.push('/');
		},
		onError(err) {
			setErrors(err.graphQLErrors[0].extensions.exception.errors);
			// console.log(err.graphQLErrors[0].extensions.exception.errors);
		},
		variables: value,
	});

	//Se declara para evitar problemas de hoisting ya que es una funcion definida, en cambio si mandamos addUser directo al UseForm no lo reconoce porq es algo que retorna el useMutation
	function registerUser() {
		addUser();
	}

	return (
		<div className="form-container">
			<Form onSubmit={onSubmit} noValidate className={loading ? 'loading' : ''}>
				<h1>Register</h1>
				<Form.Input
					label="Username"
					placeholder="Username... "
					name="username"
					value={value.username}
					onChange={onChange}
					error={errors.username ? true : false}
				/>
				<Form.Input
					label="Email"
					placeholder="Email... "
					name="email"
					value={value.email}
					onChange={onChange}
					error={errors.email ? true : false}
				/>
				<Form.Input
					label="Password"
					placeholder="Password... "
					name="password"
					value={value.password}
					onChange={onChange}
					type="password"
					error={errors.password ? true : false}
				/>
				<Form.Input
					label="Confirm password"
					placeholder="Confirm password... "
					name="confirmPassword"
					value={value.confirmPassword}
					onChange={onChange}
					type="password"
					error={errors.confirmPassword ? true : false}
				/>
				<Button type="submit" primary>
					Register
				</Button>
			</Form>
			{Object.keys(errors).length > 0 && (
				<div className="ui error message">
					<ul className="list">
						{Object.values(errors).map((value) => (
							<li key={value}>{value}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

const REGISTER_USER = gql`
	mutation register($username: String!, $email: String!, $password: String!, $confirmPassword: String!) {
		register(
			registerInput: {
				username: $username
				email: $email
				password: $password
				confirmPassword: $confirmPassword
			}
		) {
			id
			email
			username
			createdAt
			token
		}
	}
`;

export default Register;
