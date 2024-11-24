interface PinDropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (useGeolocation: boolean) => void;
  coordinates: { lat: number; lng: number } | null;
}

export function PinDropDialog({ isOpen, onClose, onConfirm, coordinates }: PinDropDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Report Rat Sighting
        </h3>
        
        <div className="space-y-4">
          <button
            onClick={() => onConfirm(true)}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span>🐀</span>
            Report here {/* This will now use current location */}
          </button>

          <button
            onClick={() => onConfirm(false)}
            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span>📍</span>
            Use clicked location
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-slate-400 hover:text-slate-300 rounded-lg"
          >
            Cancel
          </button>
        </div>

        {coordinates && (
          <div className="mt-4 text-xs text-slate-400">
            Selected location: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
}