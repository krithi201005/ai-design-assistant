import React, { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateUI = async () => {
    setLoading(true);
    setResult("");
    setCopied(false);

    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const codeOnly = extractCode(data.result); // Remove ```html blocks
      setResult(codeOnly);
    } catch (error) {
      setResult("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const extractCode = (text) => {
    const match = text.match(/```(?:html)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : text;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        🧠 AI Suggestions:
      </h1>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the UI you want..."
        className="p-3 rounded border border-gray-300 w-full max-w-xl mb-4"
      />
      <button
        onClick={generateUI}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {result && (
        <div className="mt-8 w-full max-w-4xl">
          <p className="mb-2 text-lg text-gray-700">
            Below is a Tailwind CSS snippet generated from your prompt. You can
            copy just the code using the button.
          </p>

          <div className="relative bg-gray-900 text-gray-100 rounded-lg p-6 font-mono whitespace-pre overflow-x-auto shadow-lg">
            <button
              onClick={copyToClipboard}
              className={`absolute top-3 right-4 px-3 py-1 rounded text-sm font-medium transition ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <code>{result}</code>
          </div>
        </div>
      )}
    </div>
  );
}
