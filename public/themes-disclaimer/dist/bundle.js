(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by danielabrao on 12/13/16.
 */
(function () {
    "use strict";

    var themesArr = require("./partials/Themes.dataset.json"),
        themesPhrases = require("./partials/Themes.phrases.json"),
        properties = require("./partials/elements.script"),
        methods = require("./partials/methods.script");

    module.exports = function () {
        return {
            "themesArr": themesArr,
            "properties": properties,
            "methods": methods(properties, themesPhrases)
        };
    };
}());
},{"./partials/Themes.dataset.json":3,"./partials/Themes.phrases.json":4,"./partials/elements.script":5,"./partials/methods.script":6}],2:[function(require,module,exports){
/**
 * Created by danielabrao on 12/13/16.
 */
(function () {
    "use strict";

    var app = require("./index")();

    app.methods.init(app.themesArr);

}());
},{"./index":1}],3:[function(require,module,exports){
module.exports=/**
 * Created by danielabrao on 12/13/16.
 */
[{
  "themeName": "Windows",
  "themeImgSrc": "images/disclaimer/windows.png",
  "themeAlt": "windowsLogo",
  "themeDescription": {
    "pt": "Eu farei o meu esforço para ajudá-lo em todos os aspectos, tanto para Windows 7 como para nova versão do Windows 10 para funcionários da IBM que começou a sua implantação, em janeiro de 2017. Eu vou suportá-lo nas dúvidas mais genéricas, mas também em relação ao gerenciamento de aplicativos da IBM e gestão das diferentes funcionalidades do Windows.",
    "es": "Haré mi esfuerzo para asistirte en todo lo referido tanto en la ya conocida imagen de Windows 7 de IBM como la nueva versión de Windows 10 para empleados de IBM que comenzó su despliegue en Enero del 2017. Te guiaré tanto en sus generalidades como en el uso que puedes darle para atender los negocios de IBM, gestión de aplicaciones y el manejo de las diferentes funcionalidades propias de Windows."
  }
}]
/*    [{
        "themeName": "Windows",
        "themeImgSrc": "images/disclaimer/windows.png",
        "themeAlt": "windowsLogo",
        "themeDescription": {
            "pt": "Fase Beta de Windows",
            "es": "Fase Beta de Windows"
            }
    },{
        "themeName": "Contabilidade",
        "themeImgSrc": "images/disclaimer/contabil.png",
        "themeAlt": "vpnLogo",
        "themeDescription": {
            "pt": "Pode me perguntar qualquer coisa sobre Contabilidade geral.",
            "es": "Puedes consultarme sobre la gestión de los accesos para AT&T (Cómo solicitar tu usuario), la configuración necesaria para la conexión y podemos revisar los inconvenientes que tengas durante la conexión a la red IBM o de su uso en Windows 7."
        }
    }, {
        "themeName": "Network",
        "themeImgSrc": "images/disclaimer/wifi.png",
        "themeAlt": "wifiLogo",
        "themeDescription": {
            "pt": "Pode me questionar sobre qualquer coisa de redes, desde 'Como configurar o wireless' até sobre 'Minha wireless nao conecta'. Fique a vontade!",
            "es": "Puedo ayudarte a resolver inconvenientes al querer establecer conexiones (Wireless en IBM, configurar proxy, conectar tu dispositivo mobile a la red IBM, solicitar un cable Ethernet) o gestionar tus permisos a Intranet (Cambo o reset de password de Intranet)."
        }
    }, {
        "themeName": "Telephony",
        "themeImgSrc": "images/disclaimer/phone.png",
        "themeAlt": "telLogo",
        "themeDescription": {
            "pt": "Eu aprendi sobre telefonia na IBM só pra te ajudar, agora sei como criar ramal, resolver erro 201 quando você tenta logar e coisas do tipo, pra qualquer tipo de solicitação ou problema, é só me perguntar.",
            "es": "Podrás consultarme sobre los diferentes servicios de Telefonia (Interno/Extensión, Voicemail, Celulares, aparatos Cisco, CallForward) o sobre el uso de las  AudioConferencias de AT&T o IBM Meetings. Espero poder asistirte también en las diferentes problemáticas que se te presenten."
        }
    }, {
        "themeName": "Sametime",
        "themeImgSrc": "images/disclaimer/same2.png",
        "themeAlt": "sametimeLogo",
        "themeDescription": {
            "pt": "Se você tiver dúvidas sobre como configurar o seu Sametime, como instalar, como mandar announcements ou mesmo sobre como criar grupos públicos, eu estarei aqui pra te ajudar.",
            "es": "Podes consultar sobre cómo realizar la instalación y configuración del Sametime en sus diferentes versiones (de escritorio en tu Mac, RedHat o Windows, a través de la web o accediendo desde tus dispositivos Android o IOS). También intentaré asistirte en los problemas que puedan surgirte y ayudarte a conocer las funcionalidades que el Cliente de Chat tiene para facilitar tus conversaciones."
        }
    }, {
        "themeName": "Verse/Notes",
        "themeImgSrc": "images/disclaimer/mail.png",
        "themeAlt": "versenotesLogo",
        "themeDescription": {
            "pt": "Atualmente, eu dou preferência pra te ajudar com o IBM Verse e o SmartCloud Notes, mas o Notes Client é totalmente suportado, e você pode me perguntar sobre tudo, desde configuração, reset de senha ou adicionar assinaturas, até sobre problemas em dbs que você está recebendo, problemas de envio, etc.",
            "es": "Podré ayudarte a conocer los diferentes servicios webmail (las nuevas plataformas de correo Verse y SmartCloud Notes) o el uso del método tradicional mediante IBM Notes, cómo acceder a cada una y los diferentes problemas de acceso, gestionar tus Archives, acceder desde tus dispositivos Android o IOS y utilizar las diferentes funcionalidades del correo."
        }
    }, {
        "themeName": "Mac",
        "themeImgSrc": "images/disclaimer/apple.png",
        "themeAlt": "macLogo",
        "themeDescription": {
            "pt": "É possível que você tenha algumas dúvidas com dispositivos Apple, mas nos últimos meses eu estudei bastante, e acredito que possa te ajudar com a maioria das situações. Posso te ajudar a configurar o Mac, instalar programas, instalar o Cisco Anyconnect e também resolver problemas caso você tenha algum.",
            "es": "Intentaré asistirte en el uso de tus dispositivos Apple (Mac, iPhone y iPad) tanto en sus generalidades como en lo que refiere al uso dentro del ecosistema IBM. Podré ayudarte a configurar tu equipo, instalar las diferentes aplicaciones IBM y las aplicaciones externas y el uso de las diferentes funcionalidades propias del entorno OSX para que puedas acostumbrarte rápidamente sacándole el mejor provecho a la plataforma."
        }
    }, {
        "themeName": "Box",
        "themeImgSrc": "images/disclaimer/box.png",
        "themeAlt": "boxLogo",
        "themeDescription": {
            "pt": "Heeeeey, você precisa começar a usar Cloud, e pra isso eu aprendi tudinho sobre Box, quer perguntar? Como configurar, problemas em links, problemas pra sincronizar. Tudo tudo, fique a vontade!",
            "es": "Puedo guiarte para que aproveches el poder de la plataforma de Box. Podrás consultarme cómo gestionar tus accesos y los diferentes permisos para compartir información, diferentes maneras de manejar tus archivos y de editarlos ya sea en línea o mediantes las múltiples aplicaciones (Box Sync, Box Edit, Box Office) en los diferentes OS (tanto de escritorio como en smartphones)."
        },
    }]*/
},{}],4:[function(require,module,exports){
module.exports=/**
 * Created by danielabrao on 12/19/16.
 */
{
  "pt": {
    "title": "Atualmente, eu sei responder os seguintes temas:",
    "button": "Entendi!",
    "disclaimer": "Não voltar a mostrar essa mensagem"
  },
  "es": {
    "title": "Actualmente estoy preparado para responderte a los siguientes temas:",
    "button": "Comprendo!",
    "disclaimer": "No volver a mostrar este mensaje"
  }
}
},{}],5:[function(require,module,exports){
/**
 * Created by danielabrao on 12/13/16.
 */
(function () {
    "use strict";
    module.exports = {
        "userIdEl": document.getElementById("username"),
        "themesHeaderText": document.getElementById("themes-intro"),
        "disclaimerEl": document.getElementById("themes-disclaimer"),
        "textDescriptionEl": document.getElementById("themes-details"),
        "themesDivParent": document.getElementById("themes-content"),
        "actionButtonEl": document.getElementById("close-disclaimer"),
        "disclaimerCheckbox": document.getElementById("disclaimer-check"),
        "disclaimerLabel": document.getElementById("disclaimer-label"),
        "wrapperWebEl": document.getElementById("blur")
    };
}());
},{}],6:[function(require,module,exports){
/**
 * Created by danielabrao on 12/13/16.
 */
(function () {
    "use strict";

    module.exports = function (elements, appPhrases) {

        var properties = {
            "appLanguage": ""
        };

        var methods = {
            "getAppLanguage": function () {
                if (properties.appLanguage) {
                    return properties.appLanguage;
                }
                var result;
                try {
                    result = window.localStorage.getItem("locale");
                    if (!result) {
                        var regex = new RegExp(/@.+\./ig);
                        result = regex.exec(elements.userIdEl.innerHTML)[0].split("@")[1].split(".")[0];
                    }
                } catch (e) {
                    result = "es";
                }

                properties.appLanguage = result;

                return properties.appLanguage;

            },
            "bindElementAction": function (element, data) {
                var language = this.getAppLanguage();
                element.addEventListener("click", function () {
                    if (language === "pt" || language === "br") {
                        elements.textDescriptionEl.innerHTML = data.themeDescription.pt || "Não disponível";
                    } else {
                        elements.textDescriptionEl.innerHTML = data.themeDescription.es || "No disponible";
                    }
                    elements.textDescriptionEl.style.display = "flex";

                });
                return element;
            },
            "bindCSSClass": function (model) {
                model.outerDiv.classList.add("content-box");
                model.imgDiv.classList.add("themes-img-holder");
                model.imgEl.classList.add("themes-img");
                model.textDiv.classList.add("themes-description");
                return model;
            },
            "buildHTMLModel": function () {
                return this.bindCSSClass({
                    "outerDiv": document.createElement("div"),
                    "imgDiv": document.createElement("div"),
                    "imgEl": document.createElement("img"),
                    "textDiv": document.createElement("div"),
                    "textEl": document.createTextNode("")
                });
            },
            "buttonAction": function (themesAmount) {
                return function () {
                    methods.toggleDisclaimerView().checkDisclaimerStatus(themesAmount);
                };

            },
            "toggleDisclaimerView": function () {
                if (elements.disclaimerEl.style.display === "none" || !elements.disclaimerEl.style.display) {
                    elements.wrapperWebEl.style.filter = "blur(3px)";
                    elements.disclaimerEl.style.display = "flex";

                } else {
                    elements.disclaimerEl.style.transform = "translateY(-1000px)";
                    // window.setTimeout(function () {
                    //     elements.disclaimerEl.style.display = "none";
                    // }, 2000);

                    elements.wrapperWebEl.style.filter = "initial";
                }

                return this;

            },
            "queryDisclaimerStatus": function (themesAmount) {
                try {
                    var status = JSON.parse(localStorage.getItem("ack"));

                    if (status.themesAmount != themesAmount) {
                        return false;
                    } else {
                        return status.ack;
                    }

                } catch (e) {
                    console.log(e);
                    return false;
                }
            },
            "checkDisclaimerStatus": function (themesAmount) {

                if (elements.disclaimerCheckbox.checked) {
                    localStorage.setItem("ack", JSON.stringify({
                        "ack": true,
                        "themesAmount": themesAmount
                    }));
                }

                return this;
            },
            "bindButtonAction": function (themesAmount) {
                elements.actionButtonEl.addEventListener("click", this.buttonAction(themesAmount));
                return this;
            },
            "buildThemeEl": function (theme) {
                var docFragment = document.createDocumentFragment();

                var model = this.buildHTMLModel();
                model.imgEl.src = theme.themeImgSrc;
                model.imgEl.attributes.alt = theme.themeAlt || "theme-image";
                model.textEl.textContent = theme.themeName;

                model.imgDiv.appendChild(model.imgEl);
                model.textDiv.appendChild(model.textEl);

                model.outerDiv.appendChild(model.imgDiv);
                model.outerDiv.appendChild(model.textDiv);

                docFragment.appendChild(this.bindElementAction(model.outerDiv, theme));

                return docFragment;
            },
            "populateStrings": function (language) {
                var messages;
                if (language === "pt" || language === "br") {
                    messages = appPhrases.pt;
                } else {
                    messages = appPhrases.es;
                }


                elements.themesHeaderText.innerHTML = messages.title;
                elements.actionButtonEl.innerHTML = messages.button;
                elements.disclaimerLabel.innerHTML = messages.disclaimer;

                return this;

            },
            "init": function (themesArr) {
                var self = this;
                if (!this.queryDisclaimerStatus(themesArr.length)) {
                    this.populateStrings(this.getAppLanguage()).toggleDisclaimerView().bindButtonAction(themesArr.length);
                    themesArr.forEach(function (theme) {
                        elements.themesDivParent.appendChild(self.buildThemeEl(theme));
                    });
                }
            }
        };

        return methods;
    };


}());
},{}]},{},[2]);
