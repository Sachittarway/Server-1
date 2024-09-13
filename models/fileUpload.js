const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  imageLink: {
    type: String,
    required: true,
  },
  serverNumber: {
    type: Number,
    required: true,
  },
});

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
