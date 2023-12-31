import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  depositToUser,
  updateCreditToUser,
  transfer,
  filterUserByCashAmount,
} from "../controllers/userController.js";

const router = express.Router();

//Route to get all users
router.get("/", getAllUsers);

//Route to get single user by ID
router.get("/:id", getUserById);

//Route to create a new account
router.post("/", createUser);

//Route to make a deposit to an existing user

router.put("/:id/deposit", depositToUser);

//Route to update credit to an existing user

router.put("/:id/update-credit", updateCreditToUser);

//Route to make a transfer money between users

router.put("/transfer/from/:senderId/to/:recipientId/amount/:amount", transfer);

//Route to delete user
router.delete("/:id", deleteUser);

// @des filter users by cash amount
// @route GET / api/v1/users/filterbyamount
// @access Public
router.get("/users/filterbyamount/:cashAmount", filterUserByCashAmount);

export default router;
