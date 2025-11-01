# AI Usage Documentation

This document outlines how Artificial Intelligence (AI) was used in the development of the **Veritas Vault** project for the SFLC.in Hackathon 2025, in accordance with the event's AI Usage Policy.

Our primary AI assistant was Google's Gemini model, integrated into the Firebase Studio development environment.

## Areas of AI Assistance

AI was used as a collaborative partner in the following areas:

### 1. Code Generation and Scaffolding
- **Initial Setup**: The AI was used to generate the initial Next.js project structure, including the basic file layout, component setup, and Tailwind CSS configuration.
- **Component Creation**: We prompted the AI to generate React components based on the ShadCN UI library. For example, we would describe the required UI for the "Archive Form" or "Archive Gallery," and the AI would generate the corresponding JSX and styling.
- **Server Actions**: The AI assisted in writing Next.js Server Actions (`src/lib/actions.ts`) to handle form submissions, fetch content from URLs, and simulate interactions with decentralized storage (IPFS) and a blockchain (Polygon).
- **Firebase Integration**: The AI set up the Firebase project connection, configured Firestore, and implemented the real-time data fetching logic using `onSnapshot` for the gallery.

### 2. Logic and Functionality
- **State Management**: We used AI to help structure the client-side state management for the archive form, including handling loading states, progress indicators, and success/error messages using the `useActionState` hook.
- **Real-time Updates**: The AI implemented the real-time update functionality for the gallery by using Firestore's `onSnapshot` listener, ensuring newly archived pages appear instantly.

### 3. Styling and Design Implementation
- **Tailwind CSS**: The AI translated our design requirements (e.g., "create a card layout," "style the progress bar") into appropriate Tailwind CSS classes.
- **Theme Customization**: After being provided with the official SFLC.in color palette and font guidelines, the AI updated the `globals.css` and `tailwind.config.ts` files to use the specified `#1486c9` blue and 'Noto Sans' font, ensuring full compliance with the hackathon's design policy.

### 4. Debugging and Refinement
- **Error Resolution**: The AI was instrumental in diagnosing and fixing several critical bugs. This included resolving an infinite re-render loop in the gallery, fixing a subtle Next.js server action error (`init["status"]`), and correcting data serialization issues between the server and client.
- **Code Refactoring**: The AI helped refactor code for better readability, stability, and adherence to React best practices, such as ensuring proper dependency management in hooks.

## Our Role and Understanding

Throughout the process, we treated the AI as a productivity tool and a pair-programming partner, not as a replacement for our own understanding. Every piece of AI-generated code was:
- **Reviewed**: We carefully reviewed all generated code to ensure it was correct, efficient, and aligned with our project goals.
- **Understood**: We made sure we understood the purpose and function of every line of code before integrating it.
- **Guided & Modified**: The AI's output often served as a starting point. We provided the core direction, feature requirements, and debugging feedback, then worked with the AI iteratively to refine the code until it met our exact specifications.

The overall architecture, core feature ideas, and user flow were designed by our team. The AI's role was to accelerate the implementation of these ideas and assist in overcoming technical challenges.