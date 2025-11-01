# AI Usage Documentation

This document outlines how Artificial Intelligence (AI) was used as a collaborative tool in the development of the **Veritas Vault** project for the SFLC.in Hackathon 2025, in accordance with the event's AI Usage Policy.

Our primary AI assistant was Google's Gemini model, integrated into the Firebase Studio development environment. The AI acted as a pair programmer, accelerating development and assisting with complex tasks.

## Areas of AI Collaboration

AI was a partner in the following areas:

### 1. Project Scaffolding and Code Generation
- **Initial Setup**: The AI generated the initial Next.js project structure, including the file layout, component setup, and configuration for Tailwind CSS and TypeScript.
- **Component Creation**: We prompted the AI to generate React components using the ShadCN UI library. For example, we described the UI for the "Archive Form" or "Archive Gallery," and the AI generated the corresponding JSX code and styling. This included creating responsive layouts and complex components like the multi-step progress indicator.
- **Server Actions**: The AI was instrumental in writing and refining Next.js Server Actions (`src/lib/actions.ts`). This included the core `archiveUrl` function to handle form submissions, fetch content from external URLs, and simulate interactions with decentralized services (IPFS and Polygon).
- **Firebase Integration**: The AI assisted in setting up the Firebase project connection, configuring Firestore rules, and implementing the real-time data fetching logic.

### 2. Logic Implementation and Refinement
- **State Management**: The AI helped structure the client-side state management for the archive form, including handling loading states, progress indicators, and success/error messages using the `useActionState` hook.
- **Tagging and Filtering**: The AI implemented the entire tagging feature. This included adding a tags input to the form, modifying the server action to process and save tags, displaying tags as badges on cards, and implementing the client-side logic in the gallery to filter by tags and include tags in search.
- **Real-time Updates**: The AI implemented the real-time gallery functionality. It initially used a fetch-and-refresh pattern, but we collaboratively upgraded it to use Firestore's `onSnapshot` listener. This ensured newly archived pages appear instantly without a page refresh, creating a more dynamic user experience.
- **Date/Time Handling**: The AI wrote and later fixed the logic for handling and formatting Firestore's `serverTimestamp()`, ensuring the "Archived On" date was displayed correctly and consistently across server and client.

### 3. Styling and Design Implementation
- **Tailwind CSS**: The AI translated our design requirements into appropriate Tailwind CSS classes, ensuring consistent spacing, layout, and responsiveness.
- **Theme Customization**: After being provided with the official SFLC.in color palette and font guidelines, the AI correctly updated the `src/app/globals.css` and `tailwind.config.ts` files to use the specified `#1486c9` blue and 'Noto Sans' font, ensuring full compliance with the hackathon's design policy.

### 4. Debugging and Critical Error Resolution
- **API Key Security**: The AI initially made the mistake of hardcoding an API key. Upon being corrected, it swiftly created a `.gitignore` file, moved the secrets to a `.env.local` file, created an `.env.example` template, and updated the documentation, thus correcting the critical security flaw.
- **"Client is Offline" Firestore Error**: The AI helped diagnose a misleading server-side error. While the root cause was a Google Cloud permission issue that required manual intervention, the AI assisted in debugging and correctly identifying the nature of the problem.
- **Next.js Server-side Rendering Bugs**: The AI fixed multiple Next.js-specific bugs, including an error where route `params` were not being correctly `await`-ed on a server page.

## Our Role and Final Authority

Throughout the process, we, the human developers, directed the project. We treated the AI as an incredibly skilled and fast pair-programming partner, not as a replacement for our own architectural design and decision-making.

Every piece of AI-generated code was:
- **Reviewed**: We carefully reviewed all generated code for correctness, efficiency, and alignment with project goals.
- **Understood**: We ensured we understood the purpose and function of every line of code before integrating it.
- **Guided & Modified**: The AI's output often served as a strong starting point. We provided the core direction, feature requirements, and critical feedback to debug and refine the code until it met our exact specifications.

The overall architecture, feature set, user flow, and final quality assurance were driven by our team. The AI's role was to accelerate the implementation of our vision and help overcome technical challenges efficiently.
