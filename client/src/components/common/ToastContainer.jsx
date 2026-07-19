import useToastStore from '../../stores/toastStore';

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
