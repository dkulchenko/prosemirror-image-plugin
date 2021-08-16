export default (
  el: Node,
  imageMargin = 50,
  minSize = 50,
  maxSize = 10000
): number => {
  // Ideally, the image should not be wider then its containing element.
  let node = el.parentElement;

  while (node && !node.offsetParent) {
    node = node.parentElement;
  }
  // @ts-ignore
  if (node?.offsetParent && node?.offsetParent?.offsetWidth > 0) {
    const { offsetParent } = node;
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
