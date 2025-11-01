Created for the SFLC.in Hackathon 2025 by team Builders&Breakers

# Veritas Vault

**Veritas Vault** is a user-friendly tool to permanently archive web pages on the decentralized web, creating a resilient and censorship-resistant record of online content. It's a "Save Page As" for the modern, decentralized web.

This project was built for the SFLC.in Hackathon 2025, adhering to all the specified guidelines, including design, functionality, and AI usage transparency.

## Live Demo

**You can access the live application here:** [https://studio--studio-4214731135-f4ef1.us-central1.hosted.app/](https://studio--studio-4214731135-f4ef1.us-central1.hosted.app/)

## Key Features

- **One-Click Archiving**: Simply enter a URL to save a complete snapshot of the page.
- **Decentralized Storage (Simulated)**: Archived content is (simulated) pinned to IPFS, ensuring it remains available even if the original site goes down.
- **Blockchain Notarization (Simulated)**: A record of the archive is (simulated) created on the Polygon blockchain, providing a timestamped, immutable proof of existence.
- **Tagging and Filtering**: Organize archives with tags and easily filter the gallery by title or tag.
- **Real-Time Gallery**: A visually rich gallery of all archived pages that updates instantly as new archives are created.
- **Debounced Search**: Quickly find any archived page by searching for its title or tags.
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
   git clone https://github.com/your-username/veritas-vault.git
   ```
2. Navigate to the project directory:
   ```bash
   cd veritas-vault
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Before running the application, you need to set up your environment variables.

1.  Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```
2.  Open `.env.local` and add your Firebase project credentials. You can find these in your Firebase project settings. You can optionally add API keys for ScreenshotOne and Pinata to enable real screenshots and IPFS uploads.

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
