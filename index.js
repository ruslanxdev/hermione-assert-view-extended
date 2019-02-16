'use strict';

module.exports = (hermione, opts = {}) => {
    const globalStyles = opts.globalStyles || {};
    const globalExecute = opts.globalExecute || {};
    const elementProps = ['ignoreElements', 'invisibleElements', 'hideElements'];
    const otherProps = ['animationDisable', 'customCSS'];

    hermione.on(hermione.events.NEW_BROWSER, (browser) => {
        const baseAssertView = browser.assertView.bind(browser);

        browser.addCommand('assertView', (name, selector, options = {}) => {
            options.excludeElements = normalize(options.excludeElements);

            // Merge global and local selectors without excluded selectors.
            [...elementProps, ...otherProps].forEach(prop => {
                options[prop] = merge(
                    globalStyles[prop],
                    elementProps.includes(prop) ? normalize(options[prop]) : options[prop],
                    options.excludeElements
                );
            });

            // Remove captured selector from all types of ignore.
            elementProps.forEach(prop => {
                if (Array.isArray(options[prop])) {
                    options[prop] = options[prop].filter(selectorInside => selectorInside !== selector)
                }
            });

            options.animationDisable = options.animationDisable || false;

            let styleString = '';

            if (options.animationDisable) {
                styleString += getAnimationDisableStyles();
            }

            if (options.invisibleElements.length) {
                styleString += options.invisibleElements.join(',') + '{ opacity: 0 !important }';
            }

            if (options.hideElements.length) {
                styleString += options.hideElements.join(',') + '{ display: none !important }';
            }

            if (options.customCSS) {
                styleString += options.customCSS;
            }

            let beforeExecute, afterExecute;

            if (globalExecute.before) {
                globalExecute.before = normalizeExecute(globalExecute.before);
                beforeExecute = globalExecute.before[0].bind(null, ...globalExecute.before.splice(1));
            }

            if (globalExecute.after) {
                globalExecute.after = normalizeExecute(globalExecute.after);
                afterExecute = globalExecute.after[0].bind(null, ...globalExecute.after.splice(1));
            }

            await browser.execute(function(styleString, beforeExecute) {
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.createElement('style');

                style.type = 'text/css';
                style.id = 'hermione-assert-view-extended';
                style.innerText = styleString;

                // Add styles before screenshot capturing.
                head.appendChild(style);

                if (beforeExecute && typeof beforeExecute.call !== 'undefined') {
                    beforeExecute();
                }
            }, styleString, beforeExecute);

            await baseAssertView(name, selector, options);

            await browser.execute(function(afterExecute) {
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.getElementById('hermione-assert-view-extended');

                // Remove styles after screenshot capturing.
                head.removeChild(style);

                if (afterExecute && typeof afterExecute.call !== 'undefined') {
                    afterExecute();
                }
            }, afterExecute);
        }, true);
    });
};

function merge(global = [], local = [], excludeElements = []) {
    return [].concat(global, local)
        .filter(selector => !excludeElements.includes(selector));
}

function normalize(input) {
    return typeof input === 'string' ? [input] : input;
}

function getAnimationDisableStyles() {
    return `
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
    `;
}

function normalizeExecute(value) {
    return [].concat(value);
}