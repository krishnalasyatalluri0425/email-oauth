import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiExternalLink,
  FiCornerUpRight,
  FiShare2,
  FiX,
} from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function TrackingDashboard() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const searchParam = query.get("search") || "";
    const filterParam = query.get("filter") || "All";
    setSearch(searchParam);
    setFilter(filterParam);
    fetchEmails(searchParam, filterParam);
  }, [location.search]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);


useEffect(() => {
  if (!showModal || !selectedEmail) return;

  const eventsInterval = setInterval(() => {
    axios.get(`http://localhost:5000/track/email/${selectedEmail}`, { withCredentials: true })
      .then((res) => {
        setEvents(res.data);
      });
  }, 5000);


  const repliesInterval = setInterval(() => {
    axios.post(`http://localhost:5000/track/poll-replies/${selectedEmail}`, {}, { withCredentials: true });
  }, 60000);

  return () => {
    clearInterval(eventsInterval);
    clearInterval(repliesInterval);
  };
}, [showModal, selectedEmail]);



  const fetchEmails = async (searchTerm = "", filterType = "All") => {
    setLoading(true);
    try {
      let url = "http://localhost:5000/email/sent";
      if (filterType === "Pending") url = "http://localhost:5000/email/pending";
      const res = await axios.get(url, { withCredentials: true });
      let data = res.data;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        data = data.filter(
          (email) =>
            email.trackingId?.toLowerCase().includes(searchLower) ||
            email.recipients.some((r) => r.toLowerCase().includes(searchLower))
        );
      }
      setEmails(data);
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/tracking?search=${search}&filter=${filter}`);
    }
  };

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    navigate(`/tracking?search=${search}&filter=${newFilter}`);
  };

const fetchTracking = async (emailId) => {
  try {

   await axios.post(`http://localhost:5000/track/poll-replies/${emailId}`, {}, { withCredentials: true });
const res = await axios.get(`http://localhost:5000/track/email/${emailId}`, { withCredentials: true });




    setSelectedEmail(emailId);
    setEvents(res.data);
    setShowModal(true);
  } catch (err) {
    console.error("Failed to fetch tracking data", err);
  }
};

  const getChartData = () => {
    const counts = { open: 0, click: 0, reply: 0, forward: 0 };
    events.forEach((e) => counts[e.eventType]++);
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Tracking Events",
          data: Object.values(counts),
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        },
      ],
    };
  };

  const renderSummaryCard = (label, count, icon, color) => (
    <div className={`flex items-center gap-4 p-4 rounded-lg shadow bg-${color}-50 text-${color}-700`}>
      <div className="text-xl">{icon}</div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-lg font-bold">{count}</div>
      </div>
    </div>
  );

  const getCounts = () => {
    const counts = { open: 0, click: 0, reply: 0, forward: 0 };
    events.forEach((e) => counts[e.eventType]++);
    return counts;
  };

  const counts = getCounts();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Email Tracking Dashboard</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="All">All Emails</option>
            <option value="Sent">Sent Emails</option>
            <option value="Pending">Pending Emails</option>
          </select>
          <input
            type="text"
            placeholder="Search by ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="border rounded px-3 py-2 text-sm w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-lg">Loading emails...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">📬 Emails</h2>
            <p className="text-sm text-gray-500 mb-2">Click on an email to view its tracking analytics.</p>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {emails.length === 0 ? (
                <p className="text-gray-500">No emails found</p>
              ) : (
                emails.map((email) => (
                  
                  <div
                    key={email._id}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50 transition"
                    onClick={() =>
                      
                       fetchTracking(email._id)}
                  >
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-gray-600">To: {email.recipients.join(", ")}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(email.sentAt || email.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📦 POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              <FiX />
            </button>
            <h2 className="text-xl font-semibold mb-4">📈 Tracking Analytics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {renderSummaryCard("Opens", counts.open, <FiEye />, "blue")}
              {renderSummaryCard("Clicks", counts.click, <FiExternalLink />, "green")}
              {renderSummaryCard("Replies", counts.reply, <FiCornerUpRight />, "yellow")}
              {renderSummaryCard("Forwards", counts.forward, <FiShare2 />, "red")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <Bar data={getChartData()} options={{ responsive: true }} />
              </div>
              <div className="h-64">
                <Pie data={getChartData()} options={{ responsive: true }} />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2">📜 Event Log</h3>
            <div className="max-h-60 overflow-y-auto">
              {events.map((event, idx) => (
                <div key={idx} className="border-b py-2 text-sm flex items-start gap-3">
                  <div className="pt-1">
                    {event.eventType === "open" && <FiEye className="text-blue-500" />}
                    {event.eventType === "click" && <FiExternalLink className="text-green-500" />}
                    {event.eventType === "reply" && <FiCornerUpRight className="text-yellow-500" />}
                    {event.eventType === "forward" && <FiShare2 className="text-red-500" />}
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">{event.eventType.toUpperCase()}</span> –{" "}
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    <p className="text-gray-600">{event.ip}</p>
                    <p className="text-gray-500 truncate">{event.userAgent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackingDashboard;
