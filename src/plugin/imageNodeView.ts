import { TextSelection } from "prosemirror-state";
import { Node } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { ImagePluginSettings } from "../types";

const imageNodeView = (pluginSettings: ImagePluginSettings) => (
  node: Node,
  view: EditorView,
  getPos: (() => number) | boolean
): NodeView => {
  const root = document.createElement("div");
  root.className = "imagePluginRoot";
  const image = document.createElement("img");
  image.className = "imagePluginImg";
  root.appendChild(image);
  const contentDOM = pluginSettings.hasTitle && document.createElement("div");
  if (contentDOM) {
    contentDOM.className = "imagePluginContent";
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
    root.appendChild(contentDOM);
  }

  const overlay = pluginSettings.createOverlay(node, getPos, view);
  if (overlay) {
    root.appendChild(overlay);
    pluginSettings.updateOverlay(overlay, getPos, view, node);
  }

  // Handle image
  image.alt = node.attrs.alt;
  image.src = node.attrs.src;

  const updateDOM = (updatedNode: Node) => {
    Object.keys(updatedNode.attrs).map((attr) =>
      root.setAttribute(`imageplugin-${attr}`, updatedNode.attrs[attr])
    );
  };
  updateDOM(node);

  return {
    ...(contentDOM
      ? {
          contentDOM,
          stopEvent: (e: Event) => e.target === contentDOM,
          selectable: true,
          content: "text*",
        }
      : {}),
    dom: root,
    update: (updateNode: Node) => {
      if (overlay)
        pluginSettings.updateOverlay(overlay, getPos, view, updateNode);
      updateDOM(updateNode);
      return true;
    },
    ignoreMutation: () => false,
    destroy: () => {
      pluginSettings.deleteSrc(node.attrs.src);
    },
  };
};

export default imageNodeView;
