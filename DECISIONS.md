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
- **Client-Side State**: The form's state, including the progress updates and final success/error messages, is managed on the client using React hooks (`useState`, `useEffect`, `useFormState`). This provides a responsive and interactive experience without requiring full page reloads.

### Archive Gallery
- **Visual Discovery**: We decided a gallery of previously archived pages was essential for discoverability. The `ArchiveCard` component displays a screenshot, title, and original URL, making it easy to browse.
- **Server-Side Rendering**: The main gallery (`ArchiveGallery`) is a Server Component. This means the data is fetched and rendered on the server, which is good for SEO and initial page load performance. We used a `Suspense` boundary with a `GallerySkeleton` component to provide an instant loading state while the data is fetched.

### Detailed Archive View
- **Content and Metadata**: When a user views a specific archive, we show both the archived content itself and the critical metadata (original URL, IPFS link, blockchain transaction hash).
- **Safe Content Display**: The archived HTML content is displayed within an `<iframe>` with the `sandbox="allow-same-origin"` attribute. This is a security measure to prevent the archived content's scripts from running and potentially compromising our application.

## 4. Decentralization (Simulated)

For this hackathon prototype, the interactions with decentralized services are simulated to focus on the application logic and user experience.

- **Content Fetching**: In a real application, this would involve a robust backend service that can render JavaScript-heavy pages (e.g., using a headless browser like Puppeteer).
- **IPFS Upload**: We simulate the upload process. A production version would use a service like Pinata or a local IPFS node to pin the content.
- **Blockchain Notarization**: The Polygon transaction is simulated. A real implementation would involve a smart contract on the Polygon network to record the IPFS hash and timestamp, and a backend service to pay for the gas fees.

By focusing on a polished frontend and clear user flow, we've built a strong foundation that could be connected to these real backend services in the future.
