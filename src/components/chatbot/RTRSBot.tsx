
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ChevronRight, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  isHtml?: boolean;
}

const faqs = [
  {
    question: "What is the Jagruthi Project?",
    answer: "Jagruthi is a Smart Citizen Issue Management System that allows users to report civic issues and ensures their resolution by officers. The system includes AI-based image verification and tracking to ensure issues are properly documented and resolved."
  },
  {
    question: "How do I report an issue?",
    answer: "To report an issue, log in as a citizen, navigate to the 'Report an Issue' section, select the appropriate category, upload up to 3 images of the issue, provide a detailed description, and submit. The AI will verify your images, and your issue will be assigned to the relevant department officer."
  },
  {
    question: "How do I check my issue status?",
    answer: "Once logged in, navigate to your dashboard. There, you'll see all your reported issues with their current status ('Pending', 'In Progress', or 'Resolved'). Click on any issue to view more details and track its resolution progress."
  },
  {
    question: "Who created this project?",
    answer: "<p>The Jagruthi Project was developed by a team of four passionate individuals:</p><p>1️⃣ Tarun – Idea, Developer-1</p><p>2️⃣ Rishi – Developer-2</p><p>3️⃣ Rahul – Database Administrator</p><p>4️⃣ Shiva – UI Designer & Presenter</p><p>Together, they built me, the RTRS Bot, to guide you through the platform!</p>"
  }
];

const RTRSBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m RTRS Bot, your friendly assistant for the Jagruthi Project. How can I help you today?',
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Process user query and generate response
    setTimeout(() => {
      const response = processUserQuery(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 100).toString(),
        text: response.answer,
        sender: 'bot',
        isHtml: response.isHtml
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const processUserQuery = (query: string): { answer: string, isHtml: boolean } => {
    // Look for FAQ matches
    const lowercaseQuery = query.toLowerCase();
    
    // Check for direct matches with FAQ questions
    for (const faq of faqs) {
      if (lowercaseQuery.includes(faq.question.toLowerCase())) {
        return { answer: faq.answer, isHtml: faq.question === "Who created this project?" };
      }
    }
    
    // Keywords matching
    if (lowercaseQuery.includes("jagruthi") || lowercaseQuery.includes("project") || lowercaseQuery.includes("about")) {
      return { answer: faqs[0].answer, isHtml: false };
    } else if (lowercaseQuery.includes("report") || lowercaseQuery.includes("issue") || lowercaseQuery.includes("submit")) {
      return { answer: faqs[1].answer, isHtml: false };
    } else if (lowercaseQuery.includes("status") || lowercaseQuery.includes("track") || lowercaseQuery.includes("check")) {
      return { answer: faqs[2].answer, isHtml: false };
    } else if (lowercaseQuery.includes("created") || lowercaseQuery.includes("team") || lowercaseQuery.includes("developer") || 
              lowercaseQuery.includes("who") || lowercaseQuery.includes("made")) {
      return { answer: faqs[3].answer, isHtml: true };
    }
    
    // Default response
    return { 
      answer: "I'm trained to provide information about the Jagruthi Project and how to use the system. Could you please ask me something related to that?", 
      isHtml: false 
    };
  };

  const handleFaqClick = (faq: typeof faqs[0]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: faq.question,
      sender: 'user'
    };
    
    const botMessage: Message = {
      id: (Date.now() + 100).toString(),
      text: faq.answer,
      sender: 'bot',
      isHtml: faq.question === "Who created this project?"
    };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Chatbot toggle button with animation */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-[hsl(var(--jagruthi-blue))] to-[hsl(var(--jagruthi-green))] p-0 relative"
        >
          <Bot className="h-6 w-6 text-white" />
          {/* Animated line indicator */}
          {!isOpen && (
            <motion.div
              className="absolute -top-5 left-1/2 h-4 w-0.5 bg-primary"
              initial={{ height: 0 }}
              animate={{ 
                height: [0, 16, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          )}
        </Button>
      </div>

      {/* Chatbot window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-4 z-50 w-full max-w-sm"
          >
            <GlassmorphicCard className="flex flex-col h-[500px] max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-jagruthi-blue" />
                  <span className="font-medium">RTRS Bot</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 1 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Frequently Asked Questions:</h3>
                    <div className="space-y-2">
                      {faqs.map((faq) => (
                        <button
                          key={faq.question}
                          onClick={() => handleFaqClick(faq)}
                          className="flex w-full items-center justify-between rounded-md border p-2 text-left text-sm hover:bg-muted transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[80%] ${
                        message.sender === 'user'
                          ? 'bg-jagruthi-blue text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {message.isHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: message.text }} />
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question..."
                    className="flex-1 border rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button 
                    onClick={handleSend}
                    size="sm"
                    className="bg-jagruthi-blue hover:bg-jagruthi-blue-dark"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RTRSBot;
