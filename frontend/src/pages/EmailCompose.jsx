import { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function EmailComposer() {
  const [form, setForm] = useState({
    to: "",
    cc: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [responseMsg, setResponseMsg] = useState({ text: "", isError: false });
  const [emailProvider, setEmailProvider] = useState("Gmail");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = async () => {
    const { to, cc, subject, message } = form;

    if (!to || !subject || !message) {
      setResponseMsg({ text: "Please fill in all required fields.", isError: true });
      return;
    }

    setLoading(true);
    setResponseMsg({ text: "", isError: false });

    try {
      const payload = {
        to: to.split(",").map((email) => email.trim()),
        cc: cc ? cc.split(",").map((email) => email.trim()) : [],
        subject,
        message,
        trackLinks: true,
      };

      await axios.post("http://localhost:5000/email/send", payload, {
        withCredentials: true,
      });

      setForm({ to: "", cc: "", subject: "", message: "" });
      setShowCC(false);
      setResponseMsg({ text: "✅ Email sent successfully!", isError: false });
    } catch (err) {
      console.error("Email send error:", err.message);
      setResponseMsg({ text: "❌ Failed to send email.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const clearAllFields = () => {
    setForm({ to: "", cc: "", subject: "", message: "" });
    setShowCC(false);
    setResponseMsg({ text: "", isError: false });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-lg">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Compose Email</h2>
            <div className="flex items-center space-x-3">
              <span className="text-white text-lg">Provider:</span>
              <select
                value={emailProvider}
                onChange={(e) => setEmailProvider(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-md px-3 py-1.5 text-white text-lg focus:outline-none"
              >
                <option value="Gmail">Gmail</option>
                <option value="Outlook">Outlook</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Form */}
        <div className="p-6 space-y-6">
          {/* To Field */}
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-2">To*</label>
            <input
              type="text"
              name="to"
              placeholder="e.g. john@example.com, jane@abc.com"
              className="w-full px-4 py-2.5 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.to}
              onChange={handleChange}
            />
          </div>

          {/* CC Field */}
          <div>
            <button
              className="text-lg text-blue-600 hover:text-blue-800 flex items-center mb-2"
              onClick={() => setShowCC(!showCC)}
              type="button"
            >
              {showCC ? "Hide CC" : "Add CC"}
            </button>
            {showCC && (
              <input
                type="text"
                name="cc"
                placeholder="cc@example.com"
                className="w-full px-4 py-2.5 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.cc}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-2">Subject*</label>
            <input
              type="text"
              name="subject"
              placeholder="Email subject"
              className="w-full px-4 py-2.5 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.subject}
              onChange={handleChange}
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-2">Message*</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={form.message}
                onChange={(value) => setForm({ ...form, message: value })}
                placeholder="Write your message here..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                className="text-lg"
              />
            </div>
          </div>

          {/* Status & Buttons */}
          <div className="flex justify-between items-center pt-6">
            {responseMsg.text && (
              <p className={`text-lg ${responseMsg.isError ? "text-red-600" : "text-green-600"}`}>
                {responseMsg.text}
              </p>
            )}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={clearAllFields}
                className="px-5 py-2.5 text-lg text-gray-600 hover:text-black rounded-lg"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className={`px-8 py-2.5 text-lg rounded-lg text-white font-medium ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailComposer;