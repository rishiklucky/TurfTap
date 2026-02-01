const express = require("express");
const Turf = require("../models/Turf");
const Booking = require("../models/Booking");
const { protect, userOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * BOOK A SLOT (USER)
 */
router.post("/book", protect,userOnly, async (req, res) => {
  const { turfId, date, slotId } = req.body;
  const userId = req.user.id;

  try {
    const turf = await Turf.findById(turfId);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    const slot = turf.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // ✅ CHECK IF SLOT IS ALREADY BOOKED FOR THIS DATE
    const existingBooking = await Booking.findOne({
      turfId,
      date,
      slotTime: slot.time
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Slot already booked for this date" });
    }

    const booking = await Booking.create({
      turfId,
      userId,
      date,
      slotTime: slot.time
    });

    res.json({ message: "Booking successful", booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
});

/**
 * GET LOGGED-IN USER BOOKINGS
 */
router.get("/my", protect,userOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id
    }).populate("turfId", "name pricePerHour")
     .sort({ date: -1, createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

/**
 * CANCEL BOOKING & FREE SLOT
 */
router.delete("/cancel/:bookingId", protect, userOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Not found" });

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // free slot (already correct)
    await Turf.updateOne(
      {
        _id: booking.turfId,
        "slots.time": booking.slotTime
      },
      { $set: { "slots.$.isBooked": false } }
    );

    // ✅ MARK AS CANCELLED
    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed" });
  }
});




/**
 * ADMIN: VIEW ALL BOOKINGS
 */
router.get("/all", protect, async (req, res) => {
  try {
    // allow only admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const bookings = await Booking.find()
      .populate("turfId", "name pricePerHour")
      .populate("userId", "name email")
      .sort({  date: -1, createdAt: -1  });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

/**
 * GET BOOKED SLOTS FOR A DATE
 */
router.get("/booked-slots", protect, async (req, res) => {
  const { turfId, date } = req.query;

  const bookings = await Booking.find({ turfId, date });
  const bookedSlots = bookings.map(b => b.slotTime);

  res.json(bookedSlots);
});

// TURF-WISE BOOKING STATS (ADMIN)
router.get("/stats/turf-wise", protect,  async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $lookup: {
          from: "turves",
          localField: "turfId",
          foreignField: "_id",
          as: "turf"
        }
      },
      { $unwind: "$turf" },

      {
        $group: {
          _id: "$turf._id",
          turfName: { $first: "$turf.name" },
          pricePerHour: { $first: "$turf.pricePerHour" },

          totalBookings: { $sum: 1 },

          activeBookings: {
            $sum: {
              $cond: [{ $eq: ["$status", "booked"] }, 1, 0]
            }
          },

          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
            }
          }
        }
      },

      {
        $addFields: {
          revenue: {
            $multiply: ["$activeBookings", "$pricePerHour"]
          }
        }
      },

      { $sort: { revenue: -1 } }
    ]);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});






module.exports = router;
