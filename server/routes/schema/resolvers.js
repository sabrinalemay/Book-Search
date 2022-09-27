const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../../utils/auth');
const { User, Book } = require('../../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const dataUser = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                return dataUser;
            }
            throw new AuthenticationError('Please log in');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne( { email} );
            if (!user) {
                throw new AuthenticationError('Try again');
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { book }, context) => {
            if (context.user){
                const userUpdate = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: {savedBooks: book} },
                    { new: true }
                )
                return userUpdate;
            }
            throw new AuthenticationError('Please log in')
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user){
                const userUpdate = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                )
                return userUpdate;
            }
        }
    }
};

module.exports = resolvers;