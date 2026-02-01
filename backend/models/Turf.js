const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  time: String, // "06:00 - 07:00"
});

const turfSchema = new mongoose.Schema({
  name: String,
  pricePerHour: Number,
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [Number]
  },
  image: {
  type: String,
  default: "https://i.pinimg.com/736x/f2/1f/bc/f21fbcf2a18af50ef59f444558f15d33.jpg"
},

  slots: [slotSchema] // 🔥 SLOT MANAGEMENT
});

turfSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Turf", turfSchema);
