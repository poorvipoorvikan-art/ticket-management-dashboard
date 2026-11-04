# Ticket Management Dashboard

A responsive ticket management application built with React, TypeScript, Redux Toolkit, and a mock REST API. The project was developed incrementally, starting with the frontend foundation and local state, then evolving toward a more structured API-driven architecture with automated tests.

## Features

* View and manage support tickets
* Create, edit, and delete tickets
* Track ticket status and priority
* Search, filter, sort, and paginate tickets
* Form validation for ticket creation and editing
* Permission-aware UI behavior
* Loading and error states for API operations
* Automated tests for utilities, permissions, Redux logic, API thunks, and form interactions

> Feature availability may depend on the current implementation and mock API data.

## Technology Stack

* React
* TypeScript
* Vite
* Redux Toolkit
* Axios
* React Router
* Formik and Yup
* Tailwind CSS
* Vitest
* React Testing Library
* Mock Service Worker (MSW)
* json-server for the local mock API

## Getting Started

### Prerequisites

Install a supported Node.js LTS version and npm. Check your installed versions:

```bash
node -v
npm -v
```

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR-USERNAME/ticket-management-dashboard.git
cd ticket-management-dashboard
npm install
```

### Run the application

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Run the mock API

If the project’s `package.json` includes a json-server script, start it in a separate terminal:

```bash
npm run server
```

Use the script name defined in `package.json` if it differs.

## Testing

Run the complete test suite:

```bash
npm run test:run
```

Run tests in watch mode:

```bash
npm test
```

The current suite covers:

* Ticket selectors
* Ticket Redux slice behavior
* Permission utilities and hooks
* Validation rules
* API thunk success and error handling
* Ticket form rendering, validation, editing, and submission

At the current development checkpoint, **46 tests across 7 test files pass**.

## Project Structure

```text
src/
├── components/          # Reusable UI components and forms
├── features/
│   └── tickets/         # Ticket Redux state, thunks, selectors, and types
├── hooks/               # Reusable React hooks
├── services/            # API client and ticket service
├── test/                # Test setup and MSW mocks
├── types/               # Shared TypeScript types
└── utils/                # Validation and permission helpers
```

The exact structure may expand as additional features are implemented.

## Development Progress

### Phase 1 — Project foundation

* Created the React and TypeScript application with Vite.
* Established the source folder structure and shared ticket types.
* Added the initial ticket form and UI components.
* Set up the mock API approach for local development.

### Phase 2 — Local state and feature development

* Implemented ticket-related UI and interactions.
* Added ticket form validation with Formik and Yup.
* Added permission-related utilities and hooks.
* Started separating UI logic from reusable services and helpers.

### Phase 3 — API and state-management migration

* Moved ticket API calls into a service layer using Axios.
* Introduced a shared API client.
* Migrated ticket state management toward Redux Toolkit.
* Added ticket thunks, slice logic, selectors, and typed store hooks.
* Added loading and error handling for ticket operations.
* Added state for search, filtering, sorting, and pagination.

### Phase 4 — Automated testing

* Configured Vitest and React Testing Library.
* Added MSW handlers for API testing.
* Added tests for validation, permissions, selectors, Redux state, and API thunks.
* Added component interaction tests for the ticket form.
* Fixed test setup and form-test issues.
* Verified that all 46 tests pass.

## Next Steps

* Verify the production build.
* Confirm the required Node.js version and upgrade the local development environment if needed.
* Continue expanding component and end-to-end test coverage.
* Review accessibility, responsive behavior, and error handling.
* Replace the mock API with a production backend when available.
* Document deployment and environment configuration.

## Available Scripts

Check `package.json` for the scripts available in this repository. Common scripts include:

```bash
npm run dev
npm run build
npm run test:run
```

## License

This project is currently intended for learning and portfolio development.
