# Task Management – Customer Support Ticket Management Dashboard

Task Management is a role-based Customer Support Ticket Management Dashboard built using React, TypeScript, Redux Toolkit, and RTK Query.

The application helps support teams manage customer tickets efficiently through role-based access control, ticket operations, search, filtering, sorting, pagination, and centralized API reliability and security handling.

## Features

### 1. Authentication and Role-Based Access Control (RBAC)

The application supports three roles:

**Administrator**
- Create, edit, assign, and delete tickets.
- View all tickets.
- Update ticket priority and status.
- Access administrator-only functionality.

**Support Manager**
- View all tickets.
- Create and edit tickets.
- Assign tickets to support agents.
- Update ticket priority and status.
- Cannot delete tickets or manage users.

**Support Agent**
- View assigned tickets only.
- Create tickets.
- Newly created tickets are automatically assigned to the logged-in agent.
- Update ticket status.
- Cannot edit, delete, or assign tickets.

Additional authentication features:
- Login and logout functionality.
- Mock session persistence using session storage.
- Protected routes.
- Unauthorized page handling.
- Requested destination preservation after login.
- Unauthorized session handling for HTTP 401 responses.

**Authentication limitation:** The current application uses mock credentials and frontend session management. Real backend authentication, JWT access tokens, refresh tokens, and production session cookies are not implemented.

### 2. Ticket Management

- Create new tickets.
- Edit existing tickets.
- Delete tickets.
- Assign tickets to support agents.
- Update ticket status and priority.
- View ticket details.
- Restrict ticket operations according to user permissions.
- Automatically assign tickets created by Support Agents to their own accounts.

### 3. Search, Filtering, and Sorting

- Search tickets.
- Filter by status.
- Filter by priority.
- Filter by assigned agent.
- Sort ticket records.
- Paginate ticket results.
- Select individual tickets.
- Select multiple tickets for bulk operations.

### 4. Bulk Operations

- Bulk status updates.
- Bulk ticket assignment.
- Bulk ticket deletion.
- Permission-based restrictions for bulk operations.

### 5. Reliability Enhancements

The application includes centralized API error handling and improved request reliability.

#### Centralized API Error Handling

A reusable RTK Query base query handles API errors consistently.

Supported error categories:
- Network errors.
- Timeout errors.
- Client errors.
- Server errors.
- Unexpected errors.

HTTP responses are normalized into meaningful user-facing messages without exposing internal server details.

#### Unauthorized Session Handling

- HTTP 401 responses trigger unauthorized session handling.
- The current mock session is cleared.
- The user is redirected to the login flow.
- HTTP 403 responses are handled as permission errors without automatically logging out the user.
- No access or refresh tokens are currently implemented.

#### Safe Retry Mechanism

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
- Second retry delay: 1000 ms

POST, PATCH, and DELETE requests are not automatically retried to avoid duplicate operations.

Authentication and validation failures are not retried.

#### Request Cancellation and Lifecycle Management

- RTK Query manages request subscriptions and caching.
- Requests receive an AbortSignal through the fetch base query.
- Unnecessary subscriptions are cleaned up when components unmount.
- Query caching and deduplication help avoid unnecessary API calls.
- Ticket search and filtering are performed locally, avoiding API requests for every keystroke.

#### Improved User Experience

- Initial loading indicators.
- Background fetching indicators.
- API error messages.
- Network failure messages.
- Retry actions.
- Success notifications.
- Mutation loading states.
- Form validation feedback.
- Empty-state handling.

### 6. Security Enhancements

#### Role-Based Permission Checking

A reusable permission-checking system controls frontend access to ticket operations.

| Feature | Administrator | Support Manager | Support Agent |
|---|---|---|---|
| View tickets | All | All | Assigned only |
| Create tickets | Yes | Yes | Yes |
| Edit tickets | Yes | Yes | No |
| Assign tickets | Yes | Yes | No |
| Delete tickets | Yes | No | No |
| Update priority | Yes | Yes | No |
| Update status | Yes | Yes | Yes |
| Manage users | Yes | No | No |

Permissions are checked in the UI and in the relevant dashboard operation handlers.

**Important:** Frontend permission checks are not a substitute for backend authorization. A production backend must independently authenticate users and validate their permissions on every protected API request.

#### Protected Routes

- Dashboard routes require authentication.
- Unauthenticated users are redirected to login.
- Requested destinations are preserved during login redirection.
- Authenticated users without the required role are redirected to an Unauthorized page.
- Loading state is handled while checking the existing mock session.

#### Secure Ticket Operations

- Ticket deletion is restricted to Administrators.
- Ticket assignment is restricted to Administrators and Support Managers.
- Ticket editing is restricted to Administrators and Support Managers.
- Support Agents can update ticket status.
- Dashboard handlers independently check permissions before performing restricted actions.
- HTTP 401 and 403 responses receive different handling.
- Support Agents can create tickets that are automatically assigned to themselves.

