var express = require('express');
var router = express.Router();

/**
 * GET user sign in page
 */
router.get('/signin', function(req, res, next) {
  res.render('usersSignIn', { title: 'Ptit', m_alert: `no implementat`  });
});

/**
 * POST user sign in
 */
router.post('/signin', function(req, res, next) {
  res.render('usersSignIn', { title: 'Ptit', m_success: `Usuari ${req.body.username} signed in correctament`  });
});

/**
 * GET user register page
 */
router.get('/createaccount', function(req, res, next) {
  res.render('usersRegister', { title: 'Ptit', m_alert: `no implementat`  });
});

/**
 * POST user register
 */
router.post('/createaccount', function(req, res, next) {
  res.render('usersRegister', { title: 'Ptit', m_success: `Usuari ${req.body.username} registrat correctament`  });
});

module.exports = router;
