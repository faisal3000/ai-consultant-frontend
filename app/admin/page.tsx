// ai-consultant-frontend/app/admin/page.tsx
"use client";

import { useState } from "react";

interface PendingUser {
  id: number;
  email: string;
}

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [adminMessage, setAdminMessage] = useState<string>("");

  // Fetch the list of users awaiting approval
  const fetchPending = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/list_pending_users`
      );
      if (!res.ok) throw new Error("Failed to fetch pending users");
      const data: PendingUser[] = await res.json();
      setPendingUsers(data);
      setAdminMessage("");
    } catch (err: any) {
      console.error(err);
      setAdminMessage(`❌ ${err.message}`);
    }
  };

  // Approve or deny a user
  const handleApprove = async (id: number, approve: boolean) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/approve_user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: id, approve }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message);
      setAdminMessage(`✅ ${data.message}`);
      setPendingUsers((u) => u.filter((x) => x.id !== id));
    } catch (err: any) {
      console.error(err);
      setAdminMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <button
        onClick={fetchPending}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        List Pending Users
      </button>

      {adminMessage && <p className="mt-2">{adminMessage}</p>}

      <ul className="space-y-3 mt-4">
        {pendingUsers.map((u) => (
          <li
            key={u.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span>{u.email}</span>
            <div className="space-x-2">
              <button
                onClick={() => handleApprove(u.id, true)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleApprove(u.id, false)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Deny
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
