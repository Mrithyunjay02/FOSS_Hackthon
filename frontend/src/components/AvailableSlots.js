import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000"; // Change if needed

function AvailableSlots() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bookings/slots`);
        setSlots(response.data);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };

    fetchSlots();
  }, []);

  return (
    <div className="available-slots">
      {slots.length > 0 ? (
        slots.map((slot, index) => (
          <p key={index} className="slot">
            🚗 <strong>{slot.user}</strong> - Slot <strong>{slot.slot}</strong>
          </p>
        ))
      ) : (
        <p className="loading">Loading slots...</p>
      )}
    </div>
  );
}

export default AvailableSlots;
