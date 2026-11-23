# Customer Support Ticket Management Dashboard – Architecture

## 1. Project Overview

The Customer Support Ticket Management Dashboard is a role-based web application designed to manage customer support tickets.

It allows administrators, support managers and support agents to manage tickets, track progress, monitor application activity and receive real-time ticket updates.

## 2. Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- RTK Query
- React Router
- Formik and Yup
- WebSocket API

### Backend
- Node.js
- JSON Server
- Express-compatible middleware
- ws (WebSocket library)

### Testing
- Vitest
- React Testing Library
- Mock Service Worker (MSW)

### Deployment
- Frontend: Vercel
- Backend: Render

## 3. High-Level Architecture

```text
                 User
                  |
                  v
          React Application
                  |
       -----------------------
       |          |          |
       v          v          v
   Components   Hooks    React Router
       |          |          |
       -----------------------
                  |
                  v
          Redux Toolkit Store
                  |
          ----------------
          |              |
          v              v
       RTK Query    Notification Slice
          |              |
          v              v
       REST API      WebSocket Listener
          |              |
          v              v
       Node.js       WebSocket Server
          |
          v
       JSON Database
```

## 4. Frontend Architecture

The frontend follows a component-based architecture.

### Components
Reusable UI components handle:
- Ticket listing and management
- Ticket creation and editing
- Dashboard statistics
- Search, filtering and pagination
- Notifications
- Connection status

### Custom Hooks
Custom hooks separate reusable application logic:
- `useAuth` – authentication context.
- `usePermissions` – role-based permission checks.
- `useTickets` – ticket data operations.
- `useDebounce` – delays search execution.
- `useToggle` – reusable boolean state management.
- `useDashboardTickets` – ticket filtering, sorting and pagination.
- `useWebSocket` – WebSocket connection and event handling.

### State Management

Redux Toolkit manages global application state.

RTK Query handles:
- Fetching tickets
- Fetching individual tickets
- Creating tickets
- Updating tickets
- Deleting tickets
- API caching and cache invalidation

The notification slice manages notification data, unread counts and WebSocket connection status.

## 5. Authentication and Authorization

The application uses a mock authentication mechanism for demonstration purposes.

Three user roles are supported:

| Role | Permissions |
|---|---|
| Administrator | Create, view, edit, assign, manage priority and delete tickets |
| Support Manager | View, edit, assign and manage ticket priority and status |
| Support Agent | View assigned tickets and update ticket status |

Protected routes restrict access to authenticated users.

The `usePermissions` hook centralizes role-based permission checks.

**Note:** This implementation is a frontend demonstration of RBAC, not production-grade server-side authorization.

## 6. Backend Architecture

The backend uses Node.js with JSON Server.

The REST API supports:

| Method | Endpoint | Operation |
|---|---|---|
| GET | `/tickets` | Retrieve all tickets |
| GET | `/tickets/:id` | Retrieve a ticket |
| POST | `/tickets` | Create a ticket |
| PATCH | `/tickets/:id` | Update a ticket |
| DELETE | `/tickets/:id` | Delete a ticket |

The ticket data is stored in `db.json`.

## 7. Real-Time Communication

The application uses WebSocket communication through the `ws` library.

WebSocket endpoint:

`/ws`

The backend broadcasts events when ticket operations occur.

Supported event types:

- `TICKET_CREATED`
- `TICKET_UPDATED`
- `TICKET_STATUS_CHANGED`
- `TICKET_ASSIGNED`
- `TICKET_DELETED`

Each event contains:
- `eventId`
- `type`
- `timestamp`
- `payload`

The frontend WebSocket listener processes incoming events, synchronizes ticket data and creates notifications.

The WebSocket service also handles:
- Connection status
- Connection errors
- Automatic reconnection with exponential backoff
- Malformed messages
- Duplicate event prevention
- Connection cleanup

## 8. Notification Management

The notification system uses Redux Toolkit.

It supports:
- New ticket notifications
- Ticket update notifications
- Assignment notifications
- Status change notifications
- Unread notification count
- Marking individual notifications as read
- Marking all notifications as read
- Clearing notifications
- Notification timestamps

## 9. Error Handling and Monitoring

The application includes centralized error handling and monitoring.

### Error Handling
- React Error Boundary
- API error handling
- Authentication error handling
- Authorization error handling
- WebSocket error handling
- Retry handling for eligible API failures

### Logging
The centralized logger supports:
- Debug
- Info
- Warning
- Error

Logs include timestamps and contextual information while avoiding sensitive data.

### API Monitoring
API monitoring tracks:
- Endpoint
- HTTP method
- Response status
- Request duration
- Failed requests
- Network errors

## 10. Testing Strategy

Vitest and React Testing Library are used to validate application functionality.

Testing covers:
- Role-based permissions
- Protected routes
- Ticket components
- Form validation
- API operations
- Error handling
- Redux logic
- WebSocket functionality

## 11. Deployment Architecture

### Frontend
The React application is deployed using Vercel.

### Backend
The Node.js backend is deployed using Render.

The frontend communicates with the backend through the configured `VITE_API_URL` environment variable.

The WebSocket connection uses the same backend host with the `/ws` endpoint.

## 12. Current Limitations and Production Considerations

The current application is a demonstration project and requires additional backend infrastructure before production use.

1. Authentication is mocked and should be replaced with secure server-side authentication.
2. Authorization must be enforced by the backend, not only by frontend role checks.
3. JSON Server and `db.json` are suitable for development and demonstrations, not concurrent production workloads.
4. WebSocket connections do not currently provide authenticated user authorization.
5. WebSocket events are broadcast to connected clients without role-based filtering.
6. Events are not persisted, so disconnected clients can miss updates.
7. Multi-instance deployments require shared event distribution, such as Redis Pub/Sub.
8. Production use requires a database with transaction support and proper data validation.
9. Rate limiting, input sanitization, secure secrets management and audit logging should be implemented.
10. Production monitoring should include centralized logs, metrics and error tracking.

## 13. Conclusion

The project demonstrates a modern React and TypeScript application architecture with role-based access control, centralized state management, REST API integration, real-time communication, error handling, monitoring and automated testing.

It provides a foundation for developing a scalable customer support management platform.