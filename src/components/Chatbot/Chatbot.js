import { useEffect, useRef, useState } from 'react';
import './Chatbot.scss';
import ChatbotService from './ChatbotService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(true); // Set to true to make the chatbot open by default
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm the Supported Datasources Assistant. How can I help you with supported datasources today?",
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'questions'
  const [backendAvailable, setBackendAvailable] = useState(true); // Track backend availability
  
  // Initialize all sections to be collapsed by default
  const [expandedSections, setExpandedSections] = useState({
    1: false, 2: false, 3: false, 4: false, 5: false,
    6: false, 7: false, 8: false, 9: false, 10: false
  });
  
  const messagesEndRef = useRef(null);
  
  // Pre-defined questions for quick access
  const predefinedQuestions = [
    // 1. General Support Questions
    "1. General Support Questions",
    "Which databases are supported by IBM Guardium?",
    "Is MongoDB supported by Guardium?",
    "Does Guardium support PostgreSQL?",
    "What versions of Oracle are compatible with Guardium?",
    "Can Guardium monitor cloud databases?",
    "Is Microsoft SQL Server supported by Guardium?",
    "Does Guardium work with NoSQL databases?",
    "Which IBM databases are supported by Guardium?",
    "Can Guardium monitor Cassandra databases?",
    "Does Guardium support Redis?",
    
    // 2. Support Method Questions (UC vs STAP)
    "2. Support Method Questions (UC vs STAP)",
    "What's the difference between UC and STAP in Guardium?",
    "Is MongoDB supported by Universal Connector?",
    "Can I use STAP with PostgreSQL?",
    "Which databases are supported by both UC and STAP?",
    "Is Couchbase only supported through Universal Connector?",
    "Which method should I use for monitoring Oracle – UC or STAP?",
    "Does Guardium support Amazon RDS through Universal Connector?",
    "Can I use STAP with cloud databases?",
    "Which support method has better performance for MySQL?",
    "Is Universal Connector available for all Guardium versions?",
    
    // 3. Version-Specific Questions
    "3. Version-Specific Questions",
    "Which versions of MongoDB are supported by Guardium?",
    "Does Guardium support PostgreSQL 14?",
    "Is Oracle 19c compatible with Guardium?",
    "What's the latest version of SQL Server supported by Guardium?",
    "Does Guardium support MySQL 8.0?",
    "Which versions of DB2 work with Guardium?",
    "Is Cassandra 4.0 supported?",
    "Does Guardium support the latest version of MariaDB?",
    "Which versions of MongoDB are supported by STAP?",
    "Is PostgreSQL 15 compatible with Universal Connector?",
    
    // 4. Cloud-Specific Questions
    "4. Cloud-Specific Questions",
    "Does Guardium support AWS RDS?",
    "Can I monitor Azure SQL Database with Guardium?",
    "Is Google Cloud SQL supported by Guardium?",
    "How do I set up Guardium with Amazon Aurora?",
    "Does Guardium work with MongoDB Atlas?",
    "Can Guardium monitor Snowflake?",
    "Is Amazon Redshift supported by Guardium?",
    "Does Guardium support Azure Cosmos DB?",
    "Can I use Guardium with Google BigQuery?",
    "How do I configure Guardium for AWS DynamoDB?",
    
    // 5. Configuration Questions
    "5. Configuration Questions",
    "How do I set up Guardium for MongoDB?",
    "What are the prerequisites for monitoring PostgreSQL with Guardium?",
    "Do I need to install agents for Universal Connector?",
    "How do I configure STAP for Oracle?",
    "What permissions are required for Guardium to monitor SQL Server?",
    "How do I troubleshoot connection issues between Guardium and MySQL?",
    "What network ports need to be open for Guardium monitoring?",
    "How do I verify that Guardium is correctly monitoring my database?",
    "Can I monitor multiple database instances with a single Guardium setup?",
    "What's the performance impact of using STAP with PostgreSQL?",
    
    // 6. Feature-Specific Questions
    "6. Feature-Specific Questions",
    "Can Guardium monitor stored procedure executions in SQL Server?",
    "Does Guardium capture DDL operations in Oracle?",
    "Can I see who accessed specific tables in MongoDB?",
    "Does Guardium track failed login attempts to PostgreSQL?",
    "Can Guardium monitor database schema changes?",
    "Does Guardium capture query performance metrics?",
    "Can I see which users executed specific queries?",
    "Does Guardium monitor database administrator activities?",
    "Can Guardium detect unusual access patterns?",
    "Does Guardium support auditing of data masking operations?",
    
    // 7. Compliance Questions
    "7. Compliance Questions",
    "How does Guardium help with GDPR compliance for MongoDB?",
    "Can Guardium help meet PCI DSS requirements for Oracle databases?",
    "Does Guardium provide HIPAA compliance reports for SQL Server?",
    "How can I use Guardium for SOX compliance with PostgreSQL?",
    "Does Guardium have pre-built compliance reports?",
    "Can Guardium track sensitive data access across different databases?",
    "How does Guardium help with data privacy regulations?",
    "Can Guardium detect potential compliance violations in real time?",
    "Does Guardium provide an audit trail for compliance purposes?",
    "How can I customize Guardium reports for specific compliance requirements?",
    
    // 8. Integration Questions
    "8. Integration Questions",
    "Can Guardium integrate with IBM QRadar?",
    "Does Guardium work with Splunk?",
    "Can I integrate Guardium with ServiceNow?",
    "Does Guardium support integration with Microsoft Azure Sentinel?",
    "Can Guardium alerts be sent to PagerDuty?",
    "How do I integrate Guardium with my existing SIEM solution?",
    "Does Guardium support REST API for custom integrations?",
    "Can Guardium data be exported to Elasticsearch?",
    "Does Guardium integrate with identity management systems?",
    "Can I use Guardium with IBM Cloud Pak for Security?",
    
    // 9. Troubleshooting Questions
    "9. Troubleshooting Questions",
    "Why isn't Guardium capturing all queries from my MongoDB instance?",
    "How do I resolve connection errors between Guardium and PostgreSQL?",
    "What should I do if STAP installation fails?",
    "Why am I seeing delays in audit data appearing in Guardium?",
    "How do I troubleshoot missing audit events?",
    "What logs should I check if Universal Connector isn't working?",
    "How do I resolve performance issues caused by Guardium monitoring?",
    "What are common causes of Guardium agent disconnections?",
    "How do I update Guardium agents without downtime?",
    "Why might certain database activities not appear in Guardium reports?",
    
    // 10. Comparison Questions
    "10. Comparison Questions",
    "How does Guardium compare to Oracle Audit Vault?",
    "What advantages does Guardium have over native PostgreSQL auditing?",
    "Should I use Guardium or MongoDB's built-in auditing?",
    "How does Guardium compare to Microsoft SQL Server Audit?",
    "What are the benefits of Guardium over database-native audit solutions?",
    "Is Guardium more comprehensive than AWS CloudTrail for RDS monitoring?",
    "How does Guardium compare to open-source database monitoring tools?",
    "What unique features does Guardium offer compared to competitors?",
    "Is Guardium more suitable for large enterprises or small businesses?",
    "How does Guardium's pricing compare to other database security solutions?"
  ];
  
  // Check backend availability when component mounts
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isAvailable = await ChatbotService.isBackendAvailable();
        setBackendAvailable(isAvailable);
        
        if (!isAvailable) {
          setMessages(prev => [...prev, {
            text: "Warning: I'm currently operating in offline mode. Some advanced features may not be available.",
            sender: 'bot'
          }]);
        }
      } catch (error) {
        console.error('Error checking backend availability:', error);
        setBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, []);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'chat') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Switch to chat tab if not already there
    setActiveTab('chat');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the message and generate a response
    processMessage(inputValue);
  };

  const processMessage = async (message) => {
    try {
      // Use the ChatbotService to generate a response
      const response = await ChatbotService.generateResponse(message);
      
      // Add bot response after typing delay
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
      }, 500); // Reduced typing delay for better UX
    } catch (error) {
      console.error('Error processing message:', error);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          text: "I'm sorry, I encountered an error. Please try again.", 
          sender: 'bot' 
        }]);
      }, 500);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionNumber) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionNumber]: !prev[sectionNumber]
    }));
  };

  const handleQuickReply = (reply) => {
    // Skip section headers (they start with a number followed by a dot)
    if (/^\d+\./.test(reply)) {
      // Extract section number and toggle expansion
      const sectionNumber = parseInt(reply.match(/^(\d+)\./)[1]);
      toggleSection(sectionNumber);
      return;
    }
    
    // Add user message
    const userMessage = { text: reply, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    // Switch to chat tab
    setActiveTab('chat');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the message and generate a response
    processMessage(reply);
  };

  // Generate quick reply buttons based on the last bot message
  const generateQuickReplies = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('environment') || lowerMessage.includes('interested in')) {
      return (
        <>
          <button type="button" className="quick-reply-button" onClick={() => handleQuickReply("Tell me about AWS datasources")}>AWS</button>
          <button type="button" className="quick-reply-button" onClick={() => handleQuickReply("Tell me about Azure datasources")}>Azure</button>
          <button type="button" className="quick-reply-button" onClick={() => handleQuickReply("Tell me about GCP datasources")}>GCP</button>
          <button type="button" className="quick-reply-button" onClick={() => handleQuickReply("Tell me about on-premise datasources")}>On-premise</button>
        </>
      );
    }
    
    if (lowerMessage.includes('method')) {
      return (
        <>
          <button type="button" className="quick-reply-button" onClick={() => handleQuickReply("Tell me about STAP")}>STAP</button>
          <button type="button" className="quick-reply-button" onClick={() => handleQuickReply("Tell me about Universal Connector")}>Universal Connector</button>
          <button type="button" className="quick-reply-button" onClick={() => handleQuickReply("Tell me about External STAP")}>External STAP</button>
        </>
      );
    }
    
    return null;
  };

  // Reset the conversation
  const resetConversation = () => {
    setMessages([
      { 
        text: "Hello! I'm the Supported Datasources Assistant. How can I help you with supported datasources today?",
        sender: 'bot' 
      }
    ]);
    
    // If backend is not available, add the warning message
    if (!backendAvailable) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Warning: I'm currently operating in offline mode. Some advanced features may not be available.",
          sender: 'bot'
        }]);
      }, 100);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot toggle button */}
      <button type="button" className="chatbot-button" onClick={toggleChatbot}>
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path fill="currentColor" d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path fill="currentColor" d="M17.74 30L16 29l4-7h6a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h9v2H6a4 4 0 01-4-4V8a4 4 0 014-4h20a4 4 0 014 4v12a4 4 0 01-4 4h-4.84z"/>
            <path fill="currentColor" d="M8 10h16v2H8zm0 6h10v2H8z"/>
          </svg>
        )}
      </button>
      
      {/* Chatbot window */}
      <div className={`chatbot-window ${isOpen ? '' : 'hidden'}`}>
        {/* Chatbot header */}
        <div className="chatbot-header">
          <h3>Supported Datasource Assistant</h3>
          <button type="button" className="close-button" onClick={toggleChatbot}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path fill="currentColor" d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"/>
            </svg>
          </button>
        </div>
        
        {/* Chatbot tabs */}
        <div className="chatbot-tabs">
          <button 
            type="button" 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button 
            type="button" 
            className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Pre-defined Questions
          </button>
        </div>
        
        {/* Chat tab content */}
        {activeTab === 'chat' && (
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {/* Render content with clickable links */}
                <div
                  className="formatted-content"
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    textAlign: 'left'
                  }}
                >
                  {message.text.split(/<a href='(.*?)'.*?>(.*?)<\/a>/g).map((part, i) => {
                    // Even indices are regular text, odd indices are URLs
                    if (i % 3 === 0) {
                      return part;
                    } else if (i % 3 === 1) {
                      // This is the URL (href)
                      const url = part;
                      const text = message.text.split(/<a href='(.*?)'.*?>(.*?)<\/a>/g)[i + 1];
                      return (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          {text}
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
                {message.sender === 'bot' && index === messages.length - 1 && (
                  <div className="quick-replies">
                    {generateQuickReplies(message.text)}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Pre-defined questions tab content */}
        {activeTab === 'questions' && (
          <div className="predefined-questions-tab">
            <p className="questions-intro">
              Click on a category to expand it, then select a question to get an instant answer:
            </p>
            <div className="questions-list">
              {predefinedQuestions.map((question, index) => {
                // Check if this is a section header
                const isSectionHeader = /^\d+\./.test(question);
                
                if (isSectionHeader) {
                  // Extract section number
                  const sectionNumber = parseInt(question.match(/^(\d+)\./)[1]);
                  const isExpanded = expandedSections[sectionNumber] === true; // Default to collapsed
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`predefined-question-button section-header ${isExpanded ? 'expanded' : 'collapsed'}`}
                      onClick={() => handleQuickReply(question)}
                    >
                      {question} {isExpanded ? '−' : '+'}
                    </button>
                  );
                } else {
                  // Find which section this question belongs to
                  let sectionNumber = 1;
                  for (let i = index; i >= 0; i--) {
                    if (/^\d+\./.test(predefinedQuestions[i])) {
                      sectionNumber = parseInt(predefinedQuestions[i].match(/^(\d+)\./)[1]);
                      break;
                    }
                  }
                  
                  // Check if this section is expanded
                  const isExpanded = expandedSections[sectionNumber] === true; // Default to collapsed
                  
                  // Only render if section is expanded
                  return isExpanded ? (
                    <button
                      key={index}
                      type="button"
                      className="predefined-question-button"
                      onClick={() => handleQuickReply(question)}
                    >
                      {question}
                    </button>
                  ) : null;
                }
              })}
            </div>
          </div>
        )}
        
        {/* Chatbot input */}
        <div className="chatbot-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button type="button" onClick={sendMessage} disabled={!inputValue.trim()}>
            Send
          </button>
          <button type="button" className="reset-button" onClick={resetConversation} title="Reset conversation">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16">
              <path fill="currentColor" d="M26 18A10 10 0 1 1 16 8h6.18l-3.58 3.59L20 13l6-6-6-6-1.4 1.41L22.19 6H16a12 12 0 1 0 12 12Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

// Made with Bob
