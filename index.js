const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const { db } = require("./db/db");
const mongoose = require("mongoose");
const Vendor = require("./models/fileUpload");

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: false }));
app.use(cors());

const PORT = 8090;
const apiKey = "4b10ae2f8c724e32c293659abe5af74b"; // ImgBB API key
const uploadUrl = "https://api.imgbb.com/1/upload";

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.send("This is a Server 1");
});

// Route to upload image
app.post("/upload", upload.single("profileImage"), async (req, res) => {
  try {
    // Convert the buffer to a base64 string
    const imageData = req.file.buffer.toString("base64");

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

      // Create a new vendor record with the image URL
      const vendor = new Vendor({
        imageLink: imageUrl,
        serverNumber: 8090, // You can customize this value as needed
      });

      // Save the vendor record to MongoDB
      await vendor.save();

      // Optionally, redirect or send a response
      return res.redirect("http://localhost:3000/");
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).send("Error uploading image");
  }
});

// Route to get all files (from the database in this case)
app.get("/files", async (req, res) => {
  try {
    const files = await Vendor.find({}, { imageLink: 1, _id: 0 });
    res.json({ files: files.map((file) => file.imageLink) });
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).send("Error fetching files");
  }
});

// Start the server and connect to the database
const server = () => {
  app.listen(PORT, () => {
    db();
    console.log("Server is running on port", PORT);
  });
};

server();
