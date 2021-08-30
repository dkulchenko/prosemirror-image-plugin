import { ImagePluginSettings } from "../../types";

export default (el: Node, pluginSettings: ImagePluginSettings): number => {
  const { imageMargin, minSize, maxSize } = pluginSettings;
  let node = el.parentElement;

  while (node && !node.offsetParent) {
    node = node.parentElement;
  }
  const offsetParent = node?.offsetParent;
  if (offsetParent instanceof HTMLElement && offsetParent?.offsetWidth > 0) {
    const style =
      el?.ownerDocument?.defaultView?.getComputedStyle(offsetParent);
    let width = offsetParent.clientWidth - imageMargin * 2;

    if (style?.boxSizing === "border-box") {
      const pl = parseInt(style.paddingLeft, 10);
      const pr = parseInt(style.paddingRight, 10);
      width -= pl + pr;
    }

    return Math.max(width, minSize);
  }
  return maxSize;
};