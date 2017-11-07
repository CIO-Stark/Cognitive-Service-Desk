/*global angular, Autolinker*/
(function () {
    'use strict';
    var app = angular.module('custom-directives', []);
    app.directive('autolinker', ['$timeout', '$rootScope', '$compile', function LinkerDirective($timeout, $rootScope, $compile) {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    var eleHtml = element.html();
                    if (!eleHtml) {
                        return false;
                    }

                    var text = Autolinker.link(eleHtml, {
                            className: 'autolinker',
                            newWindow: true
                        }),
                        autolinks = element[0].getElementsByClassName('autolinker'),
                        findBox = eleHtml.indexOf("embed/preview") >= 0,
                        findNewBox = eleHtml.indexOf("embed/s") >= 0,
                        rands = [],
                        prefix = "",
                        i;

                    element.html(text);

                    if (findBox || findNewBox) {

                        if (findBox) {
                            text = eleHtml.split("https://app.box.com");
                            prefix = "https://app.box.com";
                        } else {
                            text = eleHtml.split("https://ibm.ent.box.com");
                            prefix = "https://ibm.ent.box.com";
                        }


				        element.html("");
                        element.append(text[0]);

                        for (i = 1; i < text.length; i += 1) {
                            var rand = parseInt(Math.random() * 10000, 10),
                                pos = text[i].indexOf(" "),
                                link,
                                el,
                                anchor;

                            if (pos < 0) {
                                pos = text[i].length;
                            }

                            rands.push(rand);

                            link = [prefix, text[i].substring(0, pos)].join('');
                            el = angular.element('<span/>');
                            anchor = el.append(['<a href id="link-box', rand, '" class="img-link-box" data-content="', link, '" ng-click="loadFileBox(\'', link, '\')"> </a>'].join(''));
                            $compile(el)($rootScope);
                            element.append(el);
                            element.append(["&nbsp;", text[i].substring(pos, text[i].length)].join(''));
                        }

                    }

                    function bindAutolinker(e) {
                        var href = e.target.href,
                            url = e.srcElement.className.indexOf('url') >= 0;
                        if (href) {
                            window.open(href, '_blank');
                        }

                        e.preventDefault();
                        return false;
                    }

                    for (i = 0; i < autolinks.length; i += 1) {
                        angular.element(autolinks[i]).bind('click', bindAutolinker);
                    }
                }, 0);
            }
        };
    }]);

    app.directive('onReadFile', ['$parse', '$fileReader', '$rootScope', function ($parse, $fileReader, $rootScope) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);

                element.on('change', function (onChangeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (onLoadEvent) {
                        scope.$apply(function () {
                            fn(scope, {$fileContent: onLoadEvent.target.result});
                        });
                    };
                    if (onChangeEvent.target.files.length < 2) {
                        reader.readAsDataURL((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                    } else {
                        $fileReader.readAsDataUrl((onChangeEvent.srcElement || onChangeEvent.target).files[0], $rootScope);
                    }
                });
            }
        };
    }]);
}());