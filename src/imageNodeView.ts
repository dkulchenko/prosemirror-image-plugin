import { TextSelection } from "prosemirror-state";
import { Node } from "prosemirror-model";
import { ImagePluginSettings } from "./types";
import { EditorView } from "prosemirror-view";

export default (pluginSettings: ImagePluginSettings) => (
  node: Node,
  view: EditorView,
  getPos: (() => number) | boolean
) => {
  const root = document.createElement("div");
  root.className = "imagePluginRoot";
  const image = document.createElement("img");
  image.className = "imagePluginImg";
  const contentDOM = document.createElement("div");
  contentDOM.className = "imagePluginContent";
  root.appendChild(image);
  root.appendChild(contentDOM);

  const overlay = pluginSettings.createOverlay(node, getPos, view);
  if (overlay) {
    root.appendChild(overlay);
    pluginSettings.updateOverlay(overlay, getPos, view, node);
  }

  // Handle image
  image.alt = node.attrs.alt;
  image.src = node.attrs.src;

  // Handle contentDOM
  contentDOM.addEventListener("click", (e) => {
    if (
      !getPos ||
      typeof getPos !== "function" ||
      contentDOM.innerText.length > 1
    ) {
      return;
    }
    e.preventDefault();
    view.dispatch(
      view.state.tr.setSelection(
        TextSelection.near(view.state.doc.resolve(getPos() + 1))
      )
    );
    view.focus();
  });
  contentDOM.className = "text";

  const updateDOM = (updatedNode: Node) => {
    Object.keys(updatedNode.attrs).map((attr) =>
      root.setAttribute(`imageplugin-${attr}`, updatedNode.attrs[attr])
    );
  };
  updateDOM(node);

  return {
    dom: root,
    contentDOM,
    selectable: true,
    content: "text*",
    update: (updateNode: Node) => {
      if (overlay)
        pluginSettings.updateOverlay(overlay, getPos, view, updateNode);
      updateDOM(updateNode);
      return true;
    },
    stopEvent: (e: Event) => e.target === contentDOM,
    ignoreMutation: () => false,
    destroy: () => {
      pluginSettings.deleteSrc(node.attrs.src);
    },
  };
};
