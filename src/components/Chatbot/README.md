# IBM Guardium Supported Datasources Assistant

A professional chatbot component for the IBM Guardium Supported Datasources website that provides an interactive interface to query information about supported datasources.

## Architecture

The chatbot consists of three main components:

1. **React Frontend**: The user interface built with React (Chatbot.js, Chatbot.scss)
2. **Express API Server**: A Node.js server (askMeAnyServer.js) that handles API requests
3. **Python Backend**: The ChatbotBridge.py script that processes questions using AskMeAny.py

## Features

- Interactive chatbot interface with IBM Carbon Design System styling
- Natural language question processing about Guardium supported datasources
- Comprehensive database of supported datasources, versions, environments, and connector types
- Quick reply buttons for common questions
- Predefined questions organized by categories
- Fallback to basic responses when the Python backend is unavailable
- Responsive design for desktop and mobile devices

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python 3.6 or higher
- npm (v6 or higher)
- pip (v19 or higher)

### Installation

1. Make sure all the chatbot files are in place:
   - `src/components/Chatbot/Chatbot.js`
   - `src/components/Chatbot/Chatbot.scss`
   - `src/components/Chatbot/ChatbotService.js`
   - Updated `src/App.js` with the Chatbot import and component

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   node src/server/askMeAnyServer.js
   ```
   This will start the Express API server on port 3002.

2. In a separate terminal, start the React development server:
   ```
   npm start
   ```
   This will start the React frontend on port 3000.

3. Open your browser and navigate to http://localhost:3000
   - The chatbot interface will be visible on the page
   - You can interact with it by typing questions or using the predefined questions

## Example Questions

- "Which databases are supported by IBM Guardium?"
- "What versions of Oracle are compatible with Guardium?"
- "Does Guardium support PostgreSQL 14?"
- "Can I monitor Azure SQL Database with Guardium?"
- "Is MongoDB supported by Universal Connector?"
- "What are the new features in Guardium 12.2?"

## Troubleshooting

### Backend Connection Issues

If you see the message "I'm currently operating in offline mode. Some advanced features may not be available", it means the chatbot cannot connect to the backend server. Make sure:

1. The backend server is running at http://localhost:3002
2. There are no CORS issues (the backend should have CORS enabled)
3. Your network allows the connection

### Python Backend Issues

If the Python backend is not responding correctly:

1. Make sure Python 3.6 or higher is installed
2. Check that all required Python packages are installed
3. Verify that the AskMeAny.py script is in the correct location
4. Check the console for any Python error messages

## Building for Production

1. Build the React frontend:
   ```
   npm run build
   ```
   This will create a production-ready build in the `build` directory.

2. Set up the backend server to run in production mode:
   ```
   NODE_ENV=production node src/server/askMeAnyServer.js
   ```

## Customization

### Styling

The chatbot styling is defined in `Chatbot.scss` and follows IBM's Carbon Design System color palette. You can modify the following variables to change the appearance:

```scss
$ibm-blue: #0f62fe;      // Primary blue
$ibm-blue-60: #0353e9;   // Hover blue
$ibm-gray-10: #f4f4f4;   // Background gray
$ibm-gray-20: #e0e0e0;   // Border gray
$ibm-gray-70: #525252;   // Text gray
$ibm-gray-100: #161616;  // Dark text
```

### Predefined Questions

You can modify the predefined questions in the `predefinedQuestions` array in `Chatbot.js` to add, remove, or update the questions available to users.

## Future Enhancement Opportunities

1. **Advanced NLP**: Integrate with IBM Watson for more sophisticated natural language processing
2. **Personalization**: Add user preferences and history tracking
3. **Rich Media**: Support for images, links, and formatted text in responses
4. **Analytics**: Track common questions to improve the knowledge base