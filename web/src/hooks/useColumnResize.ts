import { RefObject, useEffect, useRef } from "react";

export const useColumnResize = (opts: {
  initialWidth: number;
  dragContainerRef: RefObject<HTMLElement>;
  draggerRef: RefObject<HTMLElement>;
  targetRef: RefObject<HTMLElement>;
}) => {
  const widthRef = useRef(opts.initialWidth);
  const isDraggingRef = useRef<boolean>(false);

  const applyStyle = () => {
    if (opts.dragContainerRef.current) {
      opts.dragContainerRef.current.style.userSelect = isDraggingRef.current
        ? "none"
        : "";
      opts.dragContainerRef.current.style.cursor = isDraggingRef.current
        ? "col-resize"
        : "default";
    }
    if (opts.targetRef.current) {
      opts.targetRef.current.style.width = widthRef.current + "px";
    }
  };

  useEffect(() => {
    applyStyle();

    const onMouseDown = (ev: MouseEvent) => {
      if (ev.target === opts.draggerRef.current) {
        isDraggingRef.current = true;
        applyStyle();
      }
    };
    const onMouseMove = (ev: MouseEvent) => {
      if (isDraggingRef.current) {
        widthRef.current = widthRef.current - ev.movementX;
        applyStyle();
      }
    };
    const onMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        applyStyle();
      }
    };

    const el = opts.dragContainerRef.current;
    el?.addEventListener("mousedown", onMouseDown);
    el?.addEventListener("mousemove", onMouseMove);
    el?.addEventListener("mouseup", onMouseUp);

    return () => {
      const el = opts.dragContainerRef.current;
      el?.removeEventListener("mousedown", onMouseDown);
      el?.removeEventListener("mousemove", onMouseMove);
      el?.removeEventListener("mouseup", onMouseUp);
    };
  }, []);
};
