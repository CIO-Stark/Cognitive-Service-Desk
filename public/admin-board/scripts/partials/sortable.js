/*
 Sorting Tables with ES6 Native

 @author: Guilherme Oka
 @version: 0.1
 @dependencies: ES6
 */

//declare sortable func (append to global scope)
(function(globalScope){
    "use strict";
    globalScope.sortable = globalScope.sortable || function(tableHandler, filterColumns) {
        var head = tableHandler.querySelectorAll("thead")[0],
            body = tableHandler.querySelectorAll("tbody")[0],
            scanBody = function(){
                var data = [],
                    lines = body.querySelectorAll("tr");
                Array.from(lines).forEach(function(tr) {
                    var lineData = [],
                        cols = tr.querySelectorAll("td");

                    Array.from(cols).forEach(function (td) {

                        if (td.children[0]) {
                            return;
                        }

                        if (isNaN(td.textContent)) {
                            lineData.push(td.textContent);
                        } else {
                            lineData.push(parseInt(td.textContent, 0));
                        }
                    });
                    data.push(lineData);
                });

                return data;
            },
            rebuildBody = function(data) {
                var newBody = document.createElement("tbody"),
                    rowIndex = 0,
                    rowMax = data.length;
                for (rowIndex; rowIndex < rowMax; rowIndex += 1) {
                    var tr = document.createElement("tr"),
                        colIndex = 0,
                        colMax = data[rowIndex].length;

                    tr.addEventListener('click', function () {
                        this.classList.toggle('selected');
                    });

                    for (colIndex; colIndex < colMax; colIndex += 1) {
                        var td = document.createElement("td"),
                            content = document.createTextNode(data[rowIndex][colIndex]);

                        if (filterColumns) {
                            td.className += filterColumns[colIndex];
                        }

                        td.appendChild(content);
                        tr.appendChild(td);
                    }

                    newBody.appendChild(tr);
                }
                body.parentNode.replaceChild(newBody, body);
                body = tableHandler.querySelectorAll("tbody")[0];
                return window.x.a = 12;
            },
            sort = function(thHandler) {
                var data = scanBody(),
                    order = thHandler.getAttribute("data-sortable-order") || "asc",
                    index = thHandler.getAttribute("data-sortable-index");
                data.sort(function(a, b){
                    return (a[index] < b[index] ? -1 : 1);
                });
                if (order === "asc") {
                    thHandler.setAttribute("data-sortable-order", "desc");
                }
                else if (order === "desc") {
                    data.reverse();
                    thHandler.setAttribute("data-sortable-order", "asc");
                }
                rebuildBody(data);
            };
        //set header events
        (function () {
            var index = 0,
                cols = head.querySelectorAll("th");
            Array.from(cols).forEach(function(th) {
                th.setAttribute("data-sortable-index", index);
                index += 1;
                th.addEventListener("click", function (event) {
                    var x = document.querySelectorAll('[data-sortable-order]')[0];
                    if (x === th) {
                        console.log('do nothing');
                    } else {
                        if (x) {
                            x.removeAttribute('data-sortable-order');
                            console.log('remove icon');
                        }
                    }

                    sort(th);
                });
            });
        }());
    };
}(window));