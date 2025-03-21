# Visual Harmonics Dashboard

A comprehensive dashboard for managing video game audio production projects. Built with Next.js, React, Tailwind CSS, and shadcn/ui.

## Features

- **Project Management**: Create and track audio production projects
- **Expense Management**: Track expenses and manage budgets
- **Brainstorming**: Organize ideas and notes
- **File Sharing**: Google Drive integration for file management
- **Communication**: Internal messaging system
- **Modular Design**: Extensible architecture for adding new features

## Tech Stack

- **Frontend**: Next.js with React 19+
- **UI**: Tailwind CSS with shadcn/ui components
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM with SQLite (can be switched to PostgreSQL)
- **State Management**: React Context API and Zustand

## Getting Started

### Prerequisites

- Node.js 16.8+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://your-repository-url/vh-dashboard.git
cd vh-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev

# Seed the database with initial data
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Project Structure

- `/app`: Next.js app directory with routes
- `/components`: Reusable UI components
- `/modules`: Feature modules (projects, expenses, etc.)
- `/prisma`: Database schema and migrations
- `/public`: Static assets
- `/lib`: Utility functions and libs

### Adding a New Module

The dashboard follows a modular architecture. To add a new module:

1. Create a new directory in `/src/modules/[module-name]`
2. Define the module configuration in `index.tsx`
3. Import the module in `/src/modules/core/module-loader.tsx`

Example module structure:
```
modules/
  core/
  your-module/
    index.tsx           # Module definition
    components/         # Module-specific components
    widgets/            # Dashboard widgets
    hooks/              # Custom hooks
    api/                # API handlers
```

## Deployment

The application can be deployed to Vercel:

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Core Features

### 1. Project Management

- Project creation and tracking
- Task management with deadlines and assignments
- Project categorization (soundtracks, sound effects, ambience, foley, etc.)
- Status tracking and milestone management
- Time tracking capabilities

### 2. Expense Management

- Expense tracking and categorization
- Budget management
- Invoice generation
- Financial reporting and analytics

### 3. Brainstorming

- Idea boards for sound concepts
- Reference material organization
- Sound inspiration collections
- Note-taking and sharing

### 4. File Sharing

- Google Drive integration
- File organization by project/category
- Version history tracking
- Preview capabilities for audio files

### 5. Communication

- Internal messaging system
- Discussion threads for projects
- Comment system on files and projects
- Notification system

### 6. Modularity System

- Plugin architecture for adding new features
- Configuration options for enabling/disabling modules
- Extension points for custom integrations

## Mobile Accessibility Features

To ensure excellent mobile experiences:

1. **Responsive Layout**:
    - Fluid grid system using Tailwind's responsive classes
    - Mobile-first approach to all component design
2. **Touch-Optimized UI**:
    - Larger touch targets for mobile (min 44x44px)
    - Bottom navigation on mobile devices
    - Swipe gestures for common actions
3. **Adaptive Components**:
    - Collapsible sidebar that transforms to bottom navigation
    - Responsive tables that reformat for small screens
    - Mobile-optimized forms with appropriate input types
4. **Performance Optimizations**:
    - Lazy loading images and components
    - Code splitting to reduce initial load times
    - Optimized assets for mobile data connections

## Next Steps

1. Set up the Next.js project with the shadcn/ui component library (completed)
2. Implement the authentication system with NextAuth.js (needs repair)
3. Create the database schema using Prisma (demo database created, need full implementation)
4. Develop the core dashboard layout with responsive design (started, need more components/information)
5. Begin implementing the project management module

## Database Schema

erDiagram
    User {
        string id PK
        string name
        string email
        string password
        enum role
        datetime createdAt
        datetime updatedAt
    }

    Project {
        string id PK
        string name
        string description
        enum type
        enum status
        datetime startDate
        datetime endDate
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    Task {
        string id PK
        string title
        string description
        enum status
        enum priority
        datetime dueDate
        string projectId FK
        string assigneeId FK
        datetime createdAt
        datetime updatedAt
    }

    Expense {
        string id PK
        string title
        string description
        float amount
        datetime date
        enum category
        string invoiceNumber
        boolean paid
        string userId FK
        string projectId FK
        datetime createdAt
        datetime updatedAt
    }

    FileUpload {
        string id PK
        string name
        string type
        int size
        string url
        string googleDriveId
        string uploaderId FK
        string projectId FK
        datetime createdAt
        datetime updatedAt
    }

    Note {
        string id PK
        string title
        string content
        boolean isPublic
        string authorId FK
        string projectId FK
        datetime createdAt
        datetime updatedAt
    }

    Message {
        string id PK
        string content
        boolean read
        string senderId FK
        string recipientId FK
        datetime createdAt
        datetime updatedAt
    }

    Comment {
        string id PK
        string content
        string authorId FK
        string projectId FK
        string taskId FK
        string fileId FK
        string noteId FK
        datetime createdAt
        datetime updatedAt
    }

    User ||--o{ Project : "owns"
    User }|--o{ Project : "member of"
    User ||--o{ Task : "assigned to"
    User ||--o{ Expense : "created by"
    User ||--o{ FileUpload : "uploaded by"
    User ||--o{ Note : "authored"
    User ||--o{ Message : "sends"
    User ||--o{ Message : "receives"
    User ||--o{ Comment : "authored"

    Project ||--o{ Task : "contains"
    Project ||--o{ Expense : "has"
    Project ||--o{ FileUpload : "contains"
    Project ||--o{ Note : "contains"
    Project ||--o{ Comment : "has"

    Task ||--o{ Comment : "has"
    FileUpload ||--o{ Comment : "has"
    Note ||--o{ Comment : "has"
