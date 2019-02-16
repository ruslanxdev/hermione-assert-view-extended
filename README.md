# hermione-assert-view-extended

Hermione plugin for extend assertView command. Inspired [hermione-ignore](https://github.com/deemidroll/hermione-ignore).

## Install

```
npm i -D hermione-assert-view-extended
```

## Usage

Set options for the plugin in your hermione config:
```
{
    globalStyles: {
        animationDisable: true,
        ignoreElements: [
            '.classname1'
        ],
        invisibleElements: [
            '.classname3'
        ],
        hideElements: [
            '.classname2'
        ],
        customCSS: `
            body {
                background-color: red;
            }
        `
    },
    globalExecute: {
        before: [
            function(message) {
                alert(message);
            },
            'Hello, world!'
        ],
        after: function() {
            alert('Bye bye!');
        }
    }
}
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `globalStyles` | | CSS injection appended in `<head>` before call assertView. It will be removed after call assertView. |
| `globalStyles.animationDisable` | `false` | Disable CSS animation (`transition-duration: 0s`, `animation-duration: 0s`, etc.). |
| `globalStyles.ignoreElements` | | Elements will be covered with black rect. |
| `globalStyles.invisibleElements` | | Elements will be hidden with `opacity: 0`. |
| `globalStyles.hideElements` | | Elements will be hidden with `display: none`. |
| `globalStyles.customCSS` | | Custom styles. |
| `globalExecute` | | Scripts executed before/after call assertView in the inner execut with other manipulation. |
| `globalExecute.before` | | JS function executed before call assertView. |
| `globalExecute.after` | | JS function executed after call assertView. |

## Licence

MIT
