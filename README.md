# SprintDesk — Sprint Management Dashboard

SprintDesk is a production-oriented sprint management dashboard built for software development teams. It provides authentication, an interactive Kanban board, analytics, notifications, reusable UI components, responsive design, accessibility, performance optimization, and automated testing.

## Features

### Authentication

* Login with DummyJSON authentication API
* Access token stored in application state
* Refresh token persistence using localStorage
* Axios authentication interceptor
* Automatic token refresh after `401 Unauthorized`
* Failed request retry after successful token refresh
* Protected authenticated routes
* Logout functionality
* Session validation on application startup

### Kanban Sprint Board

* Four workflow columns:

  * To Do
  * In Progress
  * Review
  * Done
* Tasks loaded from JSONPlaceholder
* Drag and drop using `@dnd-kit`
* Reorder tasks within a column
* Move tasks between columns
* Add new tasks
* Edit task details
* Delete tasks with confirmation
* Task priority, assignee and due date
* Task details drawer
* Dynamic column task counts
* Board state persistence using Zustand/localStorage

### Analytics

* Dedicated analytics dashboard
* Sprint/task data visualisation
* Task status distribution
* Priority breakdown
* Completion-related metrics
* Responsive charts

### Notifications

* Polling-based notification system
* Notification bell with unread count
* Read/unread notification state
* Mark notification as read
* Mark all notifications as read
* Notification persistence
* Toast feedback for new notifications

### Reusable UI Components

The application uses reusable components for common UI patterns, including:

* Button
* Input
* Select
* Modal
* Toast
* Loading/Skeleton states
* Data presentation components

### Performance & Accessibility

* Route-level code splitting
* Lazy-loaded application pages
* Responsive mobile layout
* Semantic HTML
* Proper form labels
* Accessible interactive elements
* Production build optimization

## Tech Stack

| Technology            | Purpose                           |
| --------------------- | --------------------------------- |
| React                 | Frontend framework                |
| TypeScript            | Type-safe development             |
| Vite                  | Build tool and development server |
| Tailwind CSS          | Styling                           |
| React Router          | Application routing               |
| Zustand               | Global/client state management    |
| Axios                 | API communication                 |
| @dnd-kit              | Drag-and-drop interactions        |
| Recharts              | Data visualization                |
| Vitest                | Unit testing                      |
| React Testing Library | React component testing           |
| DummyJSON             | Authentication API                |
| JSONPlaceholder       | Task/notification API             |

## Application Routes

| Route        | Description          | Access    |
| ------------ | -------------------- | --------- |
| `/login`     | User authentication  | Public    |
| `/dashboard` | Main dashboard       | Protected |
| `/board`     | Kanban sprint board  | Protected |
| `/analytics` | Analytics and charts | Protected |

## Project Architecture

```text
src/
├── components/
│   ├── ui/
│   ├── AddTaskModal.tsx
│   ├── TaskDrawer.tsx
│   └── ...
│
├── hooks/
│   └── useToast.tsx
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Board.tsx
│   └── Analytics.tsx
│
├── services/
│   ├── api.ts
│   ├── refreshApi.ts
│   └── boardApi.ts
│
├── store/
│   ├── authStore.ts
│   └── boardStore.ts
│
├── App.tsx
└── main.tsx
```

### Data Flow

```text
User
  ↓
React UI
  ↓
Pages / Components
  ↓
Zustand Stores ───────→ Local Storage
  ↓
Service / Axios Layer
  ↓
API
  ├── DummyJSON
  └── JSONPlaceholder
```

Authentication requests are handled through the Axios service layer. The interceptor attaches the access token to protected requests and handles token refresh when an authenticated request returns `401`.

## API Integration

### Authentication

**Login**

```text
POST https://dummyjson.com/auth/login
```

Used to authenticate the user and obtain access/refresh tokens.

### Current User

```text
GET /auth/me
```

Used to validate the authenticated session.

### Refresh Token

The application uses the refresh-token flow to obtain a new access token when the current access token expires.

### Tasks

```text
GET https://jsonplaceholder.typicode.com/todos
```

Used as the source for the initial task data.

### Notifications

```text
GET https://jsonplaceholder.typicode.com/posts?_limit=5
```

The polling system uses new post IDs to simulate incoming notifications.

Detailed API request/response documentation is provided separately in the API documentation.

## Testing

The project includes unit tests for:

* `useToast`
* Zustand board store
* Add task
* Move task
* Delete task
* Authentication interceptor
* Token refresh and request retry
* Missing refresh token handling
* Logout when refresh fails

Run the complete test suite:

```bash
npm run test06
```

Latest result:

```text
Test Files: 3 passed
Tests: 10 passed
```

## Production Build

Create a production build:

```bash
npm run build
```

The production build completed successfully using Vite.

To preview the production build locally:

```bash
npm run preview
```

## Lighthouse Results

Production Lighthouse audit:

| Category       | Score |
| -------------- | ----: |
| Performance    |    90 |
| Accessibility  |   100 |
| Best Practices |    96 |
| SEO            |    91 |

The assignment required a minimum Lighthouse Performance score of 88 and Accessibility score of 92. SprintDesk currently exceeds both targets.

## Environment Variables

No secret API keys are required for the current frontend API integrations.

Do not commit passwords, API keys, tokens, or other sensitive credentials to the repository.

If environment variables are introduced later, create a local `.env` file and keep it excluded from Git.

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd sprintdesk
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local application in the browser using the URL shown by Vite.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test06
```

## Quality Checklist

* [x] Authentication flow
* [x] Protected routes
* [x] Axios auth interceptor
* [x] Token refresh and retry
* [x] Kanban board
* [x] Drag and drop
* [x] Task CRUD
* [x] Zustand state management
* [x] Analytics
* [x] Notifications
* [x] Reusable components
* [x] Responsive UI
* [x] Unit tests
* [x] Production build
* [x] Lighthouse Performance ≥ 88
* [x] Lighthouse Accessibility ≥ 92

## Submission

### GitHub Repository

`YOUR_GITHUB_REPOSITORY_URL`

### Live Deployment

`YOUR_DEPLOYMENT_URL`

### Architecture Document

`ARCHITECTURE_DOCUMENT_URL`

### API Documentation

`API_DOCUMENTATION_URL`

### Screen Recording / Demo

`DEMO_VIDEO_URL`

## Security

* No passwords or API keys are committed to the repository.
* Authentication tokens are handled through the application's authentication flow.
* Sensitive environment files should remain outside version control.
* `.env` files should be added to `.gitignore` when used.

## Future Improvements

Possible future improvements include:

* More comprehensive automated accessibility testing
* Additional analytics filters
* More advanced keyboard drag-and-drop interactions
* Improved API error handling and retry strategies
* Expanded integration and end-to-end testing
* Production backend persistence for tasks and notifications

## License

This project was developed as a frontend engineering assignment for evaluation purposes.
