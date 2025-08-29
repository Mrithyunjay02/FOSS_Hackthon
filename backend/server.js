const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Default API Route (Check if API is running)
app.get("/", (req, res) => {
  res.send("🚗 OpenPark Backend is Running!");
});

// ✅ MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/OpenPark", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Database Connection Error:", err));

// ✅ Booking Schema & Model
const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  slot: { type: String, required: true, unique: true },
  bookedAt: { type: Date, default: Date.now }, // ✅ Store booking time
  checkedIn: { type: Boolean, default: false },
  status: { type: String, enum: ["available", "booked", "occupied"], default: "booked" }, // ✅ Track slot status
});

const Booking = mongoose.model("Booking", bookingSchema);

// ✅ Fetch Available Slots
app.get("/api/bookings/slots", async (req, res) => {
  try {
    const slots = await Booking.find();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: "❌ Server error" });
  }
});

// ✅ Fetch Occupied Slots (New API)
app.get("/api/bookings/occupied", async (req, res) => {
  try {
    const occupiedSlots = await Booking.find({ status: "occupied" });
    res.json(occupiedSlots);
  } catch (error) {
    res.status(500).json({ error: "❌ Server error" });
  }
});

// ✅ Book a Parking Slot
app.post("/api/bookings/book", async (req, res) => {
  const { user, slot } = req.body;
  console.log("📢 New Booking Request:", { user, slot });

  if (!user || !slot) {
    return res.status(400).json({ error: "⚠️ User and slot are required!" });
  }

  try {
    const existingBooking = await Booking.findOne({ slot });
    if (existingBooking) {
      return res.status(400).json({ error: "❌ Slot already booked!" });
    }

    const newBooking = new Booking({ user, slot, status: "booked" });
    await newBooking.save();

    res.status(201).json({ success: true, message: "✅ Booking successful!" });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ error: "❌ Server error" });
  }
});

// ✅ DELETE API - Remove a Booking by Slot
app.delete("/api/bookings/delete/:slot", async (req, res) => {
  const { slot } = req.params;
  console.log(`🗑️ Deleting booking for Slot: ${slot}`);

  try {
    const deletedBooking = await Booking.findOneAndDelete({ slot });
    if (!deletedBooking) {
      return res.status(404).json({ error: "⚠️ Slot not found!" });
    }
    res.status(200).json({ success: true, message: "✅ Slot deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting slot:", error);
    res.status(500).json({ error: "❌ Server error" });
  }
});

// ✅ CHECK-IN API - Only Allowed Within 5 SECONDS of Booking
app.post("/api/bookings/checkin", async (req, res) => {
  const { slot } = req.body;
  console.log(`✅ Checking in for Slot: ${slot}`);

  try {
    const booking = await Booking.findOne({ slot });
    if (!booking) {
      return res.status(404).json({ error: "❌ Slot not found!" });
    }

    const now = new Date();
    const bookingTime = new Date(booking.bookedAt);
    const timeDifference = (now - bookingTime) / 1000; // Convert to **seconds**

    if (timeDifference > 5) {
      return res.status(400).json({ error: "❌ Check-in time expired! (5s Limit)" });
    }

    booking.checkedIn = true;
    booking.status = "occupied"; // ✅ Mark slot as occupied
    await booking.save();

    res.status(200).json({ success: true, message: `✅ Checked in for slot ${slot}!` });
  } catch (error) {
    console.error("❌ Check-in Error:", error);
    res.status(500).json({ error: "❌ Failed to check-in. Try again." });
  }
});

// ✅ AUTO RESET BOOKED SLOTS AFTER 5 SECONDS (Runs every 1 sec)
setInterval(async () => {
  try {
    const fiveSecondsAgo = new Date(Date.now() - 5 * 1000);

    // Find expired bookings
    const expiredBookings = await Booking.find({
      status: "booked",
      bookedAt: { $lt: fiveSecondsAgo },
      checkedIn: false,
    });

    if (expiredBookings.length > 0) {
      // Delete expired bookings
      const deleted = await Booking.deleteMany({
        status: "booked",
        bookedAt: { $lt: fiveSecondsAgo },
        checkedIn: false,
      });

      console.log(`🔄 Deleted ${deleted.deletedCount} expired bookings to allow rebooking.`);
    }
  } catch (error) {
    console.error("❌ Error resetting expired bookings:", error);
  }
}, 1000); // Runs **every 1 second** instead of 1 min

// ✅ Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
