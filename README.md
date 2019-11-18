# drag-pane

Custom element wrapping arbitrary content in a draggable pane.
Has optional buttons for collapsing content and removing pane entirely.

```bash
npm install drag-pane

yarn add drag-pane
```

## Usage

The child element of `drag-pane` becomes the pane's body.

```html
<script type="module" src="./dist/index.js"></script>

<drag-pane heading="Default Pane">
    <div>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
    </div>
</drag-pane>

```

## Attributes

### `heading`

Provide a string to set as the value for text visible in the header.

### `disabled`

If present or set as `"true"`, disables the drag (and if visible, button) behaviours.  Pane adopts a 'disabled' style.

### `hide-controls`

The minimize and close buttons will not be rendered when this attribute is present or set as `"true"`.

### `minimized`

Only the header is visible when this attribute is present or `"true"`.

### `color`

Specify a custom color for the header using a valid css color.

---

## Events

`drag-pane` emits certain events of selected actions.

### `toggleminimize`

Minimize button on pane header is clicked.

### `remove`

Pane is removed via the 'close' button on the pane's header.

### `dragstart`

Pane has stated to become dragged.

### `dragend`

Dragged pane is released.
