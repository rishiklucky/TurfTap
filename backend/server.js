const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://192.168.0.105:3000",
    "https://turftap.onrender.com"
  ],
  credentials: true
}));


app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/turfs", require("./routes/turfRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));




mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
