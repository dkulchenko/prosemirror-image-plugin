export default (
  maxWidth: number,
  containerWidth: number,
  sourceWidth: number,
  sourceHeight: number,
  completed: boolean,
  nodeWidth?: number,
  nodeHeight?: number
): { width: number; height: number } => {
  const aspectRatio =
    completed && sourceWidth && sourceHeight ? sourceWidth / sourceHeight : 1;
  let width = nodeWidth;
  let height = nodeHeight;
  if (width && !height) {
    height = width / aspectRatio;
  } else if (height && !width) {
    width = height * aspectRatio;
  } else if (!width && !height) {
    width = sourceWidth;
    height = sourceHeight;
  }
  if (width && width > containerWidth) {
    // Scale image to fit its containing space.
    // If the image is not cropped.
    width = containerWidth;
    height = width / aspectRatio;
  }
  return {
    // TODO: Fix type
    // @ts-ignore
    width,
    // @ts-ignore
    height,
  };
};
