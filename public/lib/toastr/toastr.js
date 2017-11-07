/**
 * Created by danielabrao on 8/10/16.
 */
(function (globalScope, document) {
    "use strict";

    var css = document.createElement('link');
    css.href = './lib/toastr/toastr.css';
    css.rel = 'stylesheet';
    css.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(css);

    function removeElement(el) {
        return  el.parentNode.removeChild(el);
    }

    function buildToastr(configs, time) {

        var toastr = document.createElement('section'),
            closeBtn = document.createElement('button'),
            toastrMsg = document.createElement('span'),
            toastrContainer = document.querySelector('#toastr-container');

        closeBtn.appendChild(document.createTextNode('X'));

        closeBtn.addEventListener('click', function () {
            if (timeout) {
                window.clearTimeout(timeout);
            }
            removeElement(toastr);
            closeBtn.removeEventListener('click', null);
        });

        toastr.appendChild(closeBtn);
        toastr.appendChild(toastrMsg);

        toastr.setAttribute('id', 'toastr');
        toastrMsg.appendChild(document.createTextNode(configs.message));

        if (toastrContainer) {
            toastrContainer.appendChild(toastr);
        } else {
            var newToastrContainer = document.createElement('aside');
            newToastrContainer.setAttribute('id', 'toastr-container');
            newToastrContainer.appendChild(toastr);

            if (configs.parent) {
                document.querySelector(configs.parent).appendChild(newToastrContainer);
            } else {
                document.querySelector('body').appendChild(newToastrContainer);
            }
        }

        var timeout = window.setTimeout(function () {
            removeElement(toastr);
        }, configs.time || 10000);
    }

    globalScope.buildToastr = buildToastr;
    return 0;

}(window, document));