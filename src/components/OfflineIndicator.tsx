import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-lg bg-amber-500/90 text-slate-950 px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-xs border border-amber-300">
      <WifiOff className="w-4 h-4 animate-bounce" />
      <span>Offline Mode — All Math Operations Running Locally</span>
    </div>
  );
};
