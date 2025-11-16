# 🏥 HSBS - Health Stock & Billing SystemThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, multi-workspace health inventory and billing management system built with Next.js 16, React 19, and Firebase.## Getting Started



![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=flat-square&logo=next.js)First, run the development server:

![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=flat-square&logo=react)

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)```bash

![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange?style=flat-square&logo=firebase)npm run dev

![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css)# or

yarn dev

## ✨ Features# or

pnpm dev

- 🔐 **Google OAuth Authentication** - Secure authentication via Firebase# or

- 🏢 **Multi-Workspace Support** - Create and manage multiple workspacesbun dev

- 👥 **Role-Based Access Control** - Admin and default roles with granular permissions```

- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS v4

- 📱 **Mobile-First** - Fully responsive across all devicesOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- 🌓 **Dark Mode Ready** - Built-in dark mode support

- ⚡ **Real-time Data** - Powered by Firebase FirestoreYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- 🎯 **Type-Safe** - Full TypeScript support

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🚀 Tech Stack

## Learn More

### Frontend

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)To learn more about Next.js, take a look at the following resources:

- **UI Library:** [React 19](https://react.dev)

- **Language:** [TypeScript 5](https://www.typescriptlang.org)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Components:** [Radix UI](https://www.radix-ui.com) primitives

- **Icons:** [Lucide React](https://lucide.dev)You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



### Backend## Deploy on Vercel

- **Authentication:** [Firebase Auth](https://firebase.google.com/docs/auth)

- **Database:** [Cloud Firestore](https://firebase.google.com/docs/firestore)The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- **Hosting:** Firebase Hosting (optional)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📋 Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher (or yarn/pnpm)
- **Firebase Account:** Free tier is sufficient

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/roundspecs/hsbs.git
cd hsbs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable **Google Authentication**:
   - Navigate to Authentication → Sign-in method
   - Enable Google provider
4. Create a **Firestore Database**:
   - Navigate to Firestore Database
   - Click "Create database"
   - Start in test mode (for development)

#### Get Firebase Configuration
1. In Firebase Console, go to Project Settings (⚙️)
2. Scroll to "Your apps" and click the web icon (`</>`)
3. Register your app and copy the configuration

#### Set Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
hsbs/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with AuthWrapper
│   ├── page.tsx             # Home page (workspace list)
│   ├── globals.css          # Global styles
│   └── w/                   # Workspace routes
│       └── [slug]/          # Dynamic workspace pages
│           ├── layout.tsx   # Workspace layout
│           └── page.tsx     # Workspace content
├── components/
│   ├── auth/                # Authentication components
│   │   ├── AuthPage.tsx     # Login page
│   │   ├── AuthWrapper.tsx  # Auth guard HOC
│   │   └── LogoutBtn.tsx    # Logout button
│   ├── sidebar/             # Sidebar navigation
│   │   ├── app-sidebar.tsx  # Main sidebar component
│   │   ├── nav-main.tsx     # Main navigation
│   │   ├── nav-projects.tsx # Projects navigation
│   │   ├── nav-user.tsx     # User menu
│   │   └── workspace-switcher.tsx
│   ├── ui/                  # Reusable UI components
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   ├── spinner.tsx
│   │   └── ...
│   └── workspace/           # Workspace-related components
│       ├── NewWorkspaceDialog.tsx
│       ├── WorkspaceCard.tsx
│       ├── workspace-client-layout.tsx
│       ├── workspace-loading.tsx
│       └── workspace-no-access.tsx
├── hooks/
│   └── use-mobile.ts        # Mobile detection hook
├── lib/
│   ├── auth.ts              # Authentication utilities
│   ├── firebaseConfig.ts    # Firebase configuration
│   ├── useAuth.ts           # Auth hook
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## 🔥 Firebase Data Structure

### Collections

#### `users/{userId}`
```typescript
{
  uid: string
  name: string
  email: string
  photoUrl: string
  lastLogin: Timestamp
  createdAt: Timestamp
}
```

#### `workspaces/{slug}`
```typescript
{
  name: string
  slug: string
  ownerUid: string
  createdAt: Timestamp
}
```

#### `workspaces/{slug}/members/{userId}`
```typescript
{
  userUid: string
  roles: string[]  // e.g., ['admin', 'default']
  joinedAt: Timestamp
}
```

#### `workspaces/{slug}/roles/{roleId}`
```typescript
{
  name: string
  isSystemRole: boolean
  permissions: string[]  // e.g., ['*'] or ['viewProducts', 'viewReports']
}
```

## 🔒 Security Rules (Production)

Update your Firestore security rules before deploying:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check workspace membership
    function isWorkspaceMember(workspaceId) {
      return exists(/databases/$(database)/documents/workspaces/$(workspaceId)/members/$(request.auth.uid));
    }
    
    // Helper function to check admin role
    function isWorkspaceAdmin(workspaceId) {
      return isWorkspaceMember(workspaceId) && 
        get(/databases/$(database)/documents/workspaces/$(workspaceId)/members/$(request.auth.uid))
          .data.roles.hasAny(['admin']);
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workspaces
    match /workspaces/{workspaceId} {
      allow read: if request.auth != null && isWorkspaceMember(workspaceId);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isWorkspaceAdmin(workspaceId);
      
      // Members subcollection
      match /members/{memberId} {
        allow read: if request.auth != null && isWorkspaceMember(workspaceId);
        allow write: if request.auth != null && isWorkspaceAdmin(workspaceId);
      }
      
      // Roles subcollection
      match /roles/{roleId} {
        allow read: if request.auth != null && isWorkspaceMember(workspaceId);
        allow write: if request.auth != null && isWorkspaceAdmin(workspaceId);
      }
    }
  }
}
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) design system:

- ✅ Avatar, Button, Card
- ✅ Dialog, Dropdown Menu, Input
- ✅ Sidebar (collapsible)
- ✅ Skeleton, Spinner, Tooltip
- ✅ Table, Textarea
- ✅ And more...

All components are fully customizable and use Tailwind CSS v4.

## 🔑 Key Features Explained

### Multi-Workspace Architecture
- Users can create unlimited workspaces
- Each workspace has independent members and roles
- Workspace-based access control ensures data isolation

### Authentication Flow
1. User signs in with Google
2. Profile stored in Firestore `users` collection
3. Access granted to authorized workspaces only
4. Session persists across browser refreshes

### Role-Based Permissions
- **Admin Role:** Full access (`permissions: ['*']`)
- **Default Role:** Limited access (customizable)
- Extensible for future roles (e.g., viewer, editor)

## 🚧 Development Roadmap

- [ ] Inventory management features
- [ ] Billing and invoicing system
- [ ] Reports and analytics
- [ ] Team member invitations
- [ ] Advanced permissions management
- [ ] Export/Import functionality
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- **roundspecs** - *Initial work* - [GitHub](https://github.com/roundspecs)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Built with ❤️ using Next.js 16 and React 19**
