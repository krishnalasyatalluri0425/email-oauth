
import { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill"; 
import "react-quill/dist/quill.snow.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ to: "", cc: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    window.open("http://localhost:5000/auth/logout", "_self");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = async () => {
    setLoading(true);
    setResponseMsg("");

    try {
      await axios.post("http://localhost:5000/email/send", form, {
        withCredentials: true,
      });

      setResponseMsg("✅ Email sent successfully!");
      setForm({ to: "", cc: "", subject: "", message: "" });
    } catch (err) {
      setResponseMsg("❌ Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-white p-8">Loading user info...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
        <p className="mb-4 text-sm">Email: {user.email}</p>

        <input
          type="text"
          name="to"
          placeholder="To (comma-separated)"
          value={form.to}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 mb-2"
        />

        {showCC && (
          <input
            type="text"
            name="cc"
            placeholder="CC (comma-separated)"
            value={form.cc}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 mb-2"
          />
        )}

        <button
          className="text-blue-400 text-sm mb-4"
          onClick={() => setShowCC(!showCC)}
        >
          {showCC ? "Hide CC" : "Add CC"}
        </button>

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 mb-2"
        />

        <ReactQuill
          value={form.message}
          onChange={(value) => setForm({ ...form, message: value })}
          theme="snow"
          className="mb-4 bg-white text-black"
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white w-full font-semibold"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Email"}
        </button>

        {responseMsg && <p className="mt-2 text-sm">{responseMsg}</p>}

        <button
          onClick={logout}
          className="mt-4 text-red-400 hover:underline text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
