# prosemirror-image-plugin

![alt text](http://url/to/img.png)

By [Viktor Váczi](https://emergence-engineering.com/cv/viktor) at [Emergence Engineering](https://emergence-engineering.com/)

# Features

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

Publish the package with
```
npm publish --access public
```
