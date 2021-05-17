var express = require('express');
var router = express.Router();
const config = require('../config/config');
var passport = require('passport');

let PersistentData = require('../database/database');
let data = new PersistentData().getInstance();

/**
 * GET user sign in page
 */
router.get('/signin', function(req, res, next) {
  res.locals.userLogged = req.user;
  let message = "";
  if (req.flash) {
    message = req.flash("message");
    res.render('usersSignIn', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: message });
  } else {
    res.render('usersSignIn', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL });
  }
});

/**
 * POST user sign in
 */
router.post('/signin', passport.authenticate('local', { successRedirect: '/users/profile', failureRedirect: '/users/signin', failureFlash: true }), function(req, res, next) {
  res.render('usersSignIn', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_success: `Usuari ${req.body.username} signed in correctament`  });
});

/**
 * GET user register page
 */
router.get('/createaccount', function(req, res, next) {
  res.locals.userLogged = req.user;
  res.render('usersRegister', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL  });
});

/**
 * POST user register
 */
router.post('/createaccount', async function(req, res, next) {
  try {
    // Verifiquem que el password i el repassword són iguals
    if (req.body.password !== req.body.repassword) {
      return res.render('usersRegister', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: "Les contrasenyes han de ser iguals" });
    }

    let newUser = await data.saveNewUser(req.body.username, req.body.password);
    if (newUser.error.length > 0) {
      return res.render('usersRegister', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: newUser.error[0] });
    }
    res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_success: `Usuari ${req.body.username} registrat correctament` });
  } catch(e) {
    req.log.error(e);
    res.render('usersRegister', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message });
  }
});

/**
 * GET users private profile page
 */
router.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res, next) {
  res.locals.userLogged = req.user;
  res.render('usersProfile', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL  });
});

module.exports = router;
