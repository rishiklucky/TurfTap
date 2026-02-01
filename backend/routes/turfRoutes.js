const express = require("express");
const Turf = require("../models/Turf");

const router = express.Router();

/**
 * ADD TURF (ADMIN)
 */
router.post("/add", async (req, res) => {
  try {
    const turf = await Turf.create(req.body);
    res.json(turf);
  } catch (err) {
    res.status(500).json({ message: "Error adding turf" });
  }
});

/**
 * GET ALL TURFS (ADMIN DASHBOARD)
 */
router.get("/all", async (req, res) => {
  try {
    const turfs = await Turf.find();
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching turfs" });
  }
});

/**
 * GET NEARBY TURFS (USER MAP)
 */
router.get("/nearby", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const turfs = await Turf.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: 5000 // 5 KM
        }
      }
    });

    res.json(turfs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching nearby turfs" });
  }
});

/**
 * UPDATE TURF (ADMIN)
 */
router.put("/update/:id", async (req, res) => {
  try {
    const { name, pricePerHour, location } = req.body;

    const updatedTurf = await Turf.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          pricePerHour,
          location: {
            type: "Point",               // 🔥 IMPORTANT
            coordinates: location.coordinates
          }
        }
      },
      { new: true }
    );

    res.json(updatedTurf);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Error updating turf" });
  }
});


/**
 * DELETE TURF (ADMIN)
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    await Turf.findByIdAndDelete(req.params.id);
    res.json({ message: "Turf deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting turf" });
  }
});

/**
 * ADD SLOTS TO A TURF
 */
router.post("/:id/slots", async (req, res) => {
  try {
    const { slots } = req.body; // ["06:00 - 07:00", "07:00 - 08:00"]

    const formattedSlots = slots.map(time => ({
      time,
      isBooked: false
    }));

    const turf = await Turf.findByIdAndUpdate(
      req.params.id,
      {
        $push: { slots: { $each: formattedSlots } }
      },
      { new: true }
    );

    res.json(turf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding slots" });
  }
});

/**
 * DELETE SLOT
 */
router.delete("/:turfId/slots/:slotId", async (req, res) => {
  try {
    await Turf.findByIdAndUpdate(req.params.turfId, {
      $pull: { slots: { _id: req.params.slotId } }
    });

    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting slot" });
  }
});
// UPDATE SLOTS (ADMIN)
router.put("/:id/slots",  async (req, res) => {
  const { slots } = req.body;

  try {
    const formattedSlots = slots.map(time => ({ time }));

    const turf = await Turf.findByIdAndUpdate(
      req.params.id,
      { slots: formattedSlots },
      { new: true }
    );

    res.json(turf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update slots" });
  }
});



module.exports = router;
