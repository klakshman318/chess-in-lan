![Play Chess](./public/images/chess_logo.svg)

# 🎲 Play Chess
**Local Network Chess Arena**

<p align="center">
  <video width="640" height="360" controls autoplay muted loop>
    <source src="play_chess_demo_preview.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</p>

---

## 🚀 Overview

Play Chess is a **real-time multiplayer chess game** designed for local network play. Create or join private rooms, challenge friends, and enjoy classic chess with:

- Instant move syncing via WebSockets
- Time controls and countdowns
- Captured pieces display & move history
- Fun thinking dialogues and confetti celebration on wins
- Clean, responsive UI for smooth gameplay

## ✨ Features

- 🏠 **Create or Join Rooms** — Easy room creation & joining with unique codes  
- ⚡ **Real-Time Gameplay** — Synchronized moves using WebSocket (socket.io)  
- ⏱️ **Time Controls** — Configurable timer with countdown per player  
- ♟️ **Captured Pieces Display** — See which pieces have been captured  
- 📜 **Move History** — Track all moves made in the game  
- 💬 **Thinking Dialogues** — Real-time player thinking messages  
- 🏆 **End Game Handling** — Detects checkmate, timeouts, and room end  
- 📱 **Responsive UI** — Beautiful, intuitive interface with animations  
- 🌐 **LAN Play** — Runs locally without external server dependencies  
- 🛠️ **Admin Controls** — Creators can restart or end games  
- 🔄 **Automatic Redirect** — Losers are redirected after 15 seconds  

## 🛠️ Technology Stack

- **Frontend:** React, Next.js 13, TypeScript, Tailwind CSS, react-chessboard  
- **Backend:** Node.js, Socket.IO, Next.js API routes  
- **Real-time Communication:** WebSockets with Socket.IO  
- **Animations:** Canvas Confetti  
- **Notifications:** react-hot-toast  

## ⚙️ Installation & Setup

### Prerequisites

- Node.js >= 16.x  
- Yarn or npm  
- Local network for LAN play  

### Clone Repository

```bash
git clone https://github.com/yourusername/chess-in-lan.git
cd chess-in-lan
```

### Install Dependencies

Use npm or yarn:

```bash
npm install
# or
yarn install
```


### Run Development Server

Start the dev server:

```bash
npm run dev
# or
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

## 📁 Project Structure

```bash
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
```

## 🔌 WebSocket Events

```bash
+---------------+------------------+------------------------------+-------------------------------------+
| Event         | Direction        | Payload                      | Description                         |
+---------------+------------------+------------------------------+-------------------------------------+
| join          | Client -> Server | { room, name, role }          | Join or create a room               |
| player-joined | Server -> Client | { name }                     | Notify room that a player joined    |
| room-creator  | Server -> Client | { name }                     | Send creator's name to joiner       |
| move          | Client -> Server | { room, move }               | Send chess move                    |
| opponent-move | Server -> Client | { move }                    | Receive opponent's move             |
| restart       | Client <-> Server| { room }                    | Restart game                      |
| end-room      | Client <-> Server| { room, winner, reason }    | End room with winner and reason    |
| timer-update  | Server -> Client | { white, black, active }     | Sync timers                       |
| check-room    | Client -> Server | { room }                    | Validate if room exists             |
| room-exists   | Server -> Client | boolean                     | Response for room validation        |
+---------------+------------------+------------------------------+-------------------------------------+
```

## Acknowledgements

- chess.js - Chess game logic  
- react-chessboard - Chessboard UI  
- socket.io - Real-time communication  
- canvas-confetti - Confetti animations  
- react-hot-toast - Toast notifications  

### Enjoy your game! 🏆

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, open an issue or submit a pull request.

1. Fork the repo
2. Create a new branch
3. Commit changes
4. Push and create a PR

![License](https://img.shields.io/badge/license-MIT-green)



