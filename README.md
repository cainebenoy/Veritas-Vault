# Veritas Vault
**Veritas Vault** is a user-friendly tool to permanently archive web pages on the decentralized web, creating a resilient and censorship-resistant record of online content. It's a "Save Page As" for the modern, decentralized web.

This project was built for the SFLC.in Hackathon 2025, adhering to all the specified guidelines, including design, functionality, and AI usage transparency.

## Key Features

- **One-Click Archiving**: Simply enter a URL to save a complete snapshot of the page.
- **Decentralized Storage (Simulated)**: Archived content is (simulated) pinned to IPFS, ensuring it remains available even if the original site goes down.
- **Blockchain Notarization (Simulated)**: A record of the archive is (simulated) created on the Polygon blockchain, providing a timestamped, immutable proof of existence.
- **Real-Time Gallery**: A visually rich gallery of all archived pages that updates instantly as new archives are created.
- **Debounced Search**: Quickly find any archived page by searching for its title.
- **Detailed Archive View**: View the fully rendered archived content in a secure `<iframe>`, alongside all relevant metadata like the IPFS hash and blockchain transaction ID.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router and Server Actions)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (for real-time data synchronization)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (for anonymous users to write data)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd veritas-vault
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
To run the app in development mode:
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## AI Usage and Technical Decisions

This project was developed with the assistance of AI tools. 
- For a detailed breakdown of how AI was used, please see the **`AI_USAGE.md`** file.
- For an explanation of the technical architecture and design choices, please refer to **`DECISIONS.md`**.
