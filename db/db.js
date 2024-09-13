const mongoose = require("mongoose");

const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(
      "mongodb+srv://SachitTarway:Sachit123@cluster0.zub5p1z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Database Connected successfully");
  } catch (error) {
    console.error("Database Connection failed:", error);
  }
};

module.exports = { db };
