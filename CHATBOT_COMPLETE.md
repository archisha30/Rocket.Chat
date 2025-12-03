import React, { useState, useEffect } from 'react';

const InteractiveChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const addBotMessage = (text, buttons = []) => {
    setMessages((msgs) => [...msgs, { sender: 'bot', text, buttons }]);
  };

  const handleUserInput = (text) => {
    setMessages((msgs) => [...msgs, { sender: 'user', text }]);
    processInput(text.toLowerCase());
  };

  const processInput = (input) => {
    setTyping(true);

    setTimeout(() => {
      let acknowledgment = '';
      if (input.includes('api')) {
        acknowledgment = "Nice! Developers love our API and integrations! 😎";
      } else if (input.includes('help')) {
        acknowledgment = "Sure, I can help you! What do you need?";
      } else {
        acknowledgment = "I'm not sure I understand. Can you rephrase?";
      }

      addBotMessage(acknowledgment);
      setTyping(false);
    }, 1000);
  };

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.text}
            {msg.buttons && msg.buttons.length > 0 && (
              <div className="buttons">
                {msg.buttons.map((btn, i) => (
                  <button key={i} onClick={() => handleUserInput(btn)}>
                    {btn}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {typing && <div className="typing-indicator">● ● ●</div>}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            handleUserInput(input.trim());
            setInput('');
          }
        }}
      />
    </div>
  );
};

export default InteractiveChatBot;
