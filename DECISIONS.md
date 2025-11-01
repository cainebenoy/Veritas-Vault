# Technical Decisions and Design Rationale

This document describes the key technical decisions, feature design, and thought process behind the **Veritas Vault** project.

## 1. Core Concept

The primary goal of Veritas Vault is to create a simple, user-friendly tool to combat link rot and content censorship. We wanted to build a "Save Page As" for the modern, decentralized web. The core idea is to take a snapshot of a given URL and store it permanently on IPFS, with a timestamped proof of its existence recorded on a public blockchain.

## 2. Technology Stack

We chose a modern, React-based stack that prioritizes developer experience and performance.

- **Framework**: **Next.js (App Router)** was chosen for its robust features, including Server Components, Server Actions, and a file-system-based router. This allows for a clean separation of concerns between client and server logic.
- **UI Components**: **ShadCN UI** provides a set of beautifully designed, accessible, and unstyled components that are easy to customize. This allowed us to build a professional-looking UI quickly without being locked into a specific design system.
- **Styling**: **Tailwind CSS** was used for its utility-first approach, enabling rapid styling directly within our components and easy implementation of the SFLC.in design guidelines.
- **Language**: **TypeScript** was used for its static typing capabilities, which helps prevent common errors and improves code quality and maintainability.
- **Database**: **Firebase Firestore** was chosen for its real-time capabilities, which are essential for the instantly updating gallery feature.

## 3. Feature Design

### Archive Form & Process
- **Simplicity First**: The main user interaction is a single input field for a URL and a button. We intentionally kept this as simple as possible to lower the barrier to entry.
- **Real-time Feedback**: A crucial part of the user experience is seeing the archiving process happen. We designed a multi-step progress indicator that visually communicates the status (`Fetching`, `Uploading`, `Notarizing`) to the user. This provides transparency and keeps the user engaged.
- **Client-Side State**: The form's state, including the progress updates and final success/error messages, is managed on the client using React's `useActionState` hook, which is designed to work seamlessly with Next.js Server Actions.

### Archive Gallery
- **Visual Discovery**: A gallery of previously archived pages is essential for discoverability. The `ArchiveCard` component displays a screenshot, title, and original URL.
- **Real-time Updates**: The gallery is a client-side component (`'use client'`) that uses a Firestore `onSnapshot` listener. This ensures that as soon as a new archive is successfully created, it appears in the gallery instantly without requiring a page refresh. This creates a dynamic and responsive user experience.
- **Search & Filtering**: A debounced search input allows for quick filtering of the archives by title, using Firestore's real-time querying capabilities.
- **Loading States**: We use a `GallerySkeleton` component to provide an instant loading state while the initial batch of data is fetched, preventing a blank screen on page load.

### Detailed Archive View
- **Content and Metadata**: When a user views a specific archive, we show both the archived content itself and the critical metadata (original URL, IPFS link, blockchain transaction hash).
- **Safe Content Display**: The archived HTML content is displayed within an `<iframe>` with the `sandbox="allow-same-origin"` attribute. This is a critical security measure to prevent the archived content's scripts from running and potentially compromising our application.

## 4. Decentralization (Simulated)

For this hackathon prototype, the interactions with decentralized services are simulated to focus on the application logic and user experience. A real-world implementation would require a secure backend service.

- **Content Fetching**: In a real application, this would involve a robust backend service that can render JavaScript-heavy pages (e.g., using a headless browser like Puppeteer). For the prototype, we use a standard `fetch` call.
- **IPFS Upload**: We simulate the upload process. A production version would use a service like Pinata or a local IPFS node to pin the content. Our implementation includes logic to use Pinata if API keys are provided in the environment.
- **Blockchain Notarization (Simulated)**: The Polygon transaction is simulated. We made a conscious decision to simulate this step to avoid the complexity and cost of managing a crypto wallet and private keys within the scope of a hackathon. This allowed us to focus on building a seamless and complete user experience.

### Path to Production: Implementing Real Blockchain Notarization
For open-source contributors, the path to implementing real on-chain notarization would be:
1.  **Write a Smart Contract**: Create a simple Solidity contract with a function like `recordArchive(string memory ipfsHash)` to store the hash and timestamp.
2.  **Deploy the Contract**: Deploy to a network like Polygon Amoy (testnet) or mainnet.
3.  **Create a Secure Backend Service**: This service would securely manage a wallet with MATIC for gas fees. Private keys should never be exposed on the Next.js server.
4.  **Update the Server Action**: The `archiveUrl` action would call this secure backend service, which would then sign and send the real transaction to the deployed smart contract. The resulting transaction hash would be returned and stored in Firestore.