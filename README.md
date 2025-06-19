# Play Chess

Local Network Chess Arena

![Play Chess](./public/images/chess_logo.svg)

Replace the following line with your actual Quick Look video URL or local path:

<p align="center">
  <video width="640" height="360" controls autoplay muted loop>
    <source src="path/to/your-quicklook-video.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</p>

---

## Overview

Play Chess is a real-time multiplayer chess game designed to be played over a local network. It allows players to create or join private rooms, challenge friends, and enjoy classic chess with time controls and a sleek modern interface. The game syncs moves instantly, includes chat-like thinking dialogues, timers, move history, captured pieces display, and end-of-game handling with confetti celebration.

---

## Features

- Create or Join Rooms: Easily create a private room or join an existing one via room code.
- Real-Time Gameplay: Moves are synced instantly between two players using WebSocket (socket.io).
- Time Controls: Configurable timer with countdown for both players.
- Captured Pieces Display: Shows captured pieces for both players.
- Move History: Track all moves made during the game.
- Thinking Dialogues: Fun real-time status messages to simulate player thinking.
- End Game Handling: Detects checkmate, timeouts, and room end events with notifications.
- Responsive UI: Clean and intuitive interface with animations and sound feedback.
- LAN Play: Runs locally, designed for LAN usage, no external server dependency needed.
- Admin Controls: Room creators can restart or end the game.
- Automatic Redirect: Losers are redirected to the landing page after 15 seconds.

---

## Technology Stack

- Frontend: React, Next.js 13, TypeScript, Tailwind CSS, react-chessboard
- Backend: Node.js, Socket.IO, Next.js API routes
- Real-time Communication: WebSockets using Socket.IO
- Animations: Canvas Confetti for celebrations
- Notifications: react-hot-toast for user feedback

---

## Installation & Setup

### Prerequisites

- Node.js >= 16.x
- Yarn or npm
- Local network for LAN play

### Clone Repository

Run the following commands in your terminal:

