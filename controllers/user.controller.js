const userService = require("../services/user.service");

const signUpUser = async (req, res) => {
  try {
    const newUser = req.body;
    const response = await userService.signUpUser(newUser);
    res.status(response.code).json({
      message: response.message,
      data: response.data,
      token: response.token,
    });
  } catch (error) {
    console.error("Error in signUpUser controller:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
    try {
        const userData = req.body;
        const response = await userService.loginUser(userData);
        res.status(response.code).json({
            message: response.message,
            data: response.data,
            token: response.token
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const response = await userService.getUserProfile(userId);
        res.status(response.code).json({
            message: response.message,
            data: response.data
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const updateData = req.body;
        const auth = req.user
        const response = await userService.updateUserProfile(userId, updateData, auth);
        res.status(response.code).json({
            message: response.message,
            data: response.data
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const DeleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const auth = req.user
        const response = await userService.DeleteUser(userId, auth);
        res.status(response.code).json({
            message: response.message
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = {
    signUpUser,
    loginUser,
    getProfile,
    updateProfile,
    DeleteUser
}
