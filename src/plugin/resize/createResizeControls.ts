import { imagePluginClassNames, resizeDirection } from "../../types";

const createResizeControl = (
  wrapper: HTMLDivElement,
  direction: resizeDirection
) => {
  const resizeControl = document.createElement("span");
  resizeControl.className = `${imagePluginClassNames.imageResizeBoxControl} ${direction}`;
  wrapper.appendChild(resizeControl);
};

export default (height: number, width: number) => {
  const controlsRoot = document.createElement("div");
  controlsRoot.className = imagePluginClassNames.imageResizeBox;
  controlsRoot.style.height = `${height}px`;
  controlsRoot.style.width = `${width}px`;
  (Object.keys(resizeDirection) as Array<keyof typeof resizeDirection>).map(
    (direction) => createResizeControl(controlsRoot, resizeDirection[direction])
  );
  return controlsRoot;
};
