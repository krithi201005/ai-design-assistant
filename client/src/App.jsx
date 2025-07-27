import React, { useState, useRef, useEffect } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Template suggestions
  const templates = [
    { title: "Login Form", prompt: "Create a modern login form with email and password fields" },
    { title: "Card Component", prompt: "Design a product card with image, title, price, and buy button" },
    { title: "Navigation Bar", prompt: "Create a responsive navigation bar with logo and menu items" },
    { title: "Hero Section", prompt: "Design a hero section with background image and call-to-action" },
    { title: "Dashboard Widget", prompt: "Create a dashboard widget showing statistics with charts" },
    { title: "Contact Form", prompt: "Design a contact form with validation styling" }
  ];

  // Clean extracted code to remove any non-HTML content
  // Enhanced code cleaning function for both frontend and backend
const cleanExtractedCode = (rawCode) => {
  // Remove markdown code blocks
  let cleaned = rawCode.replace(/```html\n?/g, '').replace(/```\n?/g, '');
  
  // Split into lines for processing
  const lines = cleaned.split('\n');
  
  // Find the first line that starts with actual HTML
  const htmlStartIndex = lines.findIndex(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('<') && 
           (trimmed.includes('<!DOCTYPE') || 
            trimmed.includes('<html') || 
            trimmed.includes('<div') || 
            trimmed.includes('<section') || 
            trimmed.includes('<main') || 
            trimmed.includes('<article') || 
            trimmed.includes('<header') || 
            trimmed.includes('<nav') || 
            trimmed.includes('<form') ||
            trimmed.includes('<body') ||
            trimmed.includes('<head'));
  });
  
  // If we found HTML start, slice from there
  if (htmlStartIndex !== -1) {
    cleaned = lines.slice(htmlStartIndex).join('\n');
  }
  
  // Find the last HTML closing tag
  const htmlEndMatch = cleaned.match(/.*>(?!.*>.*[a-zA-Z])/s);
  if (htmlEndMatch) {
    const lastTagIndex = cleaned.lastIndexOf(htmlEndMatch[0]);
    if (lastTagIndex !== -1) {
      cleaned = cleaned.substring(0, lastTagIndex + htmlEndMatch[0].length);
    }
  }
  
  // More aggressive filtering - remove lines that are clearly explanatory
  const cleanedLines = cleaned.split('\n').filter(line => {
    const trimmed = line.trim();
    
    // Keep empty lines for formatting
    if (!trimmed) return true;
    
    // Keep HTML comments
    if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) return true;
    
    // Keep lines that start with HTML tags
    if (trimmed.startsWith('<') || trimmed.startsWith('</')) return true;
    
    // Keep lines that are clearly part of HTML content (between tags)
    if (trimmed.match(/^[^<]*>.*$/)) return true;
    
    // Keep indented content that's likely HTML content
    if (line.match(/^\s+[^<\w]/)) return true;
    
    // Remove lines that match common explanatory patterns
    const explanatoryPatterns = [
      /^This\s+code/i,
      /^The\s+code/i,
      /^This\s+component/i,
      /^This\s+form/i,
      /^This\s+design/i,
      /^Here\s+is/i,
      /^I\s+have/i,
      /^I've\s+created/i,
      /^You\s+can/i,
      /^Note\s*:/i,
      /^Remember\s*:/i,
      /^Important\s*:/i,
      /includes?\s+semantic/i,
      /includes?\s+modern/i,
      /includes?\s+proper/i,
      /includes?\s+hover/i,
      /features?\s+/i,
      /component/i,
      /responsive/i,
      /accessibility/i,
      /mobile.first/i,
      /tailwind\s+css/i,
      /^-\s/,
      /^\*\s/,
      /^\d+\.\s/,
      /semantic\s+html/i,
      /proper\s+accessibility/i,
      /hover\s+states/i,
      /^The\s+form/i,
      /^The\s+login/i,
      /^The\s+button/i
    ];
    
    // Check if line matches any explanatory pattern
    const isExplanatory = explanatoryPatterns.some(pattern => pattern.test(trimmed));
    
    // Additional check: if line contains HTML-related keywords but no actual HTML tags
    const hasHtmlKeywords = /\b(html|css|tailwind|responsive|semantic|accessibility|hover|mobile|component|design|styling|form|button|input)\b/i.test(trimmed);
    const hasHtmlTags = /<[^>]+>/.test(trimmed);
    
    if (hasHtmlKeywords && !hasHtmlTags && trimmed.length > 30) {
      return false; // Likely explanatory text
    }
    
    return !isExplanatory;
  });
  
  // Join back and trim
  cleaned = cleanedLines.join('\n').trim();
  
  // Final cleanup - remove any remaining explanatory text at the end
  const finalLines = cleaned.split('\n');
  let lastHtmlLineIndex = -1;
  
  // Find the last line that contains actual HTML
  for (let i = finalLines.length - 1; i >= 0; i--) {
    const line = finalLines[i].trim();
    if (line.includes('<') && line.includes('>')) {
      lastHtmlLineIndex = i;
      break;
    }
  }
  
  if (lastHtmlLineIndex !== -1) {
    cleaned = finalLines.slice(0, lastHtmlLineIndex + 1).join('\n');
  }
  
  return cleaned.trim();
};

