import jwt from 'jsonwebtoken';
import { AuthenticationError  } from 'apollo-server'

import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.SECRET_WORD;

const checkAuth = (context) =>{
    //context = {...headers}
    //Header is setted from the frontend
    const authHeader = context.req.headers.authorization;
    if(authHeader){
        //Bearer ..token. (convention)
        const token = authHeader.split("Bearer ")[1];
        if(token){
            try {
                const user = jwt.verify(token, SECRET);
                return user;
            } catch (error) {
                throw new AuthenticationError('Invalid/expired token');
            }
        }
        throw new Error('Authentication token must be \'Bearer [token]\'')
    }
    throw new Error('Authorization header must be provided')
}

export default checkAuth