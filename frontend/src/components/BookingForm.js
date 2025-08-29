import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaCar } from "react-icons/fa";

const API_URL = "http://localhost:5000"; // Change if needed

function BookingForm() {
  const [user, setUser] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");

  const handleBooking = async () => {
    if (!user || !slot) {
      setMessage("⚠️ Please enter your name and a slot number!");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/bookings/book`, {
        user,
        slot,
      });
      setMessage("✅ Booking successful!");
      setUser("");
      setSlot("");
    } catch (error) {
      setMessage("❌ Booking failed. Try again.");
    }
  };

  return (
    <div className="booking-form">
      <div className="input-group">
        <FaUser className="icon" />
        <input
          type="text"
          placeholder="Enter Name"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
      </div>

      <div className="input-group">
        <FaCar className="icon" />
        <input
          type="text"
          placeholder="Enter Slot (A1, B2, etc.)"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        />
      </div>

      <button className="book-btn" onClick={handleBooking}>
        🚗 Book Now
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default BookingForm;
