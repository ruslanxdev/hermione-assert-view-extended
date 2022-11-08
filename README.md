# hermione-assert-view-extended

Hermione plugin for extend assertView command. Inspired [hermione-ignore](https://github.com/deemidroll/hermione-ignore).

## Install

```
npm i -D hermione-assert-view-extended
```

## Usage

Set options for the plugin in your hermione config:
```js
{
    hooks: {
        beforeEach: function(name, selector, options) {
            return this.browser.moveTo(0, 0);
        },
        afterEach: function(name, selector, options) {
            console.log(`Asserted view '${name}' for '${selector}' selector.`);
        }
    },
    globalStyles: {
        animationDisabled: true,
        redraw: true,
        // Elements will be covered with black rect.
        ignoreElements: [
            '.classname1'
        ],
        // Elements will be hidden with `opacity: 0`.
        invisibleElements: [
            '.classname3'
        ],
        // Elements will be hidden with `display: none`.
        hideElements: [
            '.classname2'
        ],
        customCSS: `
            body {
                background-color: red;
            }
        `
    }
}
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `hooks` | | Hermione commands which will be called before/after call assertView in `then()`. |
| `hooks.beforeEach` | | Hermione commands which will be called before call assertView and first inner execute. |
| `hooks.afterEach` | | Hermione commands which will be called after call assertView and last inner execute. |
| `globalStyles` | | CSS injection appended in `<head>` before call assertView. It will be removed after call assertView. |
| `globalStyles.animationDisabled` | `false` | Disable CSS animation (`transition-duration: 0s`, `animation-duration: 0s`, etc.). |
| `globalStyles.redraw` | `false` | Browser redraw page after apply styles. It will be `true`, if you set `redrawElements`. |
| `globalStyles.redrawMode` | `'medium'` | Browser redraw page after apply styles.<br><ul><li>`'soft'` — only repaint without reflow with `transform: translateZ(0)`;</li><li>`'medium'` — reflow and repaint with `opacity: 0`;</li><li>`'hard'` — reflow and repaint with `display: none`.</li></ul> |
| `globalStyles.redrawElements` | `['body']` | Elements will be redrawed. |
| `globalStyles.redrawTimeout` | | Timeout after redraw elements. |
| `globalStyles.ignoreElements` | | Elements will be covered with black rect. |
| `globalStyles.invisibleElements` | | Elements will be hidden with `opacity: 0`. |
| `globalStyles.hideElements` | | Elements will be hidden with `display: none`. |
| `globalStyles.customCSS` | | Custom styles. |

## Licence

MIT
