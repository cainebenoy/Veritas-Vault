# **App Name**: Veritas Vault

## Core Features:

- URL Archiving: Accepts a URL from the user, fetches the content, and stores it for permanent access.
- Decentralized Storage: Uploads archived content to IPFS via Pinata for censorship resistance.
- Blockchain Notarization: Creates a record on the Polygon blockchain as proof of archiving using a smart contract tool.
- Permanent Link Generation: Generates a permanent link to the archived content via IPFS and a link to the blockchain transaction.
- Content Display: Renders archived HTML content and displays metadata (original URL, archive timestamp, IPFS link, blockchain link).
- Gallery: Displays the title, original URL, and archive date in a grid, fetching items from Firestore.
- Archive status tracking: Display archive status in real-time while the archive process runs

## Style Guidelines:

- Primary color: Deep blue (#293B5F), representing the permanence and authority.
- Background color: Very light gray (#F0F4F8) for a clean, distraction-free experience.
- Accent color: Soft sky blue (#77B5FE), drawing the eye and signalling trust.
- Body and headline font: 'Inter', a modern sans-serif for legibility and a neutral feel.
- Simple, clean icons to represent archiving steps and content types.
- Clean, single-column layout focused on the archive form and content display.
- Subtle loading animations during the archiving process to indicate progress.