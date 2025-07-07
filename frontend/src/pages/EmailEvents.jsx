import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function EmailEvents() {
  const { trackingId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/track/events/${trackingId}`);
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch tracking data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [trackingId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Tracking Events for ID: {trackingId}</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No tracking data found.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event, idx) => (
              <li key={idx} className="p-4 bg-gray-50 border rounded">
                <p><strong>Type:</strong> {event.eventType}</p>
                <p><strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}</p>
                <p><strong>IP:</strong> {event.ip}</p>
                <p><strong>User Agent:</strong> {event.userAgent}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EmailEvents;
