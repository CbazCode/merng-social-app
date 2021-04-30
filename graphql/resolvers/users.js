import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../../models/User.js";
import { UserInputError } from 'apollo-server';

import dotenv from 'dotenv';
import { validateLoginInput, validateRegisterInput } from '../../util/validators.js';
dotenv.config();

function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		process.env.SECRET_WORD,
		{ expiresIn: '1h' }
	);
}

const userResolver = {
    Mutation: {

        async login(_, { username, password }) {
			const { errors, valid } = validateLoginInput(username, password);
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
			const user = await User.findOne({ username });
			if (!user) {
				errors.general = 'User not found';
				throw new UserInputError('Wrong credentials', { errors });
			}

			const match = await bcrypt.compare(password, user.password);
			
			if (!match) {
				errors.general = 'Wrong credentials';
				throw new UserInputError('Wrong credentials', { errors });
			}

            const token = generateToken(user);
            return {
				...user._doc,
				id: user._id,
				token,
			};
		},
        //parent: le da el resultado de lo que fue la entrada del último paso 
        //args: arguments, parameters
        async register(parent, { registerInput: { username, email, password, confirmPassword } }, context, info){
            // TODO : validate user data 
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}
            // TODO :Makes sure user doesnt already exist
            const user = await User.findOne({ username });
			if (user) {
				throw new UserInputError('Username is taken', {
					errors: {
						username: 'This username is taken',
					},
				});
			}

            // TODO :hash password and create an auth token
            //Hash password and create auth token
			password = await bcrypt.hash(password, 12);

            const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString(),
			});

            const res = await newUser.save();

            const token = generateToken(res);
			return {
				...res._doc,
				id: res._id,
				token,
			};
        }
    }
}

export default userResolver