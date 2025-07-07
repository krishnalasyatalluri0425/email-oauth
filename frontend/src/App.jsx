import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    to: "",
    cc: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const login = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

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
      const payload = {
        ...form,
        to: form.to.split(",").map((email) => email.trim()),
        cc: form.cc ? form.cc.split(",").map((email) => email.trim()) : [],
      };

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-start">
      {user ? (
        <>
          <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-2">Welcome, {user.name}</h2>
            <p className="mb-4">Email: {user.email}</p>

            <div className="space-y-4">
              <input
                type="text"
                name="to"
                placeholder="To (comma-separated emails)"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={form.to}
                onChange={handleChange}
              />

              {showCC && (
                <input
                  type="text"
                  name="cc"
                  placeholder="CC (comma-separated emails)"
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={form.cc}
                  onChange={handleChange}
                />
              )}
              <button
                className="text-sm text-blue-400 hover:underline"
                onClick={() => setShowCC(!showCC)}
              >
                {showCC ? "Hide CC" : "Add CC"}
              </button>

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={form.subject}
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="Message (HTML supported)"
                rows={6}
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={form.message}
                onChange={handleChange}
              ></textarea>

              <button
                onClick={handleSend}
                className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white font-semibold"
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
        </>
      ) : (
        <button
          onClick={login}
          className="bg-green-600 px-6 py-2 rounded text-white text-lg"
        >
          Login with Google
        </button>
      )}
    </div>
  );
}

export default App;
