"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function HomePage() {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const router = useRouter();

  const generateRoomCode = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  };

  const handleToggle = (mode: "create" | "join") => {
    const isCreating = mode === "create";
    setIsCreatingRoom(isCreating);
    if (isCreating) {
      setRoomCode(generateRoomCode());
    } else {
      setRoomCode("");
      setRoomName("");
    }
  };

  const handleSubmit = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name.", { icon: "⚠️" });
      return;
    }
    if (!roomCode.trim()) {
      toast.error("Please enter a room code.", { icon: "⚠️" });
      return;
    }
    if (isCreatingRoom && !roomName.trim()) {
      toast.error("Please enter a room name.", { icon: "⚠️" });
      return;
    }

    const role = isCreatingRoom ? "creator" : "joiner";

    if (isCreatingRoom) {
      router.push(
        `/play?room=${roomCode}&name=${playerName}&role=${role}&roomName=${encodeURIComponent(
          roomName
        )}`
      );
    } else {
      const socket = io("ws://192.168.31.229:3000", { path: "/api/socket" });
      socket.emit("check-room", { room: roomCode });
      socket.on("room-exists", (exists: boolean) => {
        if (exists) {
          router.push(`/play?room=${roomCode}&name=${playerName}&role=${role}`);
        } else {
          toast.error("Invalid room code! Room does not exist.", { icon: "❌" });
        }
        socket.disconnect();
      });
    }
  };

  return (
    <main className="relative flex min-h-screen bg-dark text-white font-sans overflow-hidden">

      <div className="absolute inset-0 -z-10">

        <div className="w-full h-full bg-[url('/images/chessboard_pattern.svg')] opacity-10 bg-repeat" />

        <Image
          src="/images/knight_shadow.svg"
          alt="Chess Knight Shadow"
          width={500}
          height={500}
          className="absolute top-10 left-0 opacity-30 blur-2xl pointer-events-none"
        />

        <Image
          src="/images/pawn.svg"
          alt="Floating Pawn"
          width={40}
          height={40}
          className="absolute bottom-20 right-10 opacity-30 animate-floatSlow"
        />

        <div className="absolute left-1/4 top-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl animate-pulseGlow pointer-events-none" />
      </div>

      <div className="flex flex-col justify-center items-start w-full md:w-1/1 p-8 md:p-16 z-10 space-y-8">

        <div className="flex flex-row items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center shadow-inner">
            <Image
              src="/images/chess_logo.svg"
              alt="Chess Knight Logo"
              width={56}
              height={56}
              className="opacity-90"
            />
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="text-4xl font-extrabold text-brand drop-shadow-md animate-pulse select-none">
              Play Chess
            </h1>
            <span className="text-lg font-semibold text-white/80 select-none">
              Local Network Chess Arena
            </span>
          </div>
        </div>

        <div className="relative w-full max-w-md flex rounded-full bg-white/10 p-1 shadow-inner backdrop-blur-sm border border-white/20">
          <button
            onClick={() => handleToggle("join")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full flex-1 font-semibold text-sm md:text-base transition-all duration-300 ease-in-out cursor-pointer
              ${!isCreatingRoom
                ? "bg-white text-black shadow-inner"
                : "text-white hover:bg-white/10 hover:animate-tabWiggle"
              }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            Join Room
          </button>
          <button
            onClick={() => handleToggle("create")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full flex-1 font-semibold text-sm md:text-base transition-all duration-300 ease-in-out cursor-pointer
              ${isCreatingRoom
                ? "bg-white text-black shadow-inner"
                : "text-white hover:bg-white/10 hover:animate-tabWiggle"
              }`}
          >
            <PlusIcon className="w-5 h-5" />
            Create Room
          </button>
        </div>

        <div className="w-full max-w-md p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-brand/20 shadow-inner space-y-6 mt-6">

          <div className="relative z-0">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="peer w-full bg-transparent border border-muted rounded-md px-3 pt-5 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
              required
            />
            <label
              className={`absolute left-3 z-20 bg-[#181717] px-1 text-gray-400 transition-all duration-200 pointer-events-none
                ${playerName ? "-top-2 text-sm text-brand" : "top-3.5"}
                peer-focus:-top-2 peer-focus:text-sm peer-focus:text-brand`}
            >
              Your Name
            </label>
          </div>

          {isCreatingRoom && (
            <div className="relative z-0">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="peer w-full bg-transparent border border-muted rounded-md px-3 pt-5 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
                required
              />
              <label
                className={`absolute left-3 z-20 bg-[#181717] px-1 text-gray-400 transition-all duration-200 pointer-events-none
                  ${roomName ? "-top-2 text-sm text-brand" : "top-3.5"}
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-brand`}
              >
                Room Name
              </label>
            </div>
          )}

          <div className="relative z-0">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              readOnly={isCreatingRoom}
              className={`peer w-full bg-transparent border ${isCreatingRoom ? "border-gray-400 cursor-not-allowed" : "border-muted"
                } rounded-md px-3 pt-5 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition`}
              required
            />
            <label
              className={`absolute left-3 z-20 bg-[#181717] px-1 text-gray-400 transition-all duration-200 pointer-events-none
                ${roomCode ? "-top-2 text-sm text-brand" : "top-3.5"}
                peer-focus:-top-2 peer-focus:text-sm peer-focus:text-brand`}
            >
              {isCreatingRoom ? "Generated Room Code" : "Room Code"}
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            className="w-full flex justify-center items-center gap-2 py-3 rounded-full border border-brand bg-transparent text-brand font-semibold shadow-md hover:bg-white/10 hover:animate-tabWiggle transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand/60 cursor-pointer"
          >
            {isCreatingRoom ? <PlusIcon className="w-5 h-5" /> : <UserGroupIcon className="w-5 h-5" />}
            <span>{isCreatingRoom ? "Create Room" : "Join Room"}</span>
          </button>

        </div>
      </div>

      <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full">
        <Image
          src="/images/chess_landing_bg.svg"
          alt="Chess Board"
          fill
          className="object-contain opacity-90"
        />
      </div>
    </main>
  );
}
