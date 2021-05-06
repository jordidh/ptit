var express = require('express');
var router = express.Router();
const config = require('../config/config');

/**
 * GET user sign in page
 */
router.get('/signin', function(req, res, next) {
  res.render('usersSignIn', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: `no implementat`  });
});

/**
 * POST user sign in
 */
router.post('/signin', function(req, res, next) {
  res.render('usersSignIn', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_success: `Usuari ${req.body.username} signed in correctament`  });
});

/**
 * GET user register page
 */
router.get('/createaccount', function(req, res, next) {
  res.render('usersRegister', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: `no implementat`  });
});

/**
 * POST user register
 */
router.post('/createaccount', function(req, res, next) {
  res.render('usersRegister', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_success: `Usuari ${req.body.username} registrat correctament`  });
});

module.exports = router;
