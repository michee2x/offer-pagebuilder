"use client";

import { SignupForm } from "@/components/SignupForm";

const imageTiles = [
  {
    id: "1",
    style: {
      backgroundImage:
        "linear-gradient(135deg, rgba(245,166,35,0.15), rgba(15,23,42,0.8)), url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=60')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  },
  {
    id: "2",
    style: {
      backgroundImage:
        "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(15,23,42,0.84)), url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=60')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  },
  {
    id: "3",
    style: {
      backgroundImage:
        "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(15,23,42,0.82)), url('https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=600&q=60')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  },
  {
    id: "4",
    style: {
      backgroundImage:
        "linear-gradient(135deg, rgba(168,85,247,0.16), rgba(15,23,42,0.84)), url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=60')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  },
  {
    id: "5",
    style: {
      backgroundImage:
        "linear-gradient(135deg, rgba(239,68,68,0.16), rgba(15,23,42,0.84)), url('https://images.unsplash.com/photo-1517260912823-20353b5b8b42?auto=format&fit=crop&w=600&q=60')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  },
  {
    id: "6",
    style: {
      backgroundImage:
        "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(15,23,42,0.84)), url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=60')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  },
];

export default function SignupPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-10 text-white">
      <div className="pointer-events-none hidden xl:grid fixed top-8 right-8 z-10 h-[calc(100vh-64px)] w-[420px] grid-cols-2 grid-rows-3 gap-2 px-1">
        {imageTiles.map((tile) => (
          <div
            key={tile.id}
            className="aspect-square overflow-hidden rounded-none border border-white/10 bg-slate-950/80 shadow-[0_20px_90px_-65px_rgba(0,0,0,0.9)]"
            style={tile.style}
          />
        ))}
      </div>
      <div className="relative flex min-h-[calc(100vh-80px)] items-start justify-start pl-6 xl:pl-16 pt-8">
        <SignupForm />
      </div>
    </div>
  );
}
