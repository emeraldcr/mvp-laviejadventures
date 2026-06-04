export function GarageLoading() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#10141b]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <p className="text-sm tracking-[2px] text-white/60">LOADING VEHICLE...</p>
      </div>
    </div>
  );
}