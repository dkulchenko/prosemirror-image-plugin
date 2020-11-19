# ProseMirror image plugin

# Styling

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

Publish the package with
```
npm publish --access public
```
