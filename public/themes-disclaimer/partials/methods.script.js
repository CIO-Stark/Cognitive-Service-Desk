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