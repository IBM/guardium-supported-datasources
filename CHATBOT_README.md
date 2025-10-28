# Guardium Supported Datasources Chatbot

This chatbot provides an interactive interface to query information about Guardium supported datasources. It integrates a React frontend with a Python backend that processes natural language questions and provides detailed answers.

## Features

- Interactive chat interface
- Natural language question processing
- Comprehensive database of Guardium supported datasources
- Information about database versions, environments, and connector types
- Fallback to basic responses when the Python backend is unavailable

## Architecture

The chatbot consists of three main components:

1. **React Frontend**: The user interface built with React
2. **Express API Server**: A Node.js server that handles API requests
3. **Python Backend**: The AskMeAny.py script that processes questions and generates responses

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python 3.6 or higher
- npm (v6 or higher)
- pip (v19 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd guardium-supported-datasources
   ```

2. Install dependencies:
   ```
   npm run install-deps
   ```
   This will install both Node.js and Python dependencies.

### Running the Application

You can start both the React frontend and the API server with a single command:

```
npm run start-all
```

This will:
- Start the Express API server on port 3001
- Start the React development server on port 3000

Alternatively, you can start them separately:

```
# Start only the API server
npm run start-api

# Start only the React frontend
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. The chatbot interface will be visible on the page
3. Type your question about Guardium supported datasources in the input field
4. Press Enter or click the Send button to submit your question
5. The chatbot will process your question and display the response

## Example Questions

- "Which databases are supported by IBM Guardium?"
- "What versions of Oracle are compatible with Guardium?"
- "Does Guardium support PostgreSQL 14?"
- "Can I monitor Azure SQL Database with Guardium?"
- "Is MongoDB supported by Universal Connector?"
- "What are the new features in Guardium 12.2?"

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly
2. Check that both the API server and React frontend are running
3. Look for error messages in the console
4. Verify that the Python backend can access the JSON data files

If the Python backend is unavailable, the chatbot will fall back to basic responses.

## License

This project is licensed under the terms specified in the repository's LICENSE file.