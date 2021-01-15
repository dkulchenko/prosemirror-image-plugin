# prosemirror-image-plugin

![alt text](https://gitlab.com/emergence-engineering/prosemirror-image-plugin/-/raw/master/public/editorScreenshot.png)

By [Viktor Váczi](https://emergence-engineering.com/cv/viktor) at [Emergence Engineering](https://emergence-engineering.com/)

Try it out at <https://emergence-engineering.com/blog/prosemirror-image-plugin>
# Features

- Drag and drop or paste images from anywhere
- Upload images to endpoints, showing placeholder until the upload finishes, and optionally delete 
  images when the image is removed from the document
- Customizable overlay for alignment ( or whatever you think of! )
- Optional image title

# How to use 

```typescript
import { schema } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { defaultSettings } from "prosemirror-image-plugin";

// Update your settings here!
const imageSettings = {...defaultSettings};

const imageSchema = new Schema({
  nodes: updateImageNode(schema.spec.nodes, {
    ...imageSettings,
  }),
  marks: schema.spec.marks,
});

const initialDoc = {
  content: [
    {
      content: [
        {
          text: "Start typing!",
          type: "text",
        },
      ],
      type: "paragraph",
    },
  ],
  type: "doc",
};

const state = EditorState.create({
  doc: imageSchema.nodeFromJSON(initialDoc),
  plugins: [
    ...exampleSetup({
      schema: imageSchema,
      menuContent: menu,
    }),
    imagePlugin(imageSchema, { ...imageSettings }),
  ],
});

const view: EditorView = new EditorView(document.getElementById("editor"), {
  state,
});
```

# Configuration
### `ImagePluginSettings`

| name            | type                                                                                                 | description                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| uploadFile      |  (file: File) => Promise<string>                                                                     | Uploads the image file to a remote server and returns the uploaded image URL. By default it returns the dataURI of the image. |
| deleteSrc       | (src: string) => Promise<void>                                                                       | Deletes the image from the server.                                                                                            |
| hasTitle        | boolean                                                                                              | If set to `true` then the image has a title field. True by default.                                                           |
| extraAttributes | Record<string, string &#124; null>                                                                   | Extra attributes on the new `image` node. By default is `defaultExtraAttributes`.                                             |
| createOverlay   | ( node: PMNode, getPos: (() => number)  &#124; boolean, view: EditorView) => Node  &#124; undefined  | create an overlay DOM Node for the `image` node. The default is the one you see in the intro image.                           |
| updateOverlay   | ( overlayRoot: Node, getPos: (() => number)  &#124; boolean, view: EditorView, node: PMNode) => void | The function that runs whenever the `image` ProseMirror node changes to update the overlay.                                   |
| defaultTitle    | string                                                                                               | Default title on new images.                                                                                                  |
| defaultAlt      | string                                                                                               | Default alt on new images ( when it's not defined ).                                                                          |

### `updateImageNode`

Arguments


| index | name           | type                      | description                                              |
|-------|----------------|---------------------------|----------------------------------------------------------|
| 1     | nodes          | Schema ["spec"] ["nodes"] | nodes from the to-be-updated Schema spec                 |
| 2     | pluginSettings | ImagePluginSettings       | same plugin settings the plugin will be initialized with |

### `startImageUpload`

Arguments

| index | name           | type                 | description                                          |
| ----- | -------------- | -------------------- | ---------------------------------------------------  |
| 1     | view           | EditorView           | Reference of the mounted editor view                 |
| 2     | file           | File                 | image file to be uploaded                            |
| 3     | alt            | string               | alt of the file ( file.name usually works )          |
| 4     | pluginSettings | ImagePluginSettings  | same plugin settings the plugin was initialized with |
| 5     | schema         | Schema               | updated schema used by the editor                    |
| 6     | pos            | number               | insert position in the document                      |



### Uploading files
Be aware that the default `uploadFile` inserts the dataURI of the image directly into the 
ProseMirror document. That can cause issues with large files, for ex. `gif`s with long animations.

### Upload placeholder
The plugin creates a widget decoration while the upload process is still in progress. The widget decoration's
dom node is a `<placeholder>`, an example style could be: 
```css
placeholder {
    color: #ccc;
    position: relative;
    top: 6px;
  }
placeholder:after {
    content: "☁";
    font-size: 200%;
    line-height: 0.1;
    font-weight: bold;
  }
```

### Uploading images from a file picker

A small React example

In the "html" / JSX part:
```typescript jsx
<input type="file" id="imageselector" onChange={onInputChange} />
```

The `onInputChange` callback:
```typescript
  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (
        pmView?.state.selection.$from.parent.inlineContent &&
        e.target.files?.length
      ) {
        const file = e.target.files[0];
        startImageUpload(
          pmView,
          file,
          file.name,
          defaultSettings,
          imageSchema,
          pmView.state.selection.from,
        );
      }
    },
    [pmView],
  );
```

### Example CSS

This is an example style which gives you usable ( but not really good looking ) image nodes.
```css
placeholder {
    color: #ccc;
    position: relative;
    top: 6px;
  }
  placeholder:after {
    content: "☁";
    font-size: 200%;
    line-height: 0.1;
    font-weight: bold;
  }

  .imagePluginRoot {
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 0.25rem;
  }

  .imagePluginRoot img {
    align-self: center;
    width: 100%;
  }

  .imagePluginRoot[imageplugin-align="left"] {
    width: 51%;
    float: left;
    margin: 1rem 2rem 0 0;
  }
  .imagePluginRoot[imageplugin-align="right"] {
    width: 51%;
    float: right;
    margin: 0;
  }
  .imagePluginRoot[imageplugin-align="center"] {
    width: 51%;
    float: none;
    margin: 0 auto;
  }
  .imagePluginRoot[imageplugin-align="fullWidth"] {
    width: auto;
    float: none;
    clear: both;
  }

  .imagePluginRoot[imageplugin-align="left"] [imagealign="left"] {
    background-color: red;
  }
  .imagePluginRoot[imageplugin-align="right"] [imagealign="right"] {
    background-color: red;
  }
  .imagePluginRoot[imageplugin-align="center"] [imagealign="center"] {
    background-color: red;
  }
  .imagePluginRoot[imageplugin-align="fullWidth"] [imagealign="fullWidth"] {
    background-color: red;
  }

  .imagePluginRoot:hover .imagePluginOverlay {
    opacity: 1;
  }
  .imagePluginOverlay {
    width: 100%;
    display: flex;
    position: absolute;
    justify-content: center;
    transition: all 0.3s ease;
    opacity: 0;
  }
  .imagePluginRoot .text {
    text-align: center;
  }
```

## Development

### Running & linking locally
1. install plugin dependencies: `npm install`
2. install peer dependencies: `npm run install-peers`
3. link local lib: `npm run link`
4. link the package from the project you want to use it:  `npm run link prosemirror-image-plugin`

### Publish the package
```
npm run publish:np
```

### About us

Emergence Engineering is dev shop from the EU:
<https://emergence-engineering.com/>

We're looking for work, especially with ProseMirror ;)

Feel free to contact me at
<viktor.vaczi@emergence-engineering.com>
