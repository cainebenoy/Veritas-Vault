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

## 3. Feature Design

### Archive Form & Process
- **Simplicity First**: The main user interaction is a single input field for a URL and a button. We intentionally kept this as simple as possible to lower the barrier to entry.
- **Real-time Feedback**: A crucial part of the user experience is seeing the archiving process happen. We designed a multi-step progress indicator that visually communicates the status (`Fetching`, `Uploading`, `Notarizing`) to the user. This provides transparency and keeps the user engaged while they wait.
- **Client-Side State**: The form's state, including the progress updates and final success/error messages, is managed on the client using React hooks (`useState`, `useEffect`, `useActionState`). This provides a responsive and interactive experience without requiring full page reloads.

### Archive Gallery
- **Visual Discovery**: We decided a gallery of previously archived pages was essential for discoverability. The `ArchiveCard` component displays a screenshot, title, and original URL, making it easy to browse.
- **Server-Side Rendering & Infinite Scroll**: The gallery is now a client-side component (`'use client'`) that fetches data directly from Firestore. This allows for real-time updates as new archives are created. To handle large numbers of archives, we've implemented an infinite scroll with a "Load More" button, using Firestore cursors for efficient data pagination. A debounced search input allows for quick filtering of the results.
- **Loading States**: We use `Suspense` with a `GallerySkeleton` component to provide an instant loading state while the initial batch of data is fetched.

### Detailed Archive View
- **Content and Metadata**: When a user views a specific archive, we show both the archived content itself and the critical metadata (original URL, IPFS link, blockchain transaction hash).
- **Safe Content Display**: The archived HTML content is displayed within an `<iframe>` with the `sandbox="allow-same-origin"` attribute. This is a security measure to prevent the archived content's scripts from running and potentially compromising our application.

## 4. Decentralization (Simulated)

For this hackathon prototype, the interactions with decentralized services are simulated to focus on the application logic and user experience.

- **Content Fetching**: In a real application, this would involve a robust backend service that can render JavaScript-heavy pages (e.g., using a headless browser like Puppeteer).
- **IPFS Upload**: We simulate the upload process. A production version would use a service like Pinata or a local IPFS node to pin the content.
- **Blockchain Notarization (High-Fidelity Simulation)**: The Polygon transaction is simulated. We made a conscious decision to simulate this step for the hackathon for several key reasons:
    - **Cost**: Real blockchain transactions require gas fees, paid in cryptocurrency (MATIC). While small, this introduces a financial barrier for a free, public-good tool.
    - **Security & Complexity**: A production system would require a secure backend wallet to hold funds and sign transactions. Managing private keys and transaction nonces safely is a significant engineering challenge that is outside the scope of a hackathon prototype.
    - **User Experience**: Blockchain transactions are not instant. Waiting for block confirmations would add significant time to the archiving process.
    - **Focus**: Simulating this step allowed us to focus on building a seamless and complete user experience for the core application logic.

### Path to Production: Implementing Real Blockchain Notarization
For open-source contributors looking to take this project to the next level, here is the path to implementing real on-chain notarization:

1.  **Write a Smart Contract**: Create a simple Solidity smart contract (e.g., `Notary.sol`) that has one primary function, like `recordArchive(string memory ipfsHash)`. This function would store the `ipfsHash` along with the timestamp (`block.timestamp`) and the sender's address (`msg.sender`) on the Polygon blockchain.
2.  **Deploy the Contract**: Deploy this contract to the Polygon Amoy testnet for staging and eventually to the Polygon mainnet for production.
3.  **Create a Secure Backend Service**: The Next.js server action (`src/lib/actions.ts`) cannot securely hold a private key. You would need a separate, secure backend service (e.g., a simple Node.js server running in a secure environment like Google Cloud Run).
4.  **Fund a Wallet**: This backend service would manage a wallet, which you would need to fund with MATIC to pay for gas fees.
5.  **Update the Server Action**: The `archiveUrl` server action in `src/lib/actions.ts` would be modified. Instead of simulating the transaction, it would make an authenticated API call to your new secure backend service, passing the IPFS hash. The backend service would then use `viem` (or a similar library) to sign and send the real transaction to your deployed `Notary` smart contract. The resulting transaction hash would be returned to the Next.js action to be stored in Firestore.
