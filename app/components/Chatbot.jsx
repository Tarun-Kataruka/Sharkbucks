'use client';

import React, { useState, useEffect } from "react";
import "./chatbot.css";
import { template } from "../data";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const Chatbot = () => {
  const [msg, setMsg] = useState("");
  const [botResponses, setBotResponses] = useState([
    { message: "Hello, I am Alexa. How can I help you?", type: "bot" },
  ]);

  const geminiAPIKEY = process.env.NEXT_PUBLIC_GEMINI_KEY;

  useEffect(() => {
    console.log(botResponses);
  }, [botResponses]);

  const handleClick = async () => {
    if (!msg.trim()) return;
    if (!geminiAPIKEY) {
      console.error("No Gemini API key found!");
      return;
    }

    try {
      setBotResponses((prev) => [
        ...prev,
        { message: msg, type: "user" },
      ]);

      const genAI = new GoogleGenerativeAI(geminiAPIKEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 8192,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });

      const userInput = template + msg;
      const result = await chat.sendMessage(userInput);
      const response = result.response;
      const botMessage = response.text() || "I'm not sure how to respond to that.";

      setMsg(""); // Clear input field

      setBotResponses((prev) => [
        ...prev,
        { message: botMessage, type: "bot" },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
      setBotResponses((prev) => [
        ...prev,
        { message: "Sorry, something went wrong. Please try again later.", type: "bot" },
      ]);
    }
  };

  return (
    <div className="chat-container">
      <div className="content">
        {botResponses.map((item, index) => (
          <div key={index} className={item.type === "bot" ? "res" : "que"}>
            <div className={item.type === "bot" ? "msg" : "uque"}>
              <p>{item.message}</p>
            </div>
          </div>
        ))}
        <div className="enter-message">
          <input
            type="text"
            className="input"
            placeholder="Type your message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleClick();
              }
            }}
          />
          <button className="send-btn" onClick={handleClick}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
