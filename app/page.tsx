// ai‑consultant‑frontend/app/page.tsx
"use client";

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useEffect,
} from "react";

// Shape of the response from /consult or /deep_dive
interface ResponseData {
  answer: string;
  report?: string;
}

export default function Home() {
  // ------------------------
  // (C) Standard Consultation
  // ------------------------
  const [question, setQuestion] = useState<string>("");
  const [industry, setIndustry] = useState<string>("Automotive");
  const [role, setRole] = useState<string>("general");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch(
        "https://ai-systems-backend-2.onrender.com/consult",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_question: question,
            industry,
            role,
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ResponseData = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError("❌ Error connecting to AI system for consultation.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // (D) Deep Dive Analysis
  // ------------------------
  const [systemType, setSystemType] = useState<string>("embedded");
  const [specsFilename, setSpecsFilename] = useState<string>("");
  const [availableSpecs, setAvailableSpecs] = useState<string[]>([]);
  const [fileStatus, setFileStatus] = useState<string>("No file chosen");

  useEffect(() => {
    // load list of specs
    fetch("https://ai-systems-backend-2.onrender.com/list_specs")
      .then((r) => r.json())
      .then((list: string[]) => setAvailableSpecs(list))
      .catch((e) => console.error("list_specs error", e));
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const r1 = await fetch(
        "https://ai-systems-backend-2.onrender.com/upload_specs",
        { method: "POST", body: form }
      );
      if (!r1.ok) throw new Error(`Upload ${r1.status}`);
      const info = await r1.json();
      alert(`✅ Uploaded: ${info.filename}`);
      setSpecsFilename(info.filename);

      // refresh dropdown
      const r2 = await fetch(
        "https://ai-systems-backend-2.onrender.com/list_specs"
      );
      const list: string[] = await r2.json();
      setAvailableSpecs(list);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to upload specs file.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (fname: string) => {
    setSpecsFilename(fname);
    setFileStatus(fname ? "✅ File selected" : "No file chosen");
  };

  const handleDeepDive = async () => {
    if (!specsFilename) {
      alert("❌ Please select or upload a specs file first.");
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch(
        "https://ai-systems-backend-2.onrender.com/deep_dive",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_question: question,
            industry,
            system_type: systemType,
            specs_filename: specsFilename,
          }),
        }
      );
      if (!res.ok) throw new Error(`Deep Dive ${res.status}`);
      const data: ResponseData = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError("❌ Error running deep dive.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Render
  // ------------------------
  return (
    <div className="min-h-screen p-8 flex flex-col items-center space-y-8">
      <h1 className="text-2xl font-bold">AI Systems Engineer</h1>

      {/* Standard Consultation */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-4 border rounded space-y-4"
      >
        <h2 className="text-lg font-semibold">Standard Consultation</h2>
        <label className="block">
          <span>🔍 Question:</span>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="Enter your question..."
          />
        </label>
        <label className="block">
          <span>🏭 Industry:</span>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>Automotive</option>
            <option>Aerospace</option>
            <option>Healthcare</option>
            <option>Energy</option>
            <option>Manufacturing</option>
            <option>IT</option>
          </select>
        </label>
        <label className="block">
          <span>🧩 Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="general">General</option>
            <option value="embedded">Embedded</option>
            <option value="cloud">Cloud</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="security">Security</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "⏳ Consulting..." : "Get AI Response"}
        </button>
      </form>

      {/* Deep Dive */}
      <div className="w-full max-w-md p-4 border rounded space-y-4">
        <h2 className="text-lg font-semibold">Deep Dive Analysis</h2>
        <label className="block">
          <span>📄 Select Specs:</span>
          <select
            value={specsFilename}
            onChange={(e) => handleFileSelection(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- choose --</option>
            {availableSpecs.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm">{fileStatus}</p>
        <label className="block">
          <span>📁 Or Upload Specs File:</span>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block">
          <span>🔧 System Type:</span>
          <select
            value={systemType}
            onChange={(e) => setSystemType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="embedded">Embedded</option>
            <option value="cloud">Cloud</option>
            <option value="manufacturing">Manufacturing</option>
          </select>
        </label>
        <button
          onClick={handleDeepDive}
          disabled={loading}
          className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "⏳ Deep Diving..." : "Perform Deep Dive"}
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p>⏳ Processing...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* AI Response */}
      {response && (
        <div className="w-full max-w-md p-4 border rounded bg-gray-100">
          <h3 className="font-semibold">✅ AI Response:</h3>
          <pre className="whitespace-pre-wrap">{response.answer}</pre>
          {response.report && (
            <p className="mt-2">
              📄{" "}
              <a
                href={`https://ai-systems-backend-2.onrender.com/reports/${response.report}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download AI Report
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
