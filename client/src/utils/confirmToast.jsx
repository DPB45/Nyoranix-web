import React from 'react';
import toast from 'react-hot-toast';

// A non-blocking replacement for window.confirm(), rendered as a toast with
// Cancel / Confirm buttons. Resolves true if confirmed, false if cancelled.
export const confirmToast = (message, confirmLabel = 'Confirm') => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex flex-col p-4 border border-gray-100`}
        >
          <p className="text-sm font-medium text-gray-800 mb-3">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  });
};

export default confirmToast;