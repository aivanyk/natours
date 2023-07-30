"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bookTour = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _alerts = require("./alerts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var stripe = Stripe('pk_test_51NZ4bSAcN7x1Z132Eh6S3b4iqF1EfwyF85n6fQZfVglW1fuz9KBckw8IYmKbE4rk3thMiEbfm2qLX7l4ONALP6H800NmqFv70P');

var bookTour = function bookTour(tourId) {
  var session;
  return regeneratorRuntime.async(function bookTour$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _axios["default"])("http://127.0.0.1:3000/api/v1/bookings/checkout-session/".concat(tourId)));

        case 3:
          session = _context.sent;
          console.log(session);
          _context.next = 7;
          return regeneratorRuntime.awrap(stripe.redirectToCheckout({
            sessionId: session.data.session.id
          }));

        case 7:
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);
          (0, _alerts.showAlert)('error', _context.t0);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

exports.bookTour = bookTour;