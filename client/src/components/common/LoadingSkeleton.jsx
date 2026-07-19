import { Loader2 } from 'lucide-react';

export default function LoadingSkeleton({ message = 'Loading...' }) {
  return (
    <div className="loader-box">
      <Loader2 className="spinner animate-spin" size={36} />
      <p className="mt-2">{message}</p>
    </div>
  );
}