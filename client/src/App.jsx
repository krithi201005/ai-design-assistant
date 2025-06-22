import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      console.error("Frontend Fetch Error:", err.message);
      setResponse("❌ Could not fetch response from server.");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">🎨 AI Design Assistant</h1>

      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg">
        <label className="block mb-2 text-lg font-medium text-gray-700">
          Describe your UI idea:
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A login page for mobile banking"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg w-full"
        >
          Generate UI Suggestion
        </button>
      </div>

      {response && (
        <div className="w-full max-w-xl mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧠 AI Suggestion:</h2>
          <div className="relative">
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
            >
              Copy
            </button>
            <SyntaxHighlighter language="javascript" style={oneDark}>
              {response}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
