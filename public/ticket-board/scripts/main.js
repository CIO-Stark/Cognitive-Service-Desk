/**
 * Created by danielabrao on 7/14/16.
 */
(function (document) {
    "use strict";

    var $ = require('jquery');

    $(document).ready(function () {
        if (/constructor/i.test(window.HTMLElement)) {
            $("#content-wrapper").css('display', '-webkit-box');
        }

        var menu = $("#menu-btn"),
            sideMenu = $("#side-menu"),
            searchInput = $("#search-input"),
            ticketTable = $("#new-ticket-table"),
            newTicketLoading = false,
            resolvedTicketTable = $("#resolved-ticket-table"),
            resolvedTicketLoading = false,
            newTicketBookmark,
            resolvedTicketBookmark,
            loggedUser = $("#username").text(),
            selectedRow;

        var ticketModule = require('./ticket-board.script')(),
            ticketColumns = ['Number', 'Question', 'Reason', 'Date', 'Employee', 'Language', 'Country'],
            resolvedTicketColumns = ['Number', 'Question', 'Reason', 'Date', 'Employee', 'Language', 'Country', 'ResolvedBy', 'ResolutionDate'];

        //CLOSE TICKET POPUP
        function closePopup () {

            $(".actions").unbind('click');
            $(".block").unbind('click');

            $("#ticket p").remove();
            $("#ticket-resolution").val(" ");
            $("#main").removeClass('backdrop');
            $(".popup").removeClass('visible');
        }

        //INSTANTIATE TICKET POPUP
        function createPopup (data) {

            if (!data) {
                return;
            }

            $(".block").click(function () {
               closePopup();
            });

            var ticketObj = {},
                cols = ticketModule.ticketFactory.getTicketColumns();
            $("#ticket-no").text(['Ticket #', data[0]].join(''));
            ticketObj.default = data[0];
            for (var i = 1; i < (data.length - 1); i += 1) {
                ticketObj[cols[i]] = data[i];
                $("#ticket").append(['<p><span>', ticketColumns[i], ': </span>', data[i], '</p>'].join(''));
            }

            $("#main").addClass('backdrop');
            $(".popup").addClass('visible');

            $(".actions").click(function () {

                // if ($(this).text() === 'Resolver') {
                //     data[data.length - 1] = ''
                // } else {
                //
                // }
                ticketObj.status = 'resolved';
                ticketObj.resolvedBy = loggedUser;
                ticketObj.resolutionTime = new Date();
                ticketObj.comments = $('#ticket-resolution').val();

                ticketModule.ticketFactory.updateTicket($.Deferred(), $.ajax, ticketObj).then(function (succ) {
                    selectedRow.remove();
                    closePopup();
                });

                data = [];
            });
        }

        $(".close").click(function () {
           closePopup();
        });

        //Attach handlers to the table rows after sort
        function attachHandler (table) {
            if (table === 'new') {

                $("#new-ticket-table tbody tr td").not('.action-button').click(function () {
                    $(this).parent().toggleClass('selected');
                });

                $(".action-button").click(function () {
                    var dataArr = [];
                    selectedRow = $(this).parent().children();

                    selectedRow.map(function (n) {
                        dataArr.push($(selectedRow[n]).html());
                    });

                    createPopup(dataArr);
                });


            } else {
                $("#resolved-ticket-table tbody tr").click(function () {
                    $(this).toggleClass('selected');
                });
            }
        }

        // LISTENER TO TRIGGER ATTACH HANDLER
        window.x = {
            aInternal: 10,
            aListener: function(val) {},
            set a(val) {
                this.aInternal = val;
                this.aListener(val);
            },
            get a() {
                return this.aInternal;
            },
            registerListener: function(listener) {
                this.aListener = listener;
            }
        };

        window.x.registerListener(function(val) {
            if ($("div.active table").attr('id') === 'new-ticket-table') {
                return attachHandler('new');
            } else {
                attachHandler();
            }
        });


        function fetchNewTickets () {
            ticketModule.ticketFactory.fetchTickets($.Deferred(), $.ajax, 'new', 20, false, false, true).then(function (ticketObj) {
                newTicketBookmark = ticketObj.bookmark;
                ticketObj.ticketArr.map(function (ticket) {
                    $("#new-ticket-table tbody").append(['<tr>', ticket, '</tr>'].join(''));
                });
                sortable(document.getElementById("new-ticket-table"), ticketModule.ticketFactory.getTicketColumns());
                attachHandler('new');
                ticketTable.show();
            });
        }

        function fetchResolvedTickets () {
            ticketModule.ticketFactory.fetchTickets($.Deferred(), $.ajax, 'resolved', 20, null, 'asc').then(function (ticketObj) {
                resolvedTicketBookmark = ticketObj.bookmark;
                ticketObj.ticketArr.map(function (ticket) {
                    $("#resolved-ticket-table tbody").append(['<tr>', ticket, '</tr>'].join(''));
                });
                sortable(document.getElementById("resolved-ticket-table"), ticketModule.ticketFactory.getResolvedTicketColumns());
                attachHandler();
                resolvedTicketTable.show();
            });
        }

        //AJAX PROMISI-FIED
        fetchNewTickets();
        fetchResolvedTickets();

        //SIDE MENU
        menu.click(function () {
            sideMenu.toggle();
        });

        //CONTROL ACTIVE TAB
        $('[data-tab]').on('click', function (e) {
            e.preventDefault();
            console.log($(this).attr('data-tab'));
            if ($(this).attr('data-tab') === '1') {
                $('#download').attr('href', '/retrieveTickets/?status=new&limit=199&sort=asc&report=true');
            } else {
                $('#download').attr('href', '/retrieveTickets/?status=resolved&limit=199&sort=asc&report=true');
            }

            $(this).addClass('active').siblings('.tab').removeClass('active');
            $('#tst [' + ['data-content=', $(this).data('tab'), ']'].join('')).addClass('active').siblings('[data-content]').removeClass('active');
        });


        //INFINITE SCROLL
        $("#content-wrapper").scroll(function () {
            if ($(this).scrollTop() + $(this).height() === ($(this)[0].scrollHeight)) {
                if ($("div.active table").attr('id') === 'new-ticket-table') {

                    if (newTicketLoading) {
                        return;
                    }

                    if (!newTicketBookmark) {
                        console.log('end of results');
                        return;
                    }

                    newTicketLoading = true;

                    ticketModule.ticketFactory.fetchTickets($.Deferred(), $.ajax, 'new', 5, newTicketBookmark).then(function (ticketObj) {
                        newTicketBookmark = ticketObj.bookmark;
                        ticketObj.ticketArr.map(function (ticket) {
                            $("div.active table tbody").append(['<tr>', ticket, '</tr>'].join(''));
                            $("div.active table tbody tr:last-child").click(function () {
                                $(this).toggleClass('selected');
                            });
                            $("div.active table tbody tr:last-child .action-button").click(function () {
                                var dataArr = [];
                                selectedRow = $(this).parent().children();

                                selectedRow.map(function (n) {
                                    dataArr.push($(selectedRow[n]).html());
                                });

                                createPopup(dataArr);
                            });
                        });

                        newTicketLoading = false;
                    });
                } else {

                    if (resolvedTicketLoading) {
                        return;
                    }

                    if (!resolvedTicketBookmark) {
                        console.log('end of results');
                        return;
                    }


                    ticketModule.ticketFactory.fetchTickets($.Deferred(), $.ajax, 'resolved', 5, resolvedTicketBookmark).then(function (ticketObj) {
                        resolvedTicketBookmark = ticketObj.bookmark;
                        ticketObj.ticketArr.map(function (ticket) {
                            $("div.active table tbody").append(['<tr>', ticket, '</tr>'].join(''));
                            $("div.active table tbody tr:last-child").click(function () {
                                $(this).toggleClass('selected');
                            });
                            $("div.active table tbody tr:last-child .action-button").click(function () {
                                var dataArr = [];
                                selectedRow = $(this).parent().children();

                                selectedRow.map(function (n) {
                                    dataArr.push($(selectedRow[n]).html());
                                });

                                createPopup(dataArr);
                            });
                        });
                        resolvedTicketLoading = false;
                    });
                }
            }
        });

        //SEARCH BAR
        searchInput.keyup(function () {
            if (!searchInput.val()) {
                $(".active table tbody tr").each(function () {
                    $(this).show();
                });
            } else {
                var searchString = new RegExp(searchInput.val().toLowerCase(), 'g'),
                    flag,
                    control = false,
                    filterString = ['td.', $("#filter").val()].join('');
                $(".active table tbody tr").each(function () {
                    var currentTr = $(this);
                    flag = false;
                    $(this).find(filterString).each(function () {
                        if ($(this).text().toLowerCase().match(searchString)) {
                            flag = true;
                        }
                        if (flag) {
                            currentTr.show();
                            control = true;
                        } else {
                            currentTr.hide();
                        }

                    });
                });

                if (!control) {
                    console.log('no results found');
                }
            }
        });

        //REFRESH TICKET LIST
        $("#refresh").click(function () {
            if ($("div.active table").attr('id') === 'new-ticket-table') {
                $("#new-ticket-table tbody tr").remove();
                fetchNewTickets();
            } else {
                $("#resolved-ticket-table tbody tr").remove();
                fetchResolvedTickets();
            }
        });
    });
}(window.document));