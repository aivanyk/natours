"use strict";

var jwt = require('jsonwebtoken');

var User = require('../models/userModel');

var catchAsync = require('../utils/catchAsync');

var AppError = require('../utils/appError');

var _require = require('util'),
    promisify = _require.promisify;

var Email = require('../utils/email');

var crypto = require('crypto');

var signToken = function signToken(id) {
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

var createSendToken = function createSendToken(user, statusCode, res) {
  var token = signToken(user._id);
  var cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(function _callee(req, res, next) {
  var newUser, url;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role // passwordChangedAt: req.body.passwordChangedAt,

          }));

        case 2:
          newUser = _context.sent;
          url = "".concat(req.protocol, "://").concat(req.get('host'), "/me");
          _context.next = 6;
          return regeneratorRuntime.awrap(new Email(newUser, url).sendWelcome());

        case 6:
          createSendToken(newUser, 201, res);

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.login = catchAsync(function _callee2(req, res, next) {
  var _req$body, email, password, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, password = _req$body.password; //Check email & password exist

          if (!(!email || !password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Please provide email and password', 404)));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select('+password'));

        case 5:
          user = _context2.sent;
          _context2.t0 = !user;

          if (_context2.t0) {
            _context2.next = 11;
            break;
          }

          _context2.next = 10;
          return regeneratorRuntime.awrap(user.correctPassword(password, user.password));

        case 10:
          _context2.t0 = !_context2.sent;

        case 11:
          if (!_context2.t0) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Incorrect email or password', 401)));

        case 13:
          //Send token to client
          createSendToken(user, 200, res);

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
});

exports.logout = function (req, res) {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(function _callee3(req, res, next) {
  var token, decoded, freshUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // Get token and check if exist
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
          } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
          }

          if (token) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new AppError('You are not logged in!', 401)));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JWT_SECRET));

        case 5:
          decoded = _context3.sent;
          _context3.next = 8;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 8:
          freshUser = _context3.sent;

          if (freshUser) {
            _context3.next = 11;
            break;
          }

          return _context3.abrupt("return", next(new AppError('The user no longer exist', 401)));

        case 11:
          if (!freshUser.changedPasswordAfter(decoded.iat)) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", next(new AppError('User recently changed password! Please login again!', 401)));

        case 13:
          req.user = freshUser;
          res.locals.user = freshUser;
          next();

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //Only for render

exports.isLoggedIn = function _callee4(req, res, next) {
  var token, decoded, freshUser;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;

          if (!req.cookies.jwt) {
            _context4.next = 15;
            break;
          }

          token = req.cookies.jwt; //Verify token

          _context4.next = 5;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JWT_SECRET));

        case 5:
          decoded = _context4.sent;
          _context4.next = 8;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 8:
          freshUser = _context4.sent;

          if (freshUser) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("return", next());

        case 11:
          if (!freshUser.changedPasswordAfter(decoded.iat)) {
            _context4.next = 13;
            break;
          }

          return _context4.abrupt("return", next());

        case 13:
          //There is a logged in user
          res.locals.user = freshUser;
          return _context4.abrupt("return", next());

        case 15:
          _context4.next = 20;
          break;

        case 17:
          _context4.prev = 17;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", next());

        case 20:
          next();

        case 21:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 17]]);
};

exports.restrictTo = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to this action', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(function _callee5(req, res, next) {
  var user, resetToken, resetURL;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context5.sent;

          if (user) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new AppError('No user with email address', 404)));

        case 5:
          //Generate random reset token
          resetToken = user.createPasswordResetToken();
          _context5.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          _context5.prev = 8;
          //Send it to user's email
          resetURL = "".concat(req.protocol, "://").concat(req.get('host'), "/api/v1/users/resetPassword/").concat(resetToken);
          _context5.next = 12;
          return regeneratorRuntime.awrap(new Email(user, resetURL).sendPasswordReset());

        case 12:
          res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
          });
          _context5.next = 22;
          break;

        case 15:
          _context5.prev = 15;
          _context5.t0 = _context5["catch"](8);
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          _context5.next = 21;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 21:
          return _context5.abrupt("return", next(new AppError('Error sending email. Try again later.', 500)));

        case 22:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[8, 15]]);
});
exports.resetPassword = catchAsync(function _callee6(req, res, next) {
  var hashedToken, user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          //Get user based on the token
          hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context6.sent;

          if (user) {
            _context6.next = 6;
            break;
          }

          return _context6.abrupt("return", next(new AppError('Token is invalid or has expired', 400)));

        case 6:
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm;
          user.passwordResetExpires = undefined;
          user.passwordResetToken = undefined;
          _context6.next = 12;
          return regeneratorRuntime.awrap(user.save());

        case 12:
          //Update changedPasswordAt
          //Log user in
          createSendToken(user, 200, res);

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.updatePassword = catchAsync(function _callee7(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select('+password'));

        case 2:
          user = _context7.sent;
          _context7.next = 5;
          return regeneratorRuntime.awrap(user.correctPassword(req.body.oldPassword, user.password));

        case 5:
          if (_context7.sent) {
            _context7.next = 7;
            break;
          }

          return _context7.abrupt("return", next(new AppError('Wrong current password', 401)));

        case 7:
          //Update
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm;
          _context7.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          //Log user in
          createSendToken(user, 200, res);

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  });
});