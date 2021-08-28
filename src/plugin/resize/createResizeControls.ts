import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import {
  imagePluginClassNames,
  ImagePluginSettings,
  resizeDirection,
} from "../../types";
import { resizeFunctions, setSize } from "./utils";

const createMouseDownHandler =
  (
    direction: resizeDirection,
    wrapper: HTMLDivElement,
    resizeControl: HTMLSpanElement,
    getPos: boolean | (() => number),
    node: Node,
    view: EditorView,
    image: HTMLImageElement,
    setResizeActive: (value: boolean) => void,
    maxWidth: number,
    pluginSettings: ImagePluginSettings
  ) =>
  (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setResizeActive(true);
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
        const dx =
          (originX - ev.clientX) *
          (/left/i.test(direction) ? 1 : -1) *
          (node.attrs.align === "center" ? 2 : 1);
        const dy =
          (originY - ev.clientY) *
          (/top/i.test(direction) ? 1 : -1) *
          (node.attrs.align === "center" ? 2 : 1);
        // TODO: Clamp.., get maxwidth!
        let widthUpdate = Math.min(maxWidth, Math.round(initialWidth + dx));
        let heightUpdate = Math.round(initialHeight + dy);
        const resizeFunction = resizeFunctions[direction];
        if (resizeFunction === setSize) {
          // TODO 1000 = minsize
          heightUpdate = Math.max(widthUpdate / aspectRatio, 50);
          widthUpdate = heightUpdate * aspectRatio;
        }
        // TODO: Clamp, aspect ratio check!
        const parent = wrapper.parentElement;
        if (!parent) return;
        resizeFunction(image, widthUpdate, heightUpdate);
        resizeFunction(parent, widthUpdate, heightUpdate);
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
        setResizeActive(false);
        document.removeEventListener("mousemove", mouseMoveListener);
        wrapper.classList.remove(direction);
        if (typeof getPos !== "function") return;
        const pos = getPos();
        if (!pos) return;
        const currentNode = view.state.doc.nodeAt(getPos());
        if (currentNode?.type.name !== "image") {
          return;
        }
        const attrs = {
          ...currentNode.attrs,
          width: wrapper.clientWidth,
          height: wrapper.clientHeight,
          maxWidth: maxWidth
        };
        const tr = view.state.tr.setNodeMarkup(pos, undefined, attrs);
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
  view: EditorView,
  image: HTMLImageElement,
  setResizeActive: (value: boolean) => void,
  maxWidth: number,
  pluginSettings: ImagePluginSettings
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
      view,
      image,
      setResizeActive,
      maxWidth,
      pluginSettings
    )
  );
  wrapper.appendChild(resizeControl);
};

export default (
  height: number,
  width: number,
  getPos: boolean | (() => number),
  node: Node,
  view: EditorView,
  image: HTMLImageElement,
  setResizeActive: (value: boolean) => void,
  maxWidth: number,
  pluginSettings: ImagePluginSettings
) => {
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
  controlsRoot.style.width = `${width}px`;
  (Object.keys(resizeDirection) as Array<keyof typeof resizeDirection>).map(
    (direction) =>
      createResizeControl(
        controlsRoot,
        resizeDirection[direction],
        getPos,
        node,
        view,
        image,
        setResizeActive,
        maxWidth,
        pluginSettings
      )
  );
  return controlsWrapper;
};
