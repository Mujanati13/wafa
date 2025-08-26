import User from "../models/userModel.js";
import bcrypt from "bcrypt";


export const AuthController = {
 
  login: (req, res) => {
    res.status(200).json({
      message: "Login successful",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
    });
  },


  register: async (req, res) => {

    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email,
        password: hashPassword,
      });
      res.status(201).json({
        message: "User registered successfully",
        user: {
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }
  },

  /**
   * Handles user logout.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  logout: (req, res) => {
    if (!req.user) {
      res.status(401).json({
        message: "User not authenticated",
      });
    }
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          message: "Logout failed",
        });
      }
      res.status(200).json({
        message: "Logout successful",
      });
    });
  },
  /**
  * Handles user logout.
  * @param {Request} req - Express request object
  * @param {Response} res - Express response object
  */
  checkAuth: (req, res) => {
    if (req.isAuthenticated()) {
      return res.status(200).json({
        loggedIn: true,
      });
    }
    return res.status(200).json({
      loggedIn: false,
    });
  },
};
