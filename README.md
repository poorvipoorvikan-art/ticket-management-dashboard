# Task Management – Customer Support Ticket Management Dashboard

Task Management is a role-based Customer Support Ticket Management Dashboard built using React, TypeScript, Redux Toolkit, and RTK Query.

The application helps support teams manage tickets efficiently with role-based access control, ticket operations, filtering, sorting, pagination, and centralized API reliability handling.

## Features

### 1. Authentication and Role-Based Access Control

The application supports three roles:

- **Administrator**
  - Create, edit, assign, and delete tickets.
  - View all tickets.
  - Update ticket priority and status.

- **Support Manager**
  - View all tickets.
  - Edit and assign tickets.
  - Update ticket priority and status.

- **Support Agent**
  - View assigned tickets only.
  - Update ticket status.

Additional authentication features:

- Login and logout functionality.
- Session persistence using session storage.
- Protected routes.
- Unauthorized session handling.

> Authentication currently uses mock credentials. Real backend token authentication and refresh-token functionality are not implemented.

### 2. Ticket Management

- Create new tickets.
- Edit existing tickets.
- Delete tickets.
- Assign tickets to support agents.
- Update ticket status and priority.
- View ticket details.

### 3. Search, Filtering, and Sorting

- Search tickets.
- Filter by status.
- Filter by priority.
- Filter by assigned agent.
- Sort ticket records.
- Paginate ticket results.
- Select individual tickets.
- Select all tickets on the current page.

### 4. Bulk Operations

- Bulk status updates.
- Bulk ticket assignment.
- Bulk ticket deletion.

### 5. Reliability Enhancements

The application includes centralized API error handling and improved request reliability.

**Centralized API Error Handling**

A reusable base query handles API errors consistently.

Supported error categories:

- Network errors.
- Timeout errors.
- Client errors.
- Server errors.
- Unexpected errors.

HTTP responses are normalized into meaningful user-facing messages without exposing internal server details.

**Unauthorized Session Handling**

- HTTP 401 responses trigger unauthorized session handling.
- The current mock session is cleared.
- The protected-route flow requires the user to log in again.
- No access or refresh tokens are exposed.

**Safe Retry Mechanism**

GET requests are retried for transient failures.

Retry conditions include:

- HTTP 408
- HTTP 429
- HTTP 500
- HTTP 502
- HTTP 503
- HTTP 504
- Network failures
- Timeout failures

Retry configuration:

- Maximum retries: 2
- Initial delay: 500 ms
- Exponential delay: 1000 ms

POST, PATCH, and DELETE requests are not automatically retried to avoid duplicate operations.

Authentication and validation failures are not retried.

**Request Cancellation and Lifecycle Management**

- RTK Query manages request subscriptions and caching.
- Requests receive an AbortSignal through the fetch base query.
- Unnecessary subscriptions are cleaned up when components unmount.
- Query caching and deduplication help avoid unnecessary API calls.
- Ticket search and filtering are performed locally, avoiding API requests for every keystroke.

**Improved User Experience**

- Initial loading indicators.
- Background fetching indicators.
- API error messages.
- Network failure messages.
- Retry actions.
- Success notifications.
- Mutation loading states.
- Form validation feedback.
- Empty-state handling.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| State Management | Redux Toolkit |
| API Management | RTK Query |
| Routing | React Router |
| Forms | Formik, Yup |
| HTTP Requests | Fetch API, Axios |
| Backend | Node.js, Express |
| Database/API | JSON Server |
| Testing | Vitest, React Testing Library, MSW |
| Deployment | Vercel, Render |

## Project Structure

```text
ticket-management-dashboard/
│
├── public/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── features/
│   │   └── tickets/
│   │       ├── ticketApi.ts
│   │       ├── ticketSlice.ts
│   │       ├── ticketSelectors.ts
│   │       └── ticketThunks.test.ts
│   │
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   │   └── baseQuery.ts
│   │
│   ├── store/
│   ├── types/
│   ├── utils/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── db.json
├── server.cjs
├── .env.example
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/poorvipoorvikan-art/ticket-management-dashboard.git
```

### 2. Navigate to the project

```bash
cd ticket-management-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```env
VITE_API_URL=http://localhost:3001
```

The API URL should point to the running backend.

### 5. Start the backend

```bash
npm run server
```

### 6. Start the frontend

```bash
npm run dev
```

The Vite development server will display the local application URL in the terminal.

## Available Scripts

```bash
npm run dev
```

Starts the frontend development server.

```bash
npm run build
```

Runs TypeScript compilation and creates the production build.

```bash
npm run test:run
```

Runs the complete test suite.

```bash
npm run server
```

Starts the backend server.

## Mock Login Credentials

| Role | Email | Password |
|---|---|---|
| Administrator | admin@example.com | admin123 |
| Support Manager | manager@example.com | manager123 |
| Support Agent | agent@example.com | agent123 |

These credentials are intended for development and demonstration purposes only.

## Testing

The application uses Vitest, React Testing Library, and Mock Service Worker.

The reliability testing suite covers:

- Successful API requests.
- HTTP 400, 401, 403, 404, and 500 responses.
- Network failures.
- Automatic retry behavior.
- Unauthorized session events.
- Mutation failures.
- Optimistic update rollback.
- Ticket creation, updating, and deletion.
- Loading and error states.
- Refetch functionality.
- Permission checks.
- Form validation.

### Latest Test Results

| Metric | Result |
|---|---:|
| Test files passed | 9 |
| Total tests passed | 57 |
| Failed tests | 0 |
| TypeScript build | Passed |
| Production build | Passed |

Run the tests using:

```bash
npm run test:run
```

## Deployment

**Frontend:** Vercel

https://ticket-management-dashboard-gamma.vercel.app

**Backend:** Render

https://ticket-management-dashboard.onrender.com

Configure the frontend environment variable in the deployment platform:

```env
VITE_API_URL=https://ticket-management-dashboard.onrender.com
```

Ensure the backend is running and accessible before using the deployed frontend.

## Authentication and Future Improvements

The current application uses mock authentication and does not have a real backend token-refresh endpoint.

In a production authentication implementation, the expected flow would be:

1. Authenticate the user through the backend.
2. Receive access and refresh tokens.
3. Attach the access token to protected API requests.
4. Detect expired access tokens through HTTP 401 responses.
5. Refresh the access token through the backend.
6. Retry the original request after successful refresh.
7. Redirect to login if refresh fails.
8. Coordinate simultaneous refresh requests to prevent duplicate refresh operations.

Additional possible improvements:

- Backend JWT authentication.
- Secure refresh-token management.
- Real-time ticket updates.
- Audit logs.
- Advanced reporting and analytics.
- Pagination and filtering at the backend level.

## Author

**Poorvika**

React.js | TypeScript | Redux Toolkit | Node.js | MongoDB

GitHub: https://github.com/poorvipoorvikan-art