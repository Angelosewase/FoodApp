const _ = require("lodash");
const { createTokens } = require("../utils/createTokens");
const UserModel = require("../models/user.model");
const argon2 = require("argon2");

const userController = {
  getAllUsers: async (_req, res) => {
    try {
      const users = await UserModel.find();
      res.json({ users });
    } catch (error) {
      console.error("Error getting all users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  createUser: async (req, res) => {
    try {
      const bodyParams = _.pick(req.body, ["password", "name"]);

      const userInDb = await UserModel.findOne({ name: bodyParams.name });

      if (userInDb) {
        return res.json({ error: "User already exists" });
      }

      const hashedPassword = await argon2.hash(bodyParams.password);

      const user = new UserModel({
        ...bodyParams,
        password: hashedPassword,
      });

      await user.save();

      const tokens = createTokens(user);

      return res.json({ ...tokens });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  login: async (req, res) => {
    try {
      const bodyParams = _.pick(req.body, ["password", "name"]);

      const user = await UserModel.findOne({ name: bodyParams.name });

      if (!user) {
        return res.json({ error: "Invalid credentials" });
      }

      const isValid = await argon2.verify(user.password, bodyParams.password);

      if (!isValid) {
        return res.json({ error: "Invalid credentials" });
      }

      const tokens = createTokens(user);

      return res.json({ ...tokens });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, password } = req.body;

      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user data
      user.name = name;
      user.password = password;
      await user.save();

      return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;

      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete user
      await user.remove();

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = userController;
