const { Router } = require("express");
const Joi = require("joi");

const userController = require("../controllers/userController");
const { validate } = require("../middleware/validate");
const { isAuth } = require("../middleware/auth");

const router = Router();

const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).required(),
    password: Joi.string().min(6).max(30).required(),
  }),
});

const loginSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).required(),
    password: Joi.string().min(6).max(30).required(),
  }),
});

// GET all users
// router.get("/all", isAuth(true), userController.getAllUsers);
router.get("/all", userController.getAllUsers);
// POST create user
router.post("/create", validate(registerSchema), userController.createUser);

// POST login user
router.post("/login", validate(loginSchema), userController.login);

// PUT update user
router.put("/update/:userId", isAuth(true), userController.updateUser);

// DELETE delete user
router.delete("/delete/:userId", isAuth(true), userController.deleteUser);

module.exports = router;
