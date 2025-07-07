// frontend/src/LandingPage.jsx
import { useEffect, useState } from "react";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-center text-white px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-8xl font-bold mb-6">Email Tracker Pro</h1>
        <p className="text-7xl mb-8">
          Authenticate with Gmail, compose emails, and track engagement in real time.
        </p>
        <a
          href="http://localhost:5000/auth/google"
          className="bg-white text-7xl text-blue-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-200"
        >
          Login with Google
        </a>
      </div>
    </div>
  );
}

export default LandingPage;
