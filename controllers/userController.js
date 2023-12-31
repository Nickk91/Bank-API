import STATUS_CODE from "../constants/statusCodes.js";
import { readUsersFromFile, writeUsersToFile } from "../models/bankModel.js";
import { v4 as uuidv4 } from "uuid";

// @des get all users
// @route GET / api/v1/users
// @access Public
export const getAllUsers = async (req, res, next) => {
  try {
    const users = readUsersFromFile();
    res.send(users);
  } catch (error) {
    next(error);
  }
};

// @des get single user
// @route GET / api/v1/users/:id
// @access Public
export const getUserById = async (req, res, next) => {
  try {
    const users = readUsersFromFile();
    const user = users.find((u) => u.id === req.params.id);
    if (!user) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User was not found");
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};

// @des create user
// @route POST / api/v1/users
// @access Public
export const createUser = async (req, res, next) => {
  try {
    const { userId, fName, lName } = req.body;

    if (!fName || !lName || !userId) {
      res.status(STATUS_CODE.BAD_REQUEST);
      console.log(STATUS_CODE.BAD_REQUEST);
      throw new Error("All fields (fName, lName, userId) are required");
    }

    const users = readUsersFromFile();
    if (users.some((u) => u.userId === userId)) {
      res.status(STATUS_CODE.CONFLICT);

      throw new Error("a user with the same id already exists");
    }
    const newUser = { id: uuidv4(), userId, fName, lName, cash: 0, credit: 0 };
    users.push(newUser);
    writeUsersToFile(users);
    res.status(STATUS_CODE.CREATED).send(newUser);
  } catch (error) {
    res.status(STATUS_CODE.BAD_REQUEST);
    next(error);
  }
};

// @des deposit To User
// @route PUT / api/ v1 / users /:id /deposit
// @access Public
export const depositToUser = async (req, res, next) => {
  try {
    const { id, deposit } = req.body;

    if (!id || !deposit || deposit <= 0) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please provide valid 'id' and 'deposit' fields");
    }

    console.log("try", id, deposit);

    const users = readUsersFromFile();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User was not found");
    }

    const updatedUser = { ...users[index], cash: users[index].cash + deposit };
    users[index] = updatedUser;
    writeUsersToFile(users);
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @des update credit to user
// @route PUT / api/ v1 / users /:id /update-credit
// @access Public
export const updateCreditToUser = async (req, res, next) => {
  try {
    const { id, credit } = req.body;
    console.log(credit);

    if (!id || !credit || credit <= 0) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Please provide valid 'id' and 'credit' fields");
    }

    console.log("try", id, credit);

    const users = readUsersFromFile();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User was not found");
    }

    const updatedUser = { ...users[index], credit: credit };
    users[index] = updatedUser;
    writeUsersToFile(users);
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @des transfer funds between users
// @route PUT / api/ v1 / /transfer/from/senderId/to/recipientId/amount=[value]
//
// @access Public
export const transfer = async (req, res, next) => {
  try {
    const users = readUsersFromFile();
    const indexOfSender = users.findIndex((u) => u.id === req.params.senderId);
    const indexOfRecipient = users.findIndex(
      (u) => u.id === req.params.recipientId
    );

    if (indexOfSender === -1 || indexOfRecipient === -1) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("The sender or the recipient doesn't exist.");
    }

    const senderUser = users[indexOfSender];
    const recipientUser = users[indexOfRecipient];

    const senderCash = parseInt(senderUser.cash);
    const senderCredit = parseInt(senderUser.credit);

    const recipientCash = parseInt(recipientUser.cash);

    const amount = parseInt(req.params.amount);

    if (amount > senderCash + senderCredit) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Insufficient Funds");
    }

    if (req.params.senderId === req.params.recipientId) {
      res.status(STATUS_CODE.CONFLICT);
      throw new Error("You can't make a transfer to yourself");
    }

    if (!senderUser.id || !recipientUser.id) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User was not found");
    }

    if (senderCash >= amount) {
      const updatedSenderUser = {
        ...senderUser,
        cash: senderCash - amount,
      };
      const updatedRecipientUser = {
        ...recipientUser,
        cash: recipientCash + amount,
      };

      users[indexOfSender] = updatedSenderUser;
      users[indexOfRecipient] = updatedRecipientUser;

      writeUsersToFile(users);

      const senderAndRecipient = [updatedSenderUser, updatedRecipientUser];
      res.send(senderAndRecipient);
    } else if (senderCash < amount && amount <= senderCash + senderCredit) {
      const diff = amount - senderCash;
      const updatedSenderUser = {
        ...senderUser,
        cash: 0,
        credit: senderCredit - diff,
      };
      const updatedRecipientUser = {
        ...recipientUser,
        cash: recipientCash + amount,
      };

      users[indexOfSender] = updatedSenderUser;
      users[indexOfRecipient] = updatedRecipientUser;

      writeUsersToFile(users);

      res.send([updatedSenderUser, updatedRecipientUser]);
    } else {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("Error transferring money.");
    }
  } catch (error) {
    next(error);
  }
};

// @des delete user
// @route DELETE / api/v1/users
// @access Public
export const deleteUser = async (req, res, next) => {
  try {
    const users = readUsersFromFile();
    const newUsersList = users.filter((u) => u.id !== req.params.id);

    if (newUsersList.length === users.length) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User was not found");
    }
    writeUsersToFile(newUsersList);
    res
      .status(STATUS_CODE.OK)
      .send(`User with the id of ${req.params.id} was deleted`);
  } catch (error) {
    next(error);
  }
};

// @des get single user
// @route GET api/v1/users/filterbyamount/:cashAmount
// @access Public
export const filterUserByCashAmount = async (req, res, next) => {
  try {
    console.log("try");
    const users = readUsersFromFile();
    const filteredUsers = users.filter((u) => u.cash > req.params.cashAmount);

    if (filteredUsers.length === 0) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("No users found with the specified cash amount criteria");
    }

    res.send(filteredUsers);
  } catch (error) {
    next(error);
  }
};
