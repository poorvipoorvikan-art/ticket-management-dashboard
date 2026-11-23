import { useAppSelector } from "../../hooks/useAppSelector";

export default function ConnectionStatus() {
  const { connectionStatus, connectionError } = useAppSelector(
    (state) => state.notifications
  );

  const statusConfig = {
    connecting: {
      label: "Connecting",
      color: "bg-amber-500",
      text: "text-amber-600"
    },
    connected: {
      label: "Connected",
      color: "bg-emerald-500",
      text: "text-emerald-600"
    },
    disconnected: {
      label: "Disconnected",
      color: "bg-rose-500",
      text: "text-rose-600"
    },
    reconnecting: {
      label: "Reconnecting",
      color: "bg-amber-500",
      text: "text-amber-600"
    }
  };

  const config = statusConfig[connectionStatus];

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-2 py-2"
      title={connectionError ?? `WebSocket: ${config.label}`}
      role="status"
      aria-live="polite"
    >
      <span className={`size-2 rounded-full ${config.color}`} />
      <span className={`hidden text-[11px] font-semibold sm:inline ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}