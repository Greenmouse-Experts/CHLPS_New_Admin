import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { X } from "lucide-react";

interface ModalProps extends PropsWithChildren {
  actions?: any;
  actionName?: string;
  title?: string;
}

export interface ModalHandle {
  open: () => void;
  close: () => void;
}

const Modal = forwardRef<ModalHandle, ModalProps>(
  ({ children, actions, actionName: _actionName, title }, ref) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    // Track open state so children unmount on close and remount fresh on every
    // open — prevents stale local state / cached data lingering across reopens.
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        modalRef.current?.showModal();
      },
      close: () => {
        modalRef.current?.close();
      },
    }));

    // Sync isOpen when the dialog closes via ESC, backdrop, or programmatically.
    useEffect(() => {
      const dialog = modalRef.current;
      if (!dialog) return;
      const handleClose = () => setIsOpen(false);
      dialog.addEventListener("close", handleClose);
      return () => dialog.removeEventListener("close", handleClose);
    }, []);

    return (
      <dialog ref={modalRef} className="modal modal-middle sm:modal-middle">
        <div className="modal-box bg-base-100 text-base-content border border-base-300 max-w-2xl flex flex-col max-h-[90vh] rounded-2xl shadow-xl relative p-0 overflow-hidden">
          <div className="flex border-b border-base-200 py-4 items-center px-6 bg-base-100">
            {title && (
              <h3 className="font-bold text-lg text-base-content">{title}</h3>
            )}
            <form method="dialog" className="ml-auto">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
                onClick={() => modalRef.current?.close()}
              >
                <X size={18} />
              </button>
            </form>
          </div>
          {isOpen && children && (
            <div className="p-6 overflow-y-auto">{children}</div>
          )}
          {actions && (
            <div className="flex justify-end gap-2 sticky bottom-0 p-4 bg-base-100 border-t border-base-200">
              {actions}
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
