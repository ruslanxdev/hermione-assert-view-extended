# hermione-assert-view-extended

## Overview

Use the `hermione-assert-view-extended` plugin to extend the capabilities of Hermione's `assertView` command.

The plugin allows you to take screenshots with minimal irrelevant diffs.

### What are irrelevant diffs?

Often in tests, when taking screenshots and comparing them with benchmarks, diffs arise that are not related to the test. Diffs may appear due to the following reasons:

* animation on the page: for example, the animation did not have time to end, and the test is already taking a screenshot and the result does not match the standard; the fact is that the animation can be carried out differently each time, taking a screenshot may occur with a slight delay relative to the previous time or vice versa earlier than the last time. all this is enough for the screenshots to show the difference from each other when comparing;

* the presence of elements in the layout that fall into the screenshot, but do not relate to the test and are not controlled by it, and may be different at different times due to their implementation;

* [anti-aliasing][anti-aliasing] artifacts that occur due to a combination of certain element colors and background color.

The `hermione-assert-view-extended` plugin allows you to compensate to a large extent for the above disadvantages when properly configured. With it, you can disable animation, set which elements to ignore (they will be replaced with black rectangles), which elements to make invisible by setting them to zero opacity, or which elements to hide. You can also enable the application of your own CSS before taking a screenshot.

### Why can't we just hide all the irrelevant elements?

Why do we need 3 options for how to exclude an element from a screenshot?

Because in some cases, removing an element from a page can lead to an undesirable change in the layout. That is, you will be testing essentially another page, and not the one that your user will actually see.

### What else does the plugin allow?

The plugin also allows you to specify the actions to be performed each time before taking a screenshot. Or actions to be performed after taking a screenshot. To do this, you need to specify handlers for _beforeach- and afterEach-_ hooks in the plugin settings.

## Install

```bash
npm install -D hermione-assert-view-extended
```

## Setup

Add the plugin to the `plugins` section of the `hermione` config:

```javascript
module.exports = {
    plugins: {
        'hermione-assert-view-extended': {
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
                ignoreElements: [ // Page elements to be replaced with black rectangles
                    '.classname1'
                ],
                invisibleElements: [ // Page elements to be made completely transparent
                    '.classname3' 
                ],
                hideElements: [ // Page elements to be hidden
                    '.classname2'
                ],
                customCSS: `
                    body {
                        background-color: red;
                    }
                `
            }
        },

        // other hermione plugins...
    },

    // other hermione settings...
};
```

### Description of configuration parameters

| **Parameter** | **Type** | **Default&nbsp;value** | **Description** |
| :--- | :---:| :---: | :--- |
| hooks | Object | `{ }` | Handlers for _beforeach_ and _afterEach_ hooks that will be called before and after taking a screenshot. |
| globalStyles | Object | `{ }` | Redefining styles for various elements. Applied before taking a screenshot and removed after. |

### hooks parameters

| **Parameter** | **Type** | **Default&nbsp;value** | **Description** |
| :--- | :---:| :---: | :--- |
| beforeEach | Function | null | A handler function that will be executed _before_ taking each screenshot. |
| afterEach | Function | null | A handler function that will be executed _after_ taking each screenshot. |

### globalStyles parameters

| **Parameter** | **Type** | **Default&nbsp;value** | **Description** |
| :--- | :---:| :---: | :--- |
| animationDisabled | Boolean | false | Disable CSS animation. |
| redraw | Boolean | false | Redraw the browser page after applying all the new styles. Also, the redrawing will be forced, regardless of the value of this parameter, if the _redrawElements_ list is specified. |
| redrawMode | String | 'medium' | Redrawing mode: _soft, medium, hard._ See details below. |
| redrawElements | Array | `['body']` | Page elements that need to be redrawn. If the elements are specified, the redrawing will occur even if the _redraw_ parameter is set to _false._ |
| redrawTimeout | Number | _N/A_ | Pause before redrawing page elements, in ms. |
| ignoreElements | Array | _N/A_ | Page elements that will be replaced with black rectangles. |
| invisibleElements | Array | _N/A_ | Page elements that will be made completely transparent. |
| hideElements | Array | _N/A_ | Page elements to be hidden. |
| customCSS | String | _N/A_ | Custom CSS that will be applied before taking a screenshot. |

### animationDisabled

The following set of styles is used to disable animation:

```css
    body, body *, body *:after, body *:before,
    body[class], body[class] *, body[class] *:after, body[class] *:before {
        -webkit-animation-duration: 0s !important;
        -moz-animation-duration: 0s !important;
        -ms-animation-duration: 0s !important;
        animation-duration: 0s !important;
        -webkit-transition-duration: 0s !important;
        -moz-transition-duration: 0s !important;
        -ms-transition-duration: 0s !important;
        transition-duration: 0s !important;
        -webkit-transition-delay: 0s !important;
        -moz-transition-delay: 0s !important;
        -ms-transition-delay: 0s !important;
        transition-delay: 0s !important;
    }
```

### redraw

Enables forced redrawing of the browser page after applying all new styles. Also, the redrawing will be forced, regardless of the value of this parameter, if the `redrawElements` list is set.

### redrawMode

The redrawing mode can take the following values:

* `soft` &mdash; redraw the page without reflowing using the `transform: translateZ(0)` style to all elements specified in the `redrawElements` list;
* `medium` &mdash; reflow the page and redraw it using the `opacity: 0` style to all elements specified in the `redrawElements` list;
* `hard` &mdash; reflow the page and redraw it using the `display: none` style to all elements specified in the `redrawElements` parameter.

### redrawElements

Page elements that need to be redrawn. If the elements are specified, the redrawing will occur even if the `redraw` parameter is set to `false`. By default, the array of elements contains `body`.

### redrawTimeout

The pause in milliseconds that the browser must endure before redrawing the page elements.

### ignoreElements

Page elements that will be replaced with black rectangles. The specified list of elements will be added to the `ignoreElements` list of Hermione's `assertView` command, every time a screenshot is taken.

### invisibleElements

Page elements that will be made completely transparent. To do this, the style `opacity: 0 !important` is applied to them.

### hideElements

Page elements to be hidden. To do this, the `display: none !important` style is applied to them.

### customCSS

You can set your own styles that will be applied before taking a screenshot.

## Useful links

* [hermione-assert-view-extended plugin sources][hermione-assert-view-extended]

[hermione-assert-view-extended]: https://github.com/ruslanxdev/hermione-assert-view-extended
[anti-aliasing]: https://en.wikipedia.org/wiki/Spatial_anti-aliasing
