/**
 * ChatbotService.js
 * Service for handling chatbot interactions with AskMeAny Python backend
 */

class ChatbotService {
  constructor() {
    // Store conversation history
    this.conversationHistory = [];
    
    // Initialize with basic data
    this.environments = [
      "AWS (Database as a Service)",
      "Azure (Database as a Service)",
      "GCP (Database as a Service)",
      "IBM Cloud (Database as a Service)",
      "Oracle Cloud (Database as a Service)",
      "On-premise or IaaS"
    ];
    
    this.methodTypes = [
      "STAP",
      "External STAP",
      "Universal Connector",
      "Amazon Kinesis",
      "Azure Event Hubs"
    ];
    
    this.databaseTypes = [
      "Oracle", "SQL Server", "DB2", "MySQL", "PostgreSQL", "MongoDB",
      "Cassandra", "Redis", "Hadoop", "Teradata", "Sybase", "Informix"
    ];
    
    // Flag to determine if we should use the Python backend
    this.usePythonBackend = true;
  }

  /**
   * Generate a response based on user input
   * @param {string} input - User input
   * @returns {Promise<string>} - Bot response
   */
  async generateResponse(input) {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: input
    });
    
    let response;
    
    // Try to use the Python backend first
    if (this.usePythonBackend) {
      try {
        response = await this.generatePythonResponse(input);
      } catch (error) {
        console.error('Error using Python backend:', error);
        // Fall back to local response if Python backend fails
        response = this.generateLocalResponse(input);
      }
    } else {
      // Generate local response if Python backend is disabled
      response = this.generateLocalResponse(input);
    }
    
    // Add bot response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response
    });
    
    // Keep history to a reasonable size (last 10 messages)
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
    
    return response;
  }
  
  /**
   * Generate a response using the Python backend
   * @param {string} input - User input
   * @returns {Promise<string>} - Bot response
   */
  async generatePythonResponse(input) {
    try {
      // Use fetch API to call our server endpoint that runs the Python script
      // Port used 3002
      //Modify localhost to server ip on which you hosting, or actual url like : http://<ip address>:3002/api/ask
      const response = await fetch('http://localhost:3002/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });
      
      // Check if the response is ok
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(`Server error: ${errorData.error || 'Unknown error'}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Return the response or fall back to local response
      return data.response || this.generateLocalResponse(input);
    } catch (error) {
      console.error('Error in Python response generation:', error);
      // Fall back to local response if the API call fails
      return this.generateLocalResponse(input);
    }
  }
  
  /**
   * Generate a response locally (fallback method)
   * @param {string} input - User input
   * @returns {string} - Bot response
   */
  generateLocalResponse(input) {
    const lowerInput = input.toLowerCase();
    
    // Check for greetings
    if (this.containsAny(lowerInput, ['hello', 'hi', 'hey', 'greetings'])) {
      return "Hello! I'm the Supported Datasources Assistant. How can I help you with supported datasources today?";
    }
    
    // Check for thanks
    if (this.containsAny(lowerInput, ['thank', 'thanks', 'appreciate'])) {
      return "You're welcome! Is there anything else you'd like to know about Guardium supported datasources?";
    }
    
    // Check for goodbyes
    if (this.containsAny(lowerInput, ['bye', 'goodbye', 'see you'])) {
      return "Thank you for chatting with Supported Datasources Assistant. Have a great day!";
    }
    
    // Check for environment-related questions
    if (this.containsAny(lowerInput, ['environment', 'cloud', 'aws', 'azure', 'gcp', 'on-premise', 'on premise', 'on-prem'])) {
      return "Guardium supports various environments including AWS, Azure, GCP, IBM Cloud, Oracle Cloud, and On-premise deployments. Which environment are you interested in learning more about?";
    }
    
    // Check for method-related questions
    if (this.containsAny(lowerInput, ['method', 'stap', 'universal connector', 'uc', 'external stap', 'kinesis', 'event hubs'])) {
      return "Guardium offers several methods for monitoring datasources including STAP, External STAP, Universal Connector, Amazon Kinesis, and Azure Event Hubs. Which method would you like to know more about?";
    }
    
    // Check for database-specific questions
    for (const db of this.databaseTypes) {
      if (lowerInput.includes(db.toLowerCase())) {
        return `Guardium supports ${db} across various environments. The specific versions and features supported depend on the deployment method (STAP, External STAP, or Universal Connector) and environment. Would you like more specific information about ${db} support?`;
      }
    }
    
    // Default response
    return "I can provide information about Guardium supported datasources across different environments and methods. You can ask about specific databases, environments like AWS or Azure, or methods like STAP or Universal Connector. \nWould you like to submit RFE - <a href='https://www.ideas.ibm.com' target='_blank'>https://www.ideas.ibm.com</a>";
  }
  
  /**
   * Check if string contains any of the keywords
   * @param {string} str - The string to check
   * @param {Array} keywords - Keywords to look for
   * @returns {boolean} - True if any keyword is found
   */
  containsAny(str, keywords) {
    return keywords.some(keyword => str.includes(keyword));
  }
  
  /**
   * Check if the backend is available
   * @returns {Promise<boolean>} - True if backend is available
   */
  async isBackendAvailable() {
    try {
      // Try to ping the backend - updated port from 3001 to 3002
      const response = await fetch('http://localhost:3002/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'ping' })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Backend availability check failed:', error);
      return false;
    }
  }
}

export default new ChatbotService();

// Made with Bob
