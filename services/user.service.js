const userModel = require('../models/user.model')
const jwtTool = require('../utils/jwt');

const signUpUser = async (userData) => {
    const newUser = await userModel.create(userData);
    const data = {
            id: newUser._id,
            name: newUser.name,
            username: newUser.username
        };
    const token = jwtTool.encode(data);
    return {
        code: 201,
        message: 'User created successfully',
        data: data,
        token: token       
    };
};

const loginUser = async (userData) => {
    const {username, password} = userData;
    const user = await userModel.findOne({username, isDeleted: false});
    if  (!user) {
        return {
            code: 404,
            message: 'Invalid username or password'
        }
    }
    const isValid = await user.isValidPassword(password);
    if (!isValid) {
        return {
            code: 404,
            message: 'Invalid username or password'
        }
    }
    const data = {
        id: user._id,
        name: user.name,
        username: user.username
    };
    const token = jwtTool.encode(data);
    return {
        code: 200,
        message: 'Login successful',
        data: data,
        token: token
    }
};
        
const getUserProfile = async (userId) => {
    const user = await userModel.findById(userId, {isDeleted: false});
    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        }
    }
    const data = {
        id: user._id,
        name: user.name,
        username: user.username
    };
    return {
        code: 200,
        message: 'User profile fetched successfully',
        data: data
    }
};

const updateUserProfile = async (userId, updateData, auth) => {
    if (userId != auth.id) {
        return {
            code: 403,
            message: 'Unauthorized to update this profile'
        }
    }
    const user = await userModel.findByIdAndUpdate(userId, updateData, {new: true});
    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        }
    }
    const data = {
        id: user._id,
        name: user.name,
        username: user.username
    };
    return {
        code: 200,
        message: 'User profile updated successfully',
        data: data
    }
}

const softDeleteUser = async (userId, auth) => {
    if (userId != auth.id) {
        return {
            code: 403,
            message: 'Unauthorized to update this profile'
        }
    }
    const user = await userModel.findByIdAndUpdate(userId, {isDeleted: true}, {new: true});
    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        }
    }
    return {
        code: 200,
        message: 'User deleted successfully'
    }
}

const hardDeleteUser = async (userId, auth) => {
    if (userId != auth.id) {
        return {
            code: 403,
            message: 'Unauthorized to update this profile'
        }
    }
    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        }
    }
    return {
        code: 200,
        message: 'User deleted successfully'
    }
}

module.exports = {
    signUpUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    softDeleteUser,
    hardDeleteUser
}




// convert soft delete to hard after 24 hours
