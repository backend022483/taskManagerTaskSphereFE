# TaskSphere API Client

A React application that provides a user-friendly interface for testing and interacting with API endpoints using axios.

## Features

- **API Testing Interface**: Test predefined endpoints or create custom requests
- **Multiple HTTP Methods**: Support for GET, POST, PUT, DELETE operations
- **Real-time Response Display**: View API responses in formatted JSON
- **Error Handling**: Comprehensive error display and handling
- **Authentication Support**: Automatic Bearer token handling from localStorage
- **Modern UI**: Clean, responsive design with custom CSS

## Configuration

- **Base URL**: `http://127.0.0.1:8000`
- **Authentication**: Bearer token (stored in localStorage as `authToken`)
- **Timeout**: 10 seconds

## Available Endpoints

The application includes predefined endpoints for common operations:
- Health Check (`/health`)
- Status (`/status`)
- Users (`/users`)
- Tasks (`/tasks`)
- Projects (`/projects`)

## Usage

1. Start the application: `npm start`
2. Open http://localhost:3000 in your browser
3. Use the **API Testing** tab to test predefined endpoints
4. Use the **Custom Request** tab to create custom API calls
5. View responses in the formatted JSON display

## Components

### API Service (`src/services/api.js`)
- Axios instance with base configuration
- Request/response interceptors
- Authentication handling
- Error handling

### React Components
- `Button`: Reusable button component with multiple variants
- `Input`: Form input with validation and error display
- `Card`: Container component with optional title
- `Loading`: Animated loading indicator

### Custom Hooks
- `useApi`: Hook for GET requests
- `useApiMutation`: Hook for POST/PUT/DELETE operations

## Customization

To add new endpoints, update the `endpoints` object in `src/services/api.js`:

```javascript
export const endpoints = {
  // Add your new endpoints here
  newEndpoint: '/api/new-endpoint',
};
```

## Development

- Built with Create React App
- Uses axios for HTTP requests
- Custom CSS for styling (no Tailwind CSS dependency)
- React hooks for state management

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will be available at http://localhost:3000
