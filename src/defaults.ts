import { EditorView } from "prosemirror-view";
import { Node as PMNode } from "prosemirror-model";
import { imageAlign, ImagePluginSettings } from "./types";
import { generateChangeAlignment } from "./utils";

export const defaultDeleteSrc = (src: string) => Promise.resolve();

export const defaultUploadFile = (file: Blob): Promise<string> =>
  new Promise((res) =>
    setTimeout(() => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const { result } = reader;

        if (result) {
          res(result.toString());
        }
      });
      reader.readAsDataURL(file);
    }, 200)
  );

export const defaultExtraAttributes = {
  align: imageAlign.center,
};

export const defaultCreateOverlay = (
  node: PMNode,
  getPos: (() => number) | boolean,
  view: EditorView
) => {
  const overlay = document.createElement("div");
  overlay.className = "imagePluginOverlay";
  const alignLeft = document.createElement("button");
  alignLeft.className = "alignLeftButton";
  const alignRight = document.createElement("button");
  alignRight.className = "alignRightButton";
  const alignCenter = document.createElement("button");
  alignCenter.className = "alignCenterButton";
  const alignFullWidth = document.createElement("button");
  alignFullWidth.className = "alignFullWidthButton";

  alignLeft.textContent = imageAlign.left;
  alignLeft.setAttribute("imagealign", imageAlign.left);
  alignRight.textContent = imageAlign.right;
  alignRight.setAttribute("imagealign", imageAlign.right);
  alignCenter.textContent = imageAlign.center;
  alignCenter.setAttribute("imagealign", imageAlign.center);
  alignFullWidth.textContent = imageAlign.fullWidth;
  alignFullWidth.setAttribute("imagealign", imageAlign.fullWidth);

  overlay.appendChild(alignLeft);
  overlay.appendChild(alignRight);
  overlay.appendChild(alignCenter);
  overlay.appendChild(alignFullWidth);

  return overlay;
};

export const defaultUpdateOverlay = (
  overlay: Node,
  getPos: (() => number) | boolean,
  view: EditorView,
  node: PMNode
) => {
  if (overlay instanceof HTMLDivElement) {
    Object.values(imageAlign).map((align) => {
      const targetButton = overlay.querySelector(`button[imagealign=${align}]`);
      if (targetButton instanceof HTMLButtonElement) {
        targetButton.onclick = generateChangeAlignment(
          align,
          getPos,
          view,
          node
        );
      }
      return null;
    });
  }
};

export const defaultSettings: ImagePluginSettings = {
  uploadFile: defaultUploadFile,
  hasTitle: true,
  deleteSrc: defaultDeleteSrc,
  extraAttributes: defaultExtraAttributes,
  createOverlay: defaultCreateOverlay,
  updateOverlay: defaultUpdateOverlay,
  defaultTitle: "Image title",
  defaultAlt: "Image",
};
