const { Router } = require("express");
const router = Router();

const { User } = require("../db");
const { v4: uuidv4 } = require("uuid");

const userController = require("../controllers/users");

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userById = await userController.getUserById(id);

    if (!userById)
      return res.status(404).json(`User with ID: ${id} not found!`);
    res.status(200).json(userById);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const usersFromDb = await userController.getAllUsers();

    if (!usersFromDb.length)
      return res.status(404).json("No users saved in the Database!");

    return res.status(200).json(usersFromDb);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/", async (req, res) => {
  const { username, email, password, region } = req.body;

  if (!username) return res.status(404).json("Username is missing!");
  if (!email) return res.status(404).json("Email is missing!");
  if (!password) return res.status(404).json("Password is missing!");
  if (!region) return res.status(404).json("Region is missing!");

  try {
    const userCreated = await userController.createUser(
      username,
      email,
      password,
      region
    );

    res.status(201).json(userCreated);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
