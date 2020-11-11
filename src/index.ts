// eslint-disable-next-line import/no-unresolved
import { Plugin, PluginKey } from "prosemirror-state";
import { Fragment, Schema, Slice } from "prosemirror-model";
import { EditorView } from "prosemirror-view";

type imagePluginState = undefined;

const imagePluginKey = new PluginKey("imagePlugin");

export const insertLatexNode = (a: any) => console.log;

export const addImageToCursor = (
  src: string,
  view: EditorView,
  schema: Schema
) => {
  view.dispatch(
    view.state.tr.insert(
      view.state.selection.from,
      schema.nodes.image.create({ src })
    )
  );
};

export const imagePlugin = <T extends Schema>(
  schema: T
): Plugin<imagePluginState, T> =>
  new Plugin({
    key: imagePluginKey,
    props: {
      clipboardTextParser: (text: string) => {
        if (text.match(/^data:image/g)) {
          return new Slice(
            Fragment.from(schema.nodes.image.create({ src: text })),
            0,
            0
          );
        }
        return new Slice(Fragment.from(schema.text(text)), 0, 0);
      },
      handleDOMEvents: {
        // TODO: There might be two kinds of drop events
        //  https://stackoverflow.com/questions/34816849/how-to-access-the-image-data-after-dropping-an-image-from-the-html-part-of-a-web
        drop: (view, event) => {
          const file = event?.dataTransfer?.files?.[0];
          const posData = view.posAtCoords({
            top: event.clientY,
            left: event.clientX,
          });
          const reader = new FileReader();
          reader.onload = () => {
            if (posData?.pos) {
              view.dispatch(
                view.state.tr.insert(
                  posData.pos,
                  schema.nodes.image.create({ src: reader.result })
                )
              );
            }
          };
          if (file) {
            reader.readAsDataURL(file);
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
      // handleDrop: (view, event, slice, moved) => {
      //   console.log({
      //     event,
      //     slice,
      //     moved,
      //     data: event?.dataTransfer.getData("text/plain"),
      //   });
      //   return true;
      // },
      // nodeViews: {
      //   image: (node, view, getPos, decorations) => {
      //     const dom = document.createElement("img");
      //     return {
      //       dom,
      //     };
      //   },
      // },
    },
  });
