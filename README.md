# Ticket Management Dashboard

A responsive, role-based Ticket Management Dashboard built using React, TypeScript, Redux Toolkit Query, and Tailwind CSS. The application helps support teams manage tickets efficiently with advanced filtering, assignment, status updates, and bulk management capabilities.

## Live Demo

- **Vercel:** https://ticket-management-dashboard-gamma.vercel.app
- **AWS CloudFront:** https://d3gh61wkvdsdve.cloudfront.net
- **Backend API:** https://ticket-management-dashboard.onrender.com

## Features

### Authentication & Authorization
- Role-based authentication.
- Protected routes.
- Role-based access control (RBAC).
- Three user roles: Administrator, Support Manager, and Support Agent.

### Ticket Management
- Create new tickets.
- View ticket details.
- Edit existing tickets.
- Delete tickets.
- Assign tickets to support agents.
- Update ticket status and priority.

### Advanced Ticket Assignment & Bulk Management
- Select individual tickets.
- Select all tickets on the current page.
- Perform bulk status updates.
- Assign multiple tickets to a support agent.
- Delete multiple tickets.
- Clear selected tickets.
- Permission-based bulk actions.

### Search, Filtering & Sorting
- Search tickets.
- Filter by ticket status.
- Filter by priority.
- Filter by assigned support agent.
- Sort tickets.
- Sidebar-based ticket filtering.

### Dashboard & User Experience
- Responsive dashboard layout.
- Sidebar navigation.
- Ticket statistics.
- Pagination.
- Loading and error states.
- Confirmation dialogs.
- Form validation using Formik and Yup.

### State Management & API Integration
- Redux Toolkit for UI state management.
- RTK Query for API communication.
- Centralized API configuration.
- Automatic cache management and invalidation.
- Optimistic updates for ticket modifications.
- Individual ticket queries and mutations.

### Testing
- Unit testing.
- Component testing.
- Redux state testing.
- API endpoint testing.
- User interaction testing.
- Mock Service Worker (MSW) for API mocking.

## User Roles & Permissions

| Feature | Administrator | Support Manager | Support Agent |
|---|---|---|---|
| View all tickets | Yes | Yes | No |
| View assigned tickets | Yes | Yes | Yes |
| Create tickets | Yes | No | No |
| Edit tickets | Yes | Yes | No |
| Delete tickets | Yes | No | No |
| Assign tickets | Yes | Yes | No |
| Update ticket status | Yes | Yes | Yes |
| Bulk status update | Yes | Yes | Yes |
| Bulk assignment | Yes | Yes | No |
| Bulk deletion | Yes | No | No |

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Formik
- Yup
- Lucide React

### State Management
- Redux Toolkit
- React Redux
- RTK Query

### Backend
- Node.js
- Express.js
- JSON Server
- REST API

### Testing
- Vitest
- React Testing Library
- User Event
- Mock Service Worker (MSW)

### Deployment
- GitHub
- Vercel
- Amazon S3
- Amazon CloudFront
- Render

## Project Structure

```text
ticket-management-dashboard/
│
├── public/
│
├── src/
│   ├── app/
│   │   └── store.ts
│   │
│   ├── components/
│   │   ├── TicketTable.tsx
│   │   └── ...
│   │
│   ├── features/
│   │   └── tickets/
│   │       ├── ticketApi.ts
│   │       ├── ticketSlice.ts
│   │       ├── ticketSelectors.ts
│   │       ├── ticket.types.ts
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useTickets.ts
│   │   └── ...
│   │
│   ├── pages/
│   │   └── TicketDashboard.tsx
│   │
│   ├── services/
│   │
│   ├── types/
│   │
│   ├── test/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── db.json
├── server.cjs
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/poorvipoorvikan-art/ticket-management-dashboard.git
```

### 2. Navigate to the Project Directory

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

For the deployed frontend, configure:

```env
VITE_API_URL=https://ticket-management-dashboard.onrender.com
```

### 5. Start the Backend

```bash
npm run server
```

The local API will run at:

```text
http://localhost:3001
```

### 6. Start the Frontend

Open another terminal and execute:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates the production build |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs ESLint |
| `npm run server` | Starts the local JSON Server |
| `npm run test:run` | Executes the test suite |
| `npm run start` | Starts the production server |

## API Endpoints

The application communicates with the backend using REST API endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tickets` | Fetch all tickets |
| GET | `/tickets/:id` | Fetch a specific ticket |
| POST | `/tickets` | Create a ticket |
| PATCH | `/tickets/:id` | Update a ticket |
| DELETE | `/tickets/:id` | Delete a ticket |

## State Management Architecture

The application uses Redux Toolkit and RTK Query for state management.

**Redux Toolkit**
- Manages application UI state.
- Stores search and filter values.
- Handles sorting and pagination.
- Maintains selected ticket IDs for bulk operations.

**RTK Query**
- Handles API requests and responses.
- Provides query and mutation hooks.
- Manages API caching.
- Automatically invalidates cache tags when required.
- Supports optimistic updates for ticket modifications.

## Testing

Run the test suite:

```bash
npm run test:run
```

Run tests in watch mode:

```bash
npm run test
```

Create a production build:

```bash
npm run build
```

## Deployment

### Vercel Deployment

The frontend is deployed on Vercel through GitHub integration.

Deployment workflow:

1. Push changes to the GitHub repository.
2. Vercel detects the new commit.
3. Vercel automatically starts a production build.
4. After successful deployment, the updated application becomes available.

### AWS S3 & CloudFront Deployment

The production frontend is also hosted using Amazon S3 and CloudFront.

Deployment workflow:

1. Generate the production build.

   ```bash
   npm run build
   ```

2. Open the generated `dist` folder.
3. Upload the contents of `dist` to the S3 bucket.
4. Replace existing files when prompted.
5. Create a CloudFront invalidation using:

   ```text
   /*
   ```

6. Wait until the invalidation status becomes Completed.
7. Verify the updated application using the CloudFront URL.

### Backend Deployment

The backend is hosted on Render and accessed by the frontend through the configured API URL.

## Future Enhancements

- Real-time ticket updates.
- Ticket activity history.
- Advanced analytics and reporting.
- Email notifications.
- Export tickets to CSV and PDF.
- Advanced dashboard customization.
- Automated CI/CD deployment for AWS S3 and CloudFront.

## Author

**Poorvika K**

Frontend Developer | React.js | TypeScript | Redux Toolkit

GitHub: https://github.com/poorvipoorvikan-art