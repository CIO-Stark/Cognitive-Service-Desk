/**
 * Created by danielabrao on 7/14/16.
 */
"use strict";

var chai = require('chai');
    chai.should();
var expect = chai.expect,
    should = chai.should(),
    assert = chai.assert,
    chaiAsPromised = require("chai-as-promised"),
    jsdom = require('jsdom');

    chai.use(chaiAsPromised);

describe('TicketFetcher', function () {
    it('should exist', function () {
        var TicketFetcher = require('../scripts/ticket-board.script')();
        expect(TicketFetcher).to.not.be.undefined;


        describe('#fetchTickets()', function () {
            it('should receive jQuery objects and fetch the current ticket list', function (done) {
                jsdom.env(
                    '',
                    ["http://code.jquery.com/jquery-3.1.0.js"],
                    function (err, window) {

                        TicketFetcher.ticketFactory.fetchTickets(window.$.Deferred(), window.$.ajax).then(function (data) {
                            expect(data).to.be.a('array');
                            return done();
                        }, function (err) {
                            return done(new Error(JSON.stringify(err)));
                        });
                    });

                // return Promise.resolve(2 + 2).should.eventually.equal(4);
            });
        });

    });
});





