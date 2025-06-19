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

```bash
git clone https://github.com/yourusername/chess-in-lan.git
```
```bash
cd chess-in-lan
```

### Install Dependencies

Use npm or yarn:

```bash
npm install
```
or

yarn install


### Run Development Server

Start the dev server:

```bash
npm run dev
```

or

```bash
yarn dev
```

or

```bash
yarn dev
```


Open http://localhost:3000 in your browser.

---

## Usage

1. Create Room:
   - Enter your name.
   - Enter a room name.
   - Click "Create Room" to generate a unique room code.
   - Share the room code with your opponent on the same LAN.

2. Join Room:
   - Enter your name.
   - Enter the room code provided by the creator.
   - Click "Join Room".

3. Gameplay:
   - Moves are synced in real-time.
   - Timers countdown per player.
   - Captured pieces and move history are displayed.
   - Winner is announced at checkmate or timeout.
   - Room creator can restart or end the game.

4. Post Game:
   - Losers are redirected to the landing page after 15 seconds.
   - Creators can end rooms anytime, disconnecting players.

---

## Project Structure

- /app
  - /api
    - /room
      - validate/route.ts      # Room validation API
    - socket/route.ts          # Socket.IO server API route
  - /play
    - page.tsx                 # Play page with ChessBoard component
- /components
  - ChessBoard.tsx             # Main chessboard and gameplay UI component
  - RoomCode.tsx               # Room code display component
- /constants
  - index.tsx                  # Contains thinking dialogues and constants
- /public
  - /images                    # Assets like chess pieces, background images, logos, etc.

---

## WebSocket Events

| Event         | Direction       | Payload                          | Description                      |
| ------------- | --------------- | --------------------------------| ------------------------------- |
| join          | Client → Server | { room, name, role }             | Join or create a room           |
| player-joined | Server → Client | { name }                        | Notify room that a player joined|
| room-creator  | Server → Client | { name }                        | Send creator's name to joiner   |
| move          | Client → Server | { room, move }                  | Send chess move                 |
| opponent-move | Server → Client | { move }                       | Receive opponent's move         |
| restart       | Client ↔ Server| { room }                       | Restart game                   |
| end-room      | Client ↔ Server| { room, winner, reason }       | End room with winner and reason |
| timer-update  | Server → Client| { white, black, active }        | Sync timers                    |
| check-room    | Client → Server| { room }                       | Validate if room exists         |
| room-exists   | Server → Client| boolean                        | Response for room validation    |

---

## Contributions

Contributions are welcome! Please fork the repo and submit pull requests.

---

## License

MIT License © 2025 Your Name

---

## Acknowledgements

- chess.js - Chess game logic  
- react-chessboard - Chessboard UI  
- socket.io - Real-time communication  
- canvas-confetti - Confetti animations  
- react-hot-toast - Toast notifications  

---

## Contact

For questions or support, contact: your.email@example.com

---

Enjoy your game! 🏆



