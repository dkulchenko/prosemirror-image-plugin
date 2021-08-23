import { TextSelection } from "prosemirror-state";
import { Node } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { imagePluginClassNames, ImagePluginSettings } from "../types";
import createResizeControls from "./resize/createResizeControls";
import getImageDimensions from "./resize/getImageDimensions";
import getMaxWidth from "./resize/getMaxWidth";
import calculateImageDimensions from "./resize/calculateImageDimensions";

const imageNodeView =
  (pluginSettings: ImagePluginSettings) =>
  (
    node: Node,
    view: EditorView,
    getPos: (() => number) | boolean
  ): NodeView => {
    const root = document.createElement("div");
    root.className = imagePluginClassNames.imagePluginRoot;
    const image = document.createElement("img");
    image.className = imagePluginClassNames.imagePluginImg;
    root.appendChild(image);
    Object.keys(node.attrs).map((key) =>
      root.setAttribute(`imageplugin-${key}`, node.attrs[key])
    );
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

    // - cache promises, do sync stuff if they're cached
    // - re-draw the whole thing with updateDOM
    // Handle image
    image.alt = node.attrs.alt;
    if (pluginSettings.downloadImage) {
      if (pluginSettings.downloadPlaceholder)
        // If resize is enabled then set placeholder size to image size ( if there's image size already )
        // If resize is enabled then maybe set width and height props on image when it's inserted into the doc?
        image.src = pluginSettings.downloadPlaceholder;
      pluginSettings.downloadImage(node.attrs.src).then((src) => {
        // If resize is enabled then get image size, then load the image, set size
        image.src = src;
      });
    } else {
    }
    let resizeControls: HTMLDivElement | undefined;
    const updateDOM = (
      updatedNode: Node,
      oldResizeControls: HTMLDivElement | undefined
    ) => {
      Object.keys(updatedNode.attrs).map((attr) =>
        root.setAttribute(`imageplugin-${attr}`, updatedNode.attrs[attr])
      );
      if (!pluginSettings.downloadImage) {
        // If resize is enabled then get image size, then load the image, set size
        if (pluginSettings.enableResize) {
          getImageDimensions(updatedNode.attrs.src).then((dimensions) => {
            const maxWidth = getMaxWidth(root);
            const finalDimensions = calculateImageDimensions(
              maxWidth,
              maxWidth,
              dimensions.width,
              dimensions.height,
              dimensions.completed,
              updatedNode.attrs.width,
              updatedNode.attrs.height
            );
            image.style.height = `${finalDimensions.height}px`;
            image.style.width = `${finalDimensions.width}px`;
            if (resizeControls) {
              resizeControls.remove();
            }
            resizeControls = createResizeControls(
              finalDimensions.height,
              finalDimensions.width,
              getPos,
              updatedNode,
              view
            );
            root.appendChild(resizeControls);
          });
        }
        image.src = updatedNode.attrs.src;
      }
    };
    updateDOM(node, resizeControls);

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
        if (updateNode.type.name !== "image") {
          return false;
        }
        if (overlay)
          pluginSettings.updateOverlay(overlay, getPos, view, updateNode);
        // maybe requestanimationframe here?
        updateDOM(updateNode, resizeControls);
        return true;
      },
      ignoreMutation: () => true,
      destroy: () => {
        console.log("destroy");
        pluginSettings.deleteSrc(node.attrs.src);
      },
    };
  };

export default imageNodeView;
