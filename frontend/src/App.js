import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000"; // Backend URL

function App() {
  const [slots, setSlots] = useState([]);
  const [user, setUser] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [timers, setTimers] = useState({}); // Track countdown timers

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = {};
        Object.keys(prevTimers).forEach((slot) => {
          if (prevTimers[slot] > 0) {
            updatedTimers[slot] = prevTimers[slot] - 1;
          } else {
            updatedTimers[slot] = 0; // Ensure timer never goes negative
          }
        });
        return updatedTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bookings/slots`);
      setSlots(response.data);

      const newTimers = {};
      response.data.forEach((slot) => {
        if (slot.status === "booked") {
          const timeLeft = Math.max(
            5 - Math.floor((new Date() - new Date(slot.bookedAt)) / 1000),
            0
          );
          newTimers[slot.slot] = timeLeft;
        }
      });
      setTimers(newTimers);
    } catch (error) {
      console.error("❌ Error fetching slots:", error);
    }
  };

  const handleBooking = async () => {
    if (!user || !slot) {
      setMessage("⚠️ Please enter your name and a slot number!");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/bookings/book`, { user, slot });
      setMessage("✅ Booking successful!");
      setUser("");
      setSlot("");
      fetchSlots();
    } catch (error) {
      console.error("❌ Booking error:", error.response?.data || error.message);
      setMessage("❌ Booking failed. Try again.");
    }
  };

  const handleDelete = async (slot) => {
    if (!window.confirm(`🗑️ Are you sure you want to delete Slot ${slot}?`)) return;

    try {
      const response = await axios.delete(`${API_URL}/api/bookings/delete/${slot.trim().toUpperCase()}`);

      if (response.status === 200) {
        setSlots((prevSlots) => prevSlots.filter((s) => s.slot !== slot));
        setMessage(`✅ Slot ${slot} deleted successfully!`);
      } else {
        setMessage("❌ Failed to delete slot.");
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      setMessage("❌ Failed to delete slot. Try again.");
    }
  };

  const handleCheckIn = async (slot) => {
    try {
      const response = await axios.post(`${API_URL}/api/bookings/checkin`, { slot });

      if (response.status === 200) {
        setMessage(`✅ Successfully checked in for slot ${slot}!`);
        setSlots((prevSlots) =>
          prevSlots.map((s) =>
            s.slot === slot ? { ...s, checkedIn: true, status: "occupied" } : s
          )
        );
      } else {
        setMessage("❌ Check-in failed. Try again.");
      }
    } catch (error) {
      console.error("❌ Check-in error:", error);
      setMessage("❌ Check-in failed. Try again.");
    }
  };

  return (
    <div className={`App ${darkMode ? "dark-mode" : ""}`}>
      <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h1>🚗 OpenPark - Parking Slot Booking</h1>
      {message && <p className="status-message">{message}</p>}

      <div className="booking-container">
        <h2>📅 Book a Parking Slot</h2>
        <input type="text" placeholder="Enter Name" value={user} onChange={(e) => setUser(e.target.value)} />
        <input type="text" placeholder="Enter Slot (A1, B2, etc.)" value={slot} onChange={(e) => setSlot(e.target.value)} />
        <button onClick={handleBooking} className="book-btn">✅ Book Now</button>
      </div>

      <div className="parking-slots">
        <h2>🅿 Available Parking Slots</h2>
        {slots.map((slotData, index) => (
          <div key={index} className={`parking-slot 
            ${slotData.status === "occupied" ? "occupied" : ""}
            ${timers[slotData.slot] <= 2 && slotData.status === "booked" ? "warning" : ""}
          `}>
            🚗 <strong>{slotData.user}</strong> - Slot <strong>{slotData.slot}</strong>

            {/* Countdown Timer */}
            {slotData.status === "booked" && (
              <p className={`timer ${timers[slotData.slot] <= 2 ? "blink-big" : ""}`}>
                {timers[slotData.slot] > 0 ? `⏳ Time Left: ${timers[slotData.slot]}s` : "❌ Time Expired!"}
              </p>
            )}

            {/* Check-In Button */}
            {!slotData.checkedIn && slotData.status === "booked" && timers[slotData.slot] > 0 && (
              <button onClick={() => handleCheckIn(slotData.slot)} className="checkin-btn">✅ Check-In</button>
            )}

            {/* Delete Button */}
            <button onClick={() => handleDelete(slotData.slot)} className="delete-btn">🗑️ Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
