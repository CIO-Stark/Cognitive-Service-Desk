/**
 * Created by danielabrao on 8/12/16.
 */

(function (globalScope, document) {
    "use strict";

    var css = document.createElement('link');
    css.href = '/lib/dialog-box/dialog.style.css';
    css.rel = 'stylesheet';
    css.type = 'text/css';
    document.querySelector('head').appendChild(css);

    var isLoading = false;

    //function to remove element from dom
    function removeElement(el) {

        return  el.parentNode.removeChild(el);
    }


    //function exposed to globl object
    function buildDialog(configs) {
        console.log(configs);


        return new Promise(function (resolve, reject) {
            if (!configs) {
                configs = {};
            }

            if (document.querySelector('#dialog')) {
                return;
            }

            var dialogEl = document.createElement('aside'),
                dialogHeader = document.createElement('header'),
                dialogBody = document.createElement('main'),
                ticketDisclaimer = document.createElement('h3'),
                wrapper = document.createElement('section'),
                closeBtn = document.createElement('button'),
                ticketInput = document.createElement('textarea'),
                body = document.querySelector('body');

            dialogEl.setAttribute('id', 'dialog');
            ticketInput.setAttribute('id', 'ticket-input');

            //Apply the custom styles
            if (configs.style) {
                for (var prop in configs.style) {
                    if (configs.style.hasOwnProperty(prop)) {
                        dialogEl.style[prop] = configs.style[prop];
                    }
                }
            }

            body.onkeydown = function(evt) {
                evt = evt || window.event;
                var isEscape = false;
                if ("key" in evt) {
                    isEscape = evt.key == "Escape";
                } else {
                    isEscape = evt.keyCode == 27;
                }
                if (isEscape) {
                    if (isLoading) {
                        return;
                    }
                    removeElement(dialogEl);
                    reject("Operação cancelada com sucesso");
                    body.onkeydown = null;
                }
            };

            closeBtn.appendChild(document.createTextNode('X'));

            closeBtn.addEventListener('click', function () {
                if (isLoading) {
                    return;
                }
                removeElement(dialogEl);
                reject("Operação cancelada com sucesso");
                closeBtn.removeEventListener('click', null);
            });

            if (configs.title) {
                var dialogTitle = document.createElement('h2');
                dialogTitle.appendChild(document.createTextNode(configs.title));
                dialogHeader.appendChild(dialogTitle);
            }

            var disclaimerMessage = '';
            if (configs.params[configs.params.length - 1] === 'pt') {
                disclaimerMessage = 'Descreva brevemente seu problema de telefonia e eu irei enviar para um agente analisar';
            } else {
                disclaimerMessage = 'Brevemente describa su teléfono problema y voy a enviar para el agente de análisis';
            }

            ticketDisclaimer.appendChild(document.createTextNode(disclaimerMessage));

            dialogBody.appendChild(ticketDisclaimer);
            wrapper.appendChild(ticketInput);

            var sendButton = document.createElement('button'),
                laddaLabel = document.createElement('span');

            laddaLabel.appendChild(document.createTextNode('Enviar'));
            sendButton.appendChild(laddaLabel);
            sendButton.setAttribute('id', 'send-ticket');
            sendButton.setAttribute('data-style', 'zoom-out');

            sendButton.addEventListener('click', function () {
                var laddaAccept = Ladda.create(this);
                laddaAccept.start();
                isLoading = true;

                var qa = configs.params[0];
                var a1 = configs.params[1];
                var c1 = configs.params[2];
                var confidence = configs.params[3];
                var a2 = configs.params[4];
                var c2 = configs.params[5];
                var message = document.querySelector('#ticket-input').value;
                var messageArr = configs.params[6];

                configs.service.storeFeedback(qa, a1, c1, confidence, a2, c2, message, messageArr).then(function (data) {
                    resolve(data);
                    removeElement(dialogEl)
                }, function errCB (err) {
                    isLoading = false;
                    reject(err);
                });
            });

            wrapper.appendChild(sendButton);
            dialogBody.appendChild(wrapper);

            dialogHeader.appendChild(closeBtn);
            dialogEl.appendChild(dialogHeader);
            dialogEl.appendChild(dialogBody);

            body.appendChild(dialogEl);

        });
    }


    globalScope.buildDialog = buildDialog;
    return 0;

}(window, document));