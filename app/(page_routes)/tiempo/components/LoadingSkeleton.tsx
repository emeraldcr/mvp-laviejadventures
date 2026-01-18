// LoadingSkeleton.tsx
export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-slate-700 rounded mx-auto" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 bg-slate-700 rounded-2xl" />
        <div className="lg:col-span-2 h-80 bg-slate-700 rounded-2xl" />
      </div>
      <div className="h-96 bg-slate-700 rounded-2xl" />
    </div>
  );
}