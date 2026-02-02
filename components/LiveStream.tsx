"use client";

export default function LiveStream({
  status,
}: {
  status: string;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
        <div className="min-w-0">
          <div className="text-xs tracking-widest text-white/60">LIVE</div>
          <h2 className="truncate text-lg font-extrabold">Demo Stream Title</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Live
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              Session <span className="font-semibold text-white/80">{status}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary btn">Follow</button>
          <button className="btn-primary btn">Subscribe</button>
        </div>
      </div>

      <div className="relative aspect-video w-full">
        <img
          src="https://images.unsplash.com/photo-1520975958225-317b0b41f1f2?auto=format&fit=crop&w=1600&q=80"
          alt="Stream placeholder"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white/90 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Live
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white/80 backdrop-blur">
            1080p
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 backdrop-blur hover:bg-white/15">
              Play
            </button>
            <div className="h-2 flex-1 rounded-full bg-white/10">
              <div className="h-2 w-2/5 rounded-full bg-violet-500/80" />
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>00:13:22</span>
              <span className="text-white/30">/</span>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm font-semibold">About this stream</div>
        <p className="mt-1 text-sm text-white/70">
          Layout-only placeholder. Replace the image with your video player later.
        </p>
      </div>
    </div>
  );
}
