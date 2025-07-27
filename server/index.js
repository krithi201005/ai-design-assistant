import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment variables");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "AI Design Assistant",
  },
});

// Function to clean and extract pure HTML code

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

app.post("/generate", async (req, res) => {
  const { prompt, conversationHistory = [] } = req.body;

  // Input validation
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (prompt.length > 500) {
    return res.status(400).json({ error: "Prompt too long (max 500 characters)" });
  }

  // Build conversation context
  const systemMessage = {
  role: "system",
  content: `You are an expert UI/UX designer and frontend developer. You help users create beautiful, modern UI components with HTML and Tailwind CSS.

CRITICAL FORMATTING RULES:
1. Always format your response with TWO distinct parts:
   - EXPLANATION: Brief explanation of the design approach
   - CODE: ONLY clean HTML code with NO explanatory text whatsoever

2. The CODE section must contain ONLY HTML code - absolutely no explanations, no comments about the design, no feature descriptions, no sentences describing what the code does.

3. Format your response EXACTLY like this:
EXPLANATION: [Your explanation here]

CODE:
[Pure HTML code only - start immediately with HTML tags]

Requirements for the code:
- Use semantic HTML5 elements
- Apply modern Tailwind CSS classes
- Make it responsive (mobile-first)
- Include hover states and interactions
- Use proper accessibility attributes
- Clean, readable code structure
- ABSOLUTELY NO explanatory text in the CODE section
- ABSOLUTELY NO sentences describing features
- ABSOLUTELY NO comments about design choices

CRITICAL: The CODE section must start immediately with HTML tags (like <!DOCTYPE html>, <div>, <section>, etc.) and end with the closing HTML tag. Include NO explanatory sentences before or after the HTML code.

WRONG FORMAT:
CODE:
This is a modern login form with responsive design:
<div class="container">...</div>
This code includes semantic HTML5 elements and modern styling.

CORRECT FORMAT:
CODE:
<div class="container">...</div>`
};
  

  const messages = [systemMessage];

  // Add conversation history (last 10 messages to keep context manageable)
  const recentHistory = conversationHistory.slice(-10);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Add current user message
  messages.push({
    role: "user",
    content: prompt
  });

  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const fullResponse = response.choices[0].message.content;
        
    // Parse the response into explanation and code
    const explanationMatch = fullResponse.match(/EXPLANATION:\s*([\s\S]*?)(?=CODE:|$)/);
    const codeMatch = fullResponse.match(/CODE:\s*([\s\S]*)/);
        
    const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided";
    let code = codeMatch ? codeMatch[1].trim() : fullResponse;
    
    // Clean the code to ensure it's pure HTML
    code = cleanExtractedCode(code);
    
    // Validate that we have actual HTML
    if (!code.includes('<') || !code.includes('>')) {
      return res.status(500).json({ 
        error: "Generated code appears to be invalid. Please try again.",
        debug: { fullResponse, explanation, code }
      });
    }

    res.json({
      explanation,
      code,
      fullResponse
    });
  } catch (err) {
    console.error("❌ OpenRouter Error:", err.message);
    
    if (err.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    } else if (err.status === 401) {
      return res.status(500).json({ error: "API authentication failed." });
    }
    
    res.status(500).json({ error: "Error generating response from AI." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});