#### Form Validation and Input Security

Formik and Yup are used to validate ticket form input.

Validation includes:
- Required field validation.
- Minimum and maximum input lengths.
- Email format validation.
- Priority and status value validation.
- Rejection of unexpected fields.
- Trimming of string input.

#### Cross-Site Scripting (XSS) Prevention

- React JSX text interpolation is used to render user-provided content.
- React automatically escapes text rendered through normal JSX expressions.
- User-provided ticket content is not rendered using `dangerouslySetInnerHTML`.
- Tests verify that malicious script and image input are rendered as plain text rather than executable HTML elements.

#### Environment and Token Security

- The frontend API URL is configured through `VITE_API_URL`.
- Vite environment variables prefixed with `VITE_` are exposed to the browser.
- API secrets, passwords, private keys, and database credentials must not be stored in frontend environment variables.
- The current mock session is stored in session storage.
- Session storage is accessible to JavaScript and is therefore vulnerable if an XSS vulnerability exists.
- Mock credentials are intended only for development and demonstration.

**Production recommendations:**
- Use backend-managed authentication.
- Prefer appropriately configured HttpOnly, Secure, and SameSite cookies for session or refresh-token management.
- Implement CSRF protection when using cookie-based authentication.
- Enforce authorization on the backend.
- Use HTTPS.
- Avoid logging credentials, tokens, or other sensitive information.
- Configure an appropriate Content Security Policy (CSP).

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
│   ├── routes/
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

### 1. Clone the Repository

```bash
git clone https://github.com/poorvipoorvikan-art/ticket-management-dashboard.git
```

### 2. Navigate to the Project

```bash
cd ticket-management-dashboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_API_URL=http://localhost:3001
```

The API URL should point to the running backend.

Do not add secrets or private credentials to frontend environment variables.

### 5. Start the Backend

```bash
npm run server
```

### 6. Start the Frontend

Open another terminal and run:

```bash
npm run dev
```

The Vite development server will display the local application URL in the terminal.

## Available Scripts

### Start Frontend

```bash
npm run dev
```

Starts the frontend development server.

### Production Build

```bash
npm run build
```

Runs TypeScript compilation and creates the production build.

### Run Tests

```bash
npm run test:run
```

Runs the complete test suite.

### Start Backend

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

They are not suitable for production authentication.

## Testing

The application uses Vitest, React Testing Library, and Mock Service Worker.

The test suite covers:

**Reliability Testing**
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

**Security Testing**
- Permission checks for all supported roles.
- Protected route behavior.
- Unauthenticated dashboard access.
- Unauthorized role access.
- Ticket deletion restrictions.
- Ticket assignment restrictions.
- API 401 and 403 handling.
- Form validation.
- Unexpected input rejection.
- Malicious HTML input rendering.

### Latest Test Results

| Metric | Result |
|---|---:|
| Test files passed | 11 |
| Total tests passed | 76 |
| Failed tests | 0 |
| TypeScript compilation | Passed |
| Production build | Passed |

These results reflect the latest verified test run.

Run the complete test suite using:

```bash
npm run test:run
```

Run the production build using:

```bash
npm run build
```

## Deployment

**Frontend – Vercel**

https://ticket-management-dashboard-gamma.vercel.app

**Backend – Render**

https://ticket-management-dashboard.onrender.com

Configure the frontend environment variable in the deployment platform:

```env
VITE_API_URL=https://ticket-management-dashboard.onrender.com
```

Ensure the backend is running and accessible before using the deployed frontend.

The Vercel project is connected to GitHub for deployment when changes are pushed to the connected branch.

## Authentication and Future Improvements

The current application uses mock authentication and does not have a real backend login endpoint, JWT implementation, or token-refresh endpoint.

The expected production authentication flow would be:

1. Authenticate the user through the backend.
2. Validate credentials on the server.
3. Establish an authenticated session using an appropriately secured cookie.
4. Verify authentication and permissions on protected API requests.
5. Handle expired sessions through the backend authentication flow.
6. Redirect to login when the session is no longer valid.
7. Protect cookie-based authentication against CSRF.
8. Enforce role-based authorization on the backend.

Additional possible improvements:

- Backend JWT authentication.
- Secure session and refresh-token management.
- Backend-enforced RBAC.
- Real-time ticket updates.
- Audit logs.
- Advanced reporting and analytics.
- Backend pagination and filtering.
- Content Security Policy configuration.
- Security monitoring and audit trails.

## Author

**Poorvika**

React.js | TypeScript | Redux Toolkit | Node.js | MongoDB

GitHub: https://github.com/poorvipoorvikan-art