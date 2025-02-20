const express = require("express");
const router = express.Router();

// Dummy database for now
let parkingSlots = [
    { user: "John Doe", slot: "A1" },
    { user: "Alice", slot: "B2" }
];

// API to show all booked parking slots
router.get("/slots", (req, res) => {
    res.json(parkingSlots);
});

module.exports = router;