// Example usage:
const rawCode = `Here is a modern login form component:

<div class="min-h-screen bg-gray-100 flex items-center justify-center">
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Log in to your account</h2>
    <!-- form content -->
  </div>
</div>

This code includes semantic HTML5 elements, modern Tailwind CSS classes, and proper accessibility attributes.`;

console.log(cleanExtractedCode(rawCode));
// Should output only the HTML without explanatory text
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setError("");
    
    const currentPrompt = prompt;
    setPrompt("");
    setShowTemplates(false);

    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          conversationHistory: conversation.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.type === 'user' ? msg.content : msg.explanation || msg.code
          }))
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        explanation: data.explanation,
        code: data.code,
        timestamp: new Date(),
        copied: false
      };

      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      setError("Failed to generate code. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading && prompt.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const copyToClipboard = async (messageId, code) => {
    try {
      // Clean the code more thoroughly before copying
      const cleanCode = cleanExtractedCode(code);
      await navigator.clipboard.writeText(cleanCode);
      
      setConversation(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, copied: true } : msg
        )
      );
      
      setTimeout(() => {
        setConversation(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, copied: false } : msg
          )
        );
      }, 2000);
    } catch {
      alert("Failed to copy to clipboard!");
    }
  };

  const downloadCode = (code, filename = 'component.html') => {
    const cleanCode = cleanExtractedCode(code);
    const blob = new Blob([cleanCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearConversation = () => {
    setConversation([]);
    setPrompt("");
    setError("");
  };

  const useTemplate = (template) => {
    setPrompt(template.prompt);
    setShowTemplates(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Design Assistant</h1>
                <p className="text-gray-600 text-sm">Transform your ideas into beautiful UI components</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {conversation.length > 0 && (
                <div className="text-sm text-gray-500 hidden sm:block">
                  {conversation.filter(msg => msg.type === 'assistant').length} components generated
                </div>
              )}
              {conversation.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {conversation.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AI Design Assistant</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Start by describing your UI idea below or choose from our templates. 
                You can ask follow-up questions and iterate on designs throughout our conversation.
              </p>

              {/* Quick Start Templates */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => useTemplate(template)}
                      className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                        {template.title}
                      </h4>
                      <p className="text-gray-600 text-sm">{template.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Modern Design</h3>
                  <p className="text-gray-600 text-sm">Beautiful, responsive components with Tailwind CSS</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Iterate & Refine</h3>
                  <p className="text-gray-600 text-sm">Request changes and improvements easily</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Export & Use</h3>
                  <p className="text-gray-600 text-sm">Copy, download, or preview your components</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {conversation.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'user' ? (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl max-w-2xl shadow-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{message.content}</p>
                          <p className="text-xs text-white text-opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-4xl space-y-4">
                      {/* Explanation */}
                      {message.explanation && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                              {message.explanation}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Code Canvas */}
                      {message.code && (
                        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                          <div className="flex items-center justify-between bg-gray-800 px-6 py-4 border-b border-gray-700">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                <span className="text-gray-300 font-semibold">Generated Code</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(message.id, message.code)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  message.copied
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                {message.copied ? "Copied!" : "Copy"}
                              </button>
                              <button
                                onClick={() => downloadCode(message.code)}
                                className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-medium"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => {
                                  const blob = new Blob([message.code], { type: 'text/html' });
                                  const url = URL.createObjectURL(blob);
                                  window.open(url, '_blank');
                                }}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
                              >
                                Preview
                              </button>
                            </div>
                          </div>
                          <div className="p-6 overflow-auto max-h-96">
                            <pre className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                              <code>{message.code}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">AI is thinking...</p>
                        <p className="text-gray-500 text-sm">Generating your UI design</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={conversation.length === 0 ? "Describe your UI idea or choose a template above..." : "Ask for modifications or describe a new component..."}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            <p className="text-xs text-gray-500">
              {conversation.length > 0 && `${conversation.length} messages`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;