import fs, { writeFileSync } from "fs";
import { filePath } from "../utils/dataFilePath.js";

const initializeBankFile = () => {
  if (fs.existsSync(!filePath)) {
    writeFileSync(filePath, JSON.stringify([]), "utf8");
  }
};

const readUsersFromFile = () => {
  try {
    initializeBankFile();
    const fileData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    throw new Error("Error reading from users file");
  }
};

const writeUsersToFile = (users) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(users), "utf-8");
  } catch (error) {
    console.error("Error writing to users file:", error);

    throw new Error("Error writing to users file");
  }
};

export { readUsersFromFile, writeUsersToFile };
