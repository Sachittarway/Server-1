const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const path = require("path");
const fs = require("fs");
const { db } = require("./db/db");
const mongoose = require("mongoose");
const Vendor = require("./models/fileUpload");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "../Database");
  },
  filename: function (req, file, cb) {
    return cb(null, `${8091}-${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage: storage,
});
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const PORT = 8091;
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.send("This is a Server 2");
});
const apiKey = "4b10ae2f8c724e32c293659abe5af74b"; // ImgBB API key
const uploadUrl = "https://api.imgbb.com/1/upload";

app.post("/upload", upload.single("profileImage"), async (req, res) => {
  try {
    // Read the image file from disk
    const imageData = fs.readFileSync(req.file.path, { encoding: "base64" });

    // Prepare the data for ImgBB
    const body = new URLSearchParams();
    body.append("key", apiKey);
    body.append("image", imageData);

    // Send the image to ImgBB using fetch
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: body,
    });

    const data = await response.json();
    if (response.ok) {
      const imageUrl = data.data.url;
      console.log("Image URL:", imageUrl);
      const vendor = new Vendor({
        imageLink: imageUrl,
        serverNumber: 8091, // Example, you can change this to any value or take it from req.body
      });

      // Save the vendor document to MongoDB
      await vendor.save();

      // Optionally, redirect or send a response
      return res.redirect("http://localhost:3000/");
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).send("Error uploading image");
  } finally {
    // Clean up the uploaded image from the server
    fs.unlinkSync(req.file.path);
  }
});

const folderPath = path.join(__dirname, "../Database");

// Route to get file names from the folder
app.get("/files", (req, res) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Unable to scan directory", error: err });
    }

    // Filter only files (excluding directories)
    const fileNames = files.filter((file) =>
      fs.lstatSync(path.join(folderPath, file)).isFile()
    );

    res.json({ files: fileNames });
  });
});

const server = () => {
  app.listen(PORT, () => {
    db();
    console.log("Server is running on port", PORT);
  });
};

server();
