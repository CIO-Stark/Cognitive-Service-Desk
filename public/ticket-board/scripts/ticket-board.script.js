/**
 * Created by danielabrao on 7/13/16.
 */
module.exports = function fetcherModule() {
    "use strict";


    var ticketFactory = {

        getTicketColumns: function () {
            return ['default', 'userQuestion', 'reason', 'timestamp', 'requester', 'ticketLanguage', 'employeeCountry', 'action-button'];
        },
        getResolvedTicketColumns: function () {
            return ['default', 'requester', 'employeeCountry', 'reason', 'timestamp', 'statusChangeDate', 'resolvedBy', 'ticketResolution'];
        },
        fetchTickets: function (q, ajax, status, limit, bookmark, sort) {

            if (!q) {
                return 'Missing promise engine';
            }
            ajax({
                url: [
                    "/retrieveTickets",
                    status ? ['?status=', status].join('') : '',
                    limit ? ['&limit=', limit].join('') : '',
                    bookmark ? ['&bookmark=', bookmark].join('') : '',
                    sort ? ['&sort=', sort].join('')  : ''
                 ].join(''),
                type: 'get',
                success: function (data) {
                    var auxArr = [];
                    if (data.rows.length > 0) {

                        data.rows.map(function (ticket) {

                            if (status === 'new') {
                                auxArr.push([
                                    '<td class="default">', ticket.fields.default, '</td>',
                                    '<td class="userQuestion">', ticket.fields.userQuestion, '</td>',
                                    '<td class="reason">', ticket.fields.reason, '</td>',
                                    '<td class="timestamp">', ticket.fields.timestamp, '</td>',
                                    '<td class="requester">', ticket.fields.requester, '</td>',
                                    '<td class="ticketLanguage">', ticket.fields.ticketLanguage, '</td>',
                                    '<td class="employeeCountry">', ticket.fields.employeeCountry, '</td>',
                                    '<td class="action-button">0</td>'
                                ].join(''));
                            } else {
                                auxArr.push([
                                    '<td class="default">', ticket.fields.default, '</td>',
                                    '<td class="requester">', ticket.fields.requester, '</td>',
                                    '<td class="employeeCountry">', ticket.fields.employeeCountry, '</td>',
                                    '<td class="reason">', ticket.fields.reason, '</td>',
                                    '<td class="timestamp">', ticket.fields.timestamp, '</td>',
                                    '<td class="statusChangeDate">', ticket.fields.statusChangeDate, '</td>',
                                    '<td class="resolvedBy">', ticket.fields.resolvedBy, '</td>',
                                    '<td class="ticketResolution">', ticket.fields.resolution || 'null', '</td>'
                                ].join(''));
                            }

                        });

                        q.resolve({
                            bookmark: data.bookmark,
                            ticketArr: auxArr
                        });
                    } else {
                        q.resolve({
                            bookmark: '',
                            ticketArr: []
                        });
                    }
                },
                error: function (err) {
                    q.reject(err);
                }
            });
            return q.promise();
        },
        updateTicket: function (q, ajax, ticket) {

            if (!q) {
                return 'Missing promise engine';
            }

            if (!ticket) {
                return false;
            }

            ajax({
                url: "/updateTicket",
                type: 'post',
                data: {
                    ticket: ticket
                },
                success: function (data) {
                   console.log(data);
                    q.resolve(data);
                },
                error: function (err) {
                    console.log(err);
                }
            });
            return q.promise();
        }
    };

    return {
        ticketFactory: ticketFactory
    };

};