/**
 * Created by danielabrao on 10/7/16.
 */
(function (window) {
    "use strict";

    var trackObj = require("./tracker"),
        messageBuilder = require("../../../../model/engagementMail");

    function parseHTML(html) {
        var t = document.createElement('template');
        t.innerHTML = html;
        return t.content.cloneNode(true);
    }

    module.exports = function (actionHandler, admFactory, $, props) {
        return {
            parentList: {
                mainContainer: document.querySelector("main"),
                lowNegative: document.getElementById("lowNegative"),
                highNegative: document.getElementById("highNegative")
            },
            removeElement: function (element) {
                element.parentNode.removeChild(element);
                return this;
            },
            clearElement: function (element) {
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                return this;
            },
            getParent: function (type) {
                return this.parentList[type];
            },
            addClickAction: function (element, info) {
                var self = this;
                element.addEventListener("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    self.createSidemenu(info);
                    return false;
                });
                return this;
            },
            createSidemenu: function (data) {
                var self = this;
                if (trackObj.getMenu()) {
                    if (data.USERID === trackObj.getData().USERID) {
                        trackObj.getMenu().classList.add("hide");
                        window.setTimeout(function () {
                            self.removeElement(trackObj.getMenu());
                            trackObj.setData(false).setMenu(false);
                        }, 210);
                    } else {
                        trackObj.setData(data);
                        this.populateSidemenu();
                    }
                } else {
                    var aside = document.createElement("aside");
                    this.parentList.mainContainer.appendChild(aside);
                    trackObj.setMenu(aside).setData(data);
                    this.populateSidemenu();
                }
            },
            populateSidemenu: function () {
                var infoObj = trackObj.getData();
                console.log(infoObj);
                this.clearElement(trackObj.getMenu());
                var msg = messageBuilder({
                    "language": infoObj.language,
                    "user": infoObj.USERID,
                    "questionArr": infoObj.QUESTION
                });
                window.setTimeout(function () {

                    var docfrag = document.createDocumentFragment();
                    var preTag = document.createElement("pre");
                    preTag.appendChild(parseHTML(msg));
                    docfrag.appendChild(preTag);
                    trackObj.getMenu().appendChild(docfrag);
                }, 150);

            },
            drawList: function (type, data, index) {
                var docfrag = document.createDocumentFragment();
                var div = document.createElement("div"),
                    userSpan = document.createElement("span"),
                    divAside = document.createElement("aside"),
                    itemsDomain = props.getFilteredData();

                divAside.classList.add("remove-user");

                divAside.addEventListener("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    div.classList.toggle("removed");
                    if (itemsDomain[index]) {
                        delete itemsDomain[index];
                    } else {
                        itemsDomain[index] = data;
                    }
                });


                userSpan.appendChild(document.createTextNode(data["USERID"]));
                div.appendChild(divAside);
                div.appendChild(userSpan);
                if (type === "highNegative") {
                    var commentArea = document.createElement("input"),
                        actionButton = document.createElement("button");
                    actionButton.appendChild(document.createTextNode("Engage"));

                    commentArea.setAttribute("placeholder", "Insert message");

                    actionHandler.bindAction(actionButton, this.DAOWrapper({
                        rowID: data.rowID,
                        comment: commentArea
                    }, div));

                    div.appendChild(commentArea);
                    div.appendChild(actionButton);
                } else {
                    this.addClickAction(div, data);
                }

                docfrag.appendChild(div);
                this.getParent(type).appendChild(docfrag);
            },
            DAOWrapper: function (data, element) {
                return function () {
                    admFactory.markAsCalled($.ajax, data).then(function successCB (result) {
                        console.log(result);
                        $(element).fadeOut();
                    }, function errorCB (error) {
                        console.log(error);
                    });
                }
            },
            dumpLists: function (listArr) {
                for (var i = 0; i < listArr.length; i += 1) {
                    this.clearElement(listArr[i]);
                }
            },
            populateLogsList: function (target, info) {
                console.log(info, " aqui");
            }
        }
    };

}(window));