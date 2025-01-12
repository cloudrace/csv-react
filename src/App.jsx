// src/App.jsx
import { useState } from 'react';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [csvData, setCsvData] = useState(null);
  const [setGeminiResponse] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleFileUpload = (file, question) => {
    const reader = new FileReader();

    reader.onload = e => {
      const contents = e.target.result;
      // Call askGemini with the question and file contents
      askGemini(question, contents);
    };

    reader.readAsText(file);
  };

  const askGemini = async (question, contents) => {
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // Replace with your actual API key
    const GEMINI_MODEL_ID = "gemini-1.5-flash"; // Replace with desired model ID

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_ID });
    
    try {
      const prompt = `CSV data: ${contents}\nQuestion: ${question}`;

      // Update chat history with user's question
      setChatHistory([...chatHistory, { role: 'user', content: question }]);

      const result = await model.generateContent(prompt);

      // Update chat history with Gemini's response
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: question },
        { role: 'assistant', content: result.response.text() },
      ]);

    } catch (error) {      
      console.error("Error interacting with Gemini:", error);
      setGeminiResponse("Error communicating with Gemini. Please try again later.");
    } 
  };


  return (
    <div className="bg-black text-blue-300 min-h-screen font-['DM Sans']">
      <header className="text-center py-4 text-3xl font-bold">
        Ask against CSV
      </header>
      <main className="container mx-auto px-4">
        <div className="upload-container my-4 rounded-lg border border-blue-500 p-4 text-center"> 
          <input
            type="file"
            accept=".csv"
            onChange={event => setCsvData(event.target.files[0])}
            className="text-blue-300 file:bg-blue-500 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:hover:bg-blue-600 inline-block" 
          />
        </div>
        <div className="chat-window h-[500px] overflow-y-auto p-4 rounded-lg border border-blue-500">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`chat-message my-2 rounded-lg p-3 text-white ${
                message.role === 'user' ? 'bg-blue-500 mr-auto ml-4 max-w-[75%]' : 'bg-gray-700 ml-auto mr-4 max-w-[75%]'
              }`}
            >
              <span className="font-bold">{message.role === 'user' ? 'You:' : 'Gemini:'}</span>
              <p className="ml-2">{message.content}</p>
            </div>
          ))}
        </div>
        <div className="input-area flex items-center mt-4">
          <input
            type="text"
            placeholder="Enter your question"
            value={userQuestion}
            onChange={e => setUserQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && csvData && userQuestion) {
                handleFileUpload(csvData, userQuestion);
                setUserQuestion('');
              }
            }}
            className="border border-blue-500 rounded-lg px-3 py-2 flex-grow text-black"
          />
          <button
            onClick={() => {
              if (csvData && userQuestion) {
                handleFileUpload(csvData, userQuestion);
                setUserQuestion('');
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ml-2"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
