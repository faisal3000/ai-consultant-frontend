// ai-consultant-frontend/app/auth/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regMessage, setRegMessage] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message);
      setRegMessage(`✅ ${data.message}`);
    } catch (err: any) {
      setRegMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold">Sign Up</h1>
      <label>
        Email:
        <input
          type="email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          className="block w-full p-2 border"
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
          className="block w-full p-2 border"
        />
      </label>
      <button
        onClick={handleRegister}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Register
      </button>
      {regMessage && <p className="mt-2">{regMessage}</p>}

      <p className="mt-6 text-sm">
        Already have an account? <Link href="/admin">Admin sign‑in</Link>
      </p>
    </div>
  );
}
