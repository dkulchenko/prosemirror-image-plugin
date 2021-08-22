import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { imagePluginClassNames, resizeDirection } from "../../types";

const setHeight = (element: HTMLDivElement, width: number, height: number) => {
  // eslint-disable-next-line no-param-reassign
  element.style.height = `${height}px`;
};

const setWidth = (element: HTMLDivElement, width: number, height: number) => {
  // eslint-disable-next-line no-param-reassign
  element.style.width = `${width}px`;
};

const setSize = (element: HTMLDivElement, width: number, height: number) => {
  // eslint-disable-next-line no-param-reassign
  element.style.height = `${height}px`;
  // eslint-disable-next-line no-param-reassign
  element.style.width = `${width}px`;
};

const resizeFunctions: {
  [direction in resizeDirection]: (
    element: HTMLDivElement,
    width: number,
    height: number
  ) => void;
} = {
  [resizeDirection.left]: setWidth,
  [resizeDirection.topLeft]: setSize,
  [resizeDirection.top]: setHeight,
  [resizeDirection.topRight]: setSize,
  [resizeDirection.right]: setWidth,
  [resizeDirection.bottomRight]: setSize,
  [resizeDirection.bottom]: setHeight,
  [resizeDirection.bottomLeft]: setSize,
};

const createMouseDownHandler =
  (
    direction: resizeDirection,
    wrapper: HTMLDivElement,
    resizeControl: HTMLSpanElement,
    getPos: boolean | (() => number),
    node: Node,
    view: EditorView
  ) =>
  (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    wrapper.classList.add(direction);
    // TODO: end!! remove listeners etc.
    const originX = event.clientX;
    const originY = event.clientY;
    const initialWidth = wrapper.clientWidth;
    const initialHeight = wrapper.clientHeight;
    const aspectRatio = initialWidth / initialHeight;
    const mouseMoveListener = (ev: MouseEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      const updateImageSize = () => {
        const dx = (originX - ev.clientX) * (/left/i.test(direction) ? 1 : -1);
        const dy = (originY - ev.clientY) * (/top/i.test(direction) ? 1 : -1);
        // TODO: Clamp..
        let widthUpdate = Math.round(initialWidth + dx);
        let heightUpdate = Math.round(initialHeight + dy);
        const resizeFunction = resizeFunctions[direction];
        if (resizeFunction === setSize) {
          // TODO 1000 = minsize
          heightUpdate = Math.max(widthUpdate / aspectRatio, 50);
          widthUpdate = heightUpdate * aspectRatio;
        }
        // TODO: Clamp, aspect ratio check!
        resizeFunction(wrapper, widthUpdate, heightUpdate);
      };
      requestAnimationFrame(updateImageSize);
    };
    document.addEventListener("mousemove", mouseMoveListener);
    document.addEventListener(
      "mouseup",
      (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        document.removeEventListener("mousemove", mouseMoveListener);
        wrapper.classList.remove(direction);
        console.log("mouseUp");
        if (typeof getPos !== "function") return;
        const pos = getPos();
        if (!pos) return;
        // TODO: Check why this runs multiple times...
        const attrs = {
          ...node.attrs,
          width: wrapper.clientWidth,
          height: wrapper.clientHeight,
          // TODO: save body width
        };
        const { selection } = view.state;
        const tr = view.state.tr.setNodeMarkup(pos, undefined, attrs);
        console.log("whaddup");
        // tr = tr.setSelection(selection);
        view.dispatch(tr);
      },
      { once: true }
    );
  };

const createResizeControl = (
  wrapper: HTMLDivElement,
  direction: resizeDirection,
  getPos: boolean | (() => number),
  node: Node,
  view: EditorView
) => {
  const resizeControl = document.createElement("span");
  resizeControl.className = `${imagePluginClassNames.imageResizeBoxControl} ${direction}`;
  resizeControl.addEventListener(
    "mousedown",
    createMouseDownHandler(
      direction,
      wrapper,
      resizeControl,
      getPos,
      node,
      view
    )
  );
  wrapper.appendChild(resizeControl);
};

export default (
  height: number,
  width: number,
  getPos: boolean | (() => number),
  node: Node,
  view: EditorView
) => {
  console.log({ height, width });
  const controlsWrapper = document.createElement("div");
  controlsWrapper.className = imagePluginClassNames.imageResizeBoxWrapper;
  const centeredWrapper = document.createElement("div");
  controlsWrapper.appendChild(centeredWrapper);
  centeredWrapper.className = imagePluginClassNames.imageResizeBoxCenter;
  centeredWrapper.style.height = `${height}px`;
  centeredWrapper.style.width = `${width}px`;
  const controlsRoot = document.createElement("div");
  centeredWrapper.appendChild(controlsRoot);
  controlsRoot.className = imagePluginClassNames.imageResizeBox;
  controlsRoot.style.height = `${height}px`;
  controlsRoot.style.width = `${height}px`;
  (Object.keys(resizeDirection) as Array<keyof typeof resizeDirection>).map(
    (direction) =>
      createResizeControl(
        controlsRoot,
        resizeDirection[direction],
        getPos,
        node,
        view
      )
  );
  return controlsWrapper;
};
