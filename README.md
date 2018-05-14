# hermione-ignore
Hermione plugin. Assert view with global ignored elements.

`.hermione.conf.js`:

```js
module.exports = {
    plugins: {
        'hermione-ignore': {
            globalIgnore: {
                // Selectors will be covered with black rect.
                ignoreElements: [
                    '.classname1'
                ],
                // Selectors will be hidden with `display: none`.
                hideElements: [
                    '.classname2'
                ],
                // Selectors will be hidden with `opacity: 0`.
                invisibleElements: [
                    '.classname3'
                ]
            }
        }
    }
};
```
