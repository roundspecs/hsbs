# Health Stock & Billing System (HSBS)

## 📋 Overview

HSBS is a secure, multi-tenant web application designed to digitalize inventory and billing workflows for healthcare equipment distributors. It replaces manual, paper-based systems with a centralized dashboard for tracking stock, automating invoices, and managing client relationships.

Built with a modern tech stack, it features strict data isolation between workspaces, role-based access control (RBAC), and automated workflows triggers (e.g., invoice generation upon stock-out).

## 🚧 Project Status & To-Do List

  * **Authentication:** Secure Google Sign-In via Firebase Auth.
  * **Workspace System:**
      * [x] Multi-tenant architecture (Data isolation per workspace).
      * [x] Workspace creation, renaming, and deletion.
      * [x] Workspace switching mechanism.
  * **Member Management:**
      * [x] Join Request system (Request access, Admin Approve/Reject).
      * [x] Member list view with role assignment.
  * **Access Control (RBAC):**
      * [x] Custom Role creation (e.g., Manager, Staff).
      * [x] Granular Permission configuration (e.g., `viewProducts`, `manageRoles`).
      * [x] Protected routes based on permissions.

  * **Inventory Module:**
      * [ ] Product CRUD (Create, Read, Update, Delete).
      * [ ] Stock-In & Stock-Out transaction forms.
      * [ ] Real-time stock level updates.
  * **Billing & Invoicing:**
      * [ ] Automatic PDF Invoice generation upon Stock-Out.
      * [ ] Email integration (SendGrid/Nodemailer) for sending invoices.
  * **Analytics & Intelligence:**
      * [ ] Dashboard for sales reports and profit summaries.
      * [ ] AI-driven inventory forecasting (Future Scope).

## ✨ Key Features

  * **🏢 Workspace Management:** Create distinct, isolated workspaces for different medical distributors (e.g., Zimmer, CONMED) managed under a single user account.
  * **🔐 Role-Based Access Control (RBAC):** Customizable roles and permissions (e.g., Manager, Inventory Staff) to enforce the Principle of Least Privilege.
  * **📦 Inventory Control:** Real-time tracking of Stock-In and Stock-Out events with automatic inventory updates.
  * **🧾 Automated Billing:** Automatically generates and emails PDF invoices to managers when stock is issued to clients.
  * **👥 Join Request System:** Users can request access to workspaces, which admins can approve or reject.

## 🛠️ Tech Stack

**Frontend:**

  * **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
  * **Language:** TypeScript
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  * **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI)

**Backend & Database:**

  * **Platform:** [Firebase](https://firebase.google.com/)
  * **Authentication:** Firebase Auth (Google Sign-In)
  * **Database:** Cloud Firestore (NoSQL)

## 🚀 Getting Started

### Prerequisites

  * Node.js (v18 or higher)
  * npm or yarn
  * A Firebase project with Authentication and Firestore enabled.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/hsbs.git
    cd hsbs
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your Firebase configuration credentials:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```bash
hsbs/
├── app/                # Next.js App Router pages and layouts
│   ├── w/[slug]/       # Dynamic workspace routes (e.g., /w/zimmer)
│   └── page.tsx        # Landing page / Workspace switcher
├── components/         # Reusable React components
│   ├── auth/           # Authentication components
│   ├── ui/             # Shadcn UI primitives (Button, Dialog, etc.)
│   └── workspace/      # Workspace-specific UI (Cards, Settings)
├── lib/                # Utility functions and Firebase logic
│   ├── firebaseConfig.ts # Firebase initialization
│   ├── permissions.ts    # Role & Permission constants
│   └── ...
└── public/             # Static assets
```

## 👨‍💻 Developer

  * **Zarif Muhtasim Showgat**

## 📄 License

All rights reserved.

-----

*Created by Zarif Muhtasim Showgat, 2025.*