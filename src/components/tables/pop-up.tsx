"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { usePopper } from "react-popper";
import Portal from "./Portal";
import { useRouter } from "next/navigation";

export type Actions<T = any> = {
  key: string;
  label: string;
  action: (item: T, router: ReturnType<typeof useRouter>) => any;
  render?: (item: T) => ReactNode | string;
  disabled?: (item: T) => boolean;
  disable_event?: (item: T) => boolean;
};
type currentIndex = number;
export default function PopUp<T>(props: {
  actions: Actions<T>[];
  item: any;
  currentIndex: currentIndex | null;
  setIndex: (index: number | null) => void;
  itemIndex: number;
  disable_event?: (item: T) => boolean;
}) {
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const togglePopup = () => {
    if (props.itemIndex === props.currentIndex) {
      return setIsOpen(true);
    }
    return setIsOpen(false);
  };

  useEffect(() => {
    togglePopup();
  }, [props.currentIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        referenceElement &&
        !referenceElement.contains(event.target as Node)
      ) {
        props.setIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, props.setIndex, referenceElement]);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-end",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });
  const openPopup = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    props.setIndex(props.itemIndex);
  };
  return (
    <>
      <div
        data-theme="nh-light"
        ref={setReferenceElement}
        onClick={openPopup}
        className="btn btn-circle btn-ghost"
      >
        <Menu size={20} className="label cursor-pointer" />
      </div>
      <Portal>
        {isOpen && (
          <div
            data-theme="nh-light"
            ref={(el) => {
              setPopperElement(el);
              popupRef.current = el;
            }}
            className="shadow-lg border border-current/20 rounded-xl bg-base-100 z-50 py-1"
            style={{
              ...styles.popper,
              minWidth: "160px",
            }}
            {...attributes.popper}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu w-full p-1">
              {props?.actions?.map((action) => {
                if (action.disabled && action.disabled(props.item)) {
                  return null;
                }
                return (
                  <li key={action.key}>
                    <a
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          action.disable_event &&
                          action.disable_event(props.item)
                        )
                          return;
                        props.setIndex(null);
                        action.action(props.item, router);
                      }}
                      className={`text-xs py-2 px-3 hover:bg-base-200 rounded-lg cursor-pointer ${action.disable_event && action.disable_event(props.item) ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      {action.render ? action.render(props.item) : action.label}
                    </a>
                  </li>
                );
              })}
            </div>
          </div>
        )}
      </Portal>
    </>
  );
}
