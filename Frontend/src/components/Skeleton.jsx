import { motion } from 'framer-motion';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-white/[0.04] rounded-md ${className}`}
    />
  );
}

export function ResumeCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-white/[0.02] bg-white/[0.01] space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-4 h-4 rounded" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Bot message skeleton */}
      <div className="flex gap-4">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1 max-w-[80%]">
          <Skeleton className="w-full h-20 rounded-2xl rounded-tl-sm" />
          <Skeleton className="w-3/4 h-10 rounded-xl" />
        </div>
      </div>
      {/* User message skeleton */}
      <div className="flex gap-4 flex-row-reverse">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1 max-w-[80%] flex flex-col items-end">
          <Skeleton className="w-2/3 h-16 rounded-2xl rounded-tr-sm" />
        </div>
      </div>
      {/* Bot message skeleton */}
      <div className="flex gap-4">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1 max-w-[80%]">
          <Skeleton className="w-5/6 h-24 rounded-2xl rounded-tl-sm" />
        </div>
      </div>
    </div>
  );
}
