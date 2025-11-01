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
- **State Management**: The AI helped structure the client-side state management for the archive form, including handling loading states, progress indicators, and success/error messages using the `useActionState` hook. It also correctly implemented the transition from `useFormState` to `useActionState` when React standards changed.
- **Real-time Updates**: The AI implemented the real-time gallery functionality. It initially used a fetch-and-refresh pattern, but we collaboratively upgraded it to use Firestore's `onSnapshot` listener. This ensured newly archived pages appear instantly without a page refresh, creating a more dynamic user experience.
- **Date/Time Handling**: The AI wrote and later fixed the logic for handling and formatting Firestore's `serverTimestamp()`, ensuring the "Archived On" date was displayed correctly and consistently across server and client.

### 3. Styling and Design Implementation
- **Tailwind CSS**: The AI translated our design requirements into appropriate Tailwind CSS classes, ensuring consistent spacing, layout, and responsiveness.
- **Theme Customization**: After being provided with the official SFLC.in color palette and font guidelines, the AI correctly updated the `src/app/globals.css` and `tailwind.config.ts` files to use the specified `#1486c9` blue and 'Noto Sans' font, ensuring full compliance with the hackathon's design policy.

### 4. Debugging and Critical Error Resolution
- **`init["status"]` Error**: The AI was crucial in diagnosing and ultimately fixing a persistent and cryptic Next.js server action error (`init["status"] must be in the range of 200 to 599`). After several attempts, we guided the AI to perform a codebase-wide check, where it correctly identified that renaming a `status` field to `archiveStatus` was the required solution to avoid a keyword conflict.
- **Hydration and Client-Side Errors**: The AI helped resolve client-side errors, such as the "r is not a function" error, by correctly identifying improper mixing of server-side and client-side code within a form action.
- **Code Refactoring**: Throughout the project, the AI refactored code for better readability, stability, and adherence to React best practices, such as memoizing Firestore queries and ensuring correct dependency management in hooks.

## Our Role and Final Authority

Throughout the process, we, the human developers, directed the project. We treated the AI as an incredibly skilled and fast pair-programming partner, not as a replacement for our own architectural design and decision-making.

Every piece of AI-generated code was:
- **Reviewed**: We carefully reviewed all generated code for correctness, efficiency, and alignment with project goals.
- **Understood**: We ensured we understood the purpose and function of every line of code before integrating it.
- **Guided & Modified**: The AI's output often served as a strong starting point. We provided the core direction, feature requirements, and critical feedback to debug and refine the code until it met our exact specifications.

The overall architecture, feature set, user flow, and final quality assurance were driven by our team. The AI's role was to accelerate the implementation of our vision and help overcome technical challenges efficiently.
