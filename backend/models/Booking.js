const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  turfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Turf"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  date: String,          // "2026-02-01"
  slotTime: String,     // "06:00 - 07:00"
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
  type: String,
  enum: ["booked", "cancelled"],
  default: "booked"
}

});

module.exports = mongoose.model("Booking", bookingSchema);
