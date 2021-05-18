var express = require('express');
var router = express.Router();
const config = require('../config/config');
var passport = require('passport');

let PersistentData = require('../database/database');
let data = new PersistentData().getInstance();

const MAX_NUM_TOP_URLS = 5;

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
router.get('/profile', require('connect-ensure-login').ensureLoggedIn(), async function(req, res, next) {
  res.locals.userLogged = req.user;

  let myUrls = await data.getUsersUrlPairs(req.user.id);
  if (myUrls.error.length > 0) {
    return res.render('usersProfile', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: myUrls.error[0] });
  }

  res.render('usersProfile', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, myUrls : myUrls.result });
});

/**
 * newUrlPair page. 
 * Cerca a la BD si existeix l'enllaç curt i si NO el troba
 * crea una nova parella d'enllaços curt-llarg
 */
router.get('/newUrlPair', require('connect-ensure-login').ensureLoggedIn(), async function(req, res, next) {
  //res.render('index', { title: 'Ptit' });
  try {
    res.locals.userLogged = req.user;

    //let found = urls.find(u => u.urlptita === req.query.urlptita);
    let found = await data.getUrlPairFromPtit(req.query.urlptita);

    // Error recuperant la url de la BD
    if (found && found.error.length > 0) {
      req.log.error(found.error[0]);
      return res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: found.error[0] });
    }

    // URL repetida
    
    if (found && found.result.length > 0) {
      req.log.error(`${req.query.urlptita} url already exists`);
      return res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: `${req.query.urlptita} url already exists` });
    }

    // Creem la url
    let now = (new Date()).getTime();

    // Definim la duració de la parella d'enllaços, només si hi ha usuari registrat permetem duració indefinida
    let endsAt = 0;
    if (req.query.duracio === "Permanent") {
      if (req.user && req.user.id) {
        endsAt = 0;
      } else {
        endsAt = now + 172800000;
      }
    } else {
      endsAt = (req.query.duracio === "24" ? now + 86400000 : now + 172800000 );
    }

    let newPair = {
      ptitUrl: req.query.urlptita,
      url: req.query.urlllarga,
      createdAt: now,
      endsAt: endsAt,
      userId: (req.user && req.user.id ? req.user.id : 0)
    }

    let created = await data.saveNewUrlPair(newPair);

    // Error creant la url de la BD
    if (created && created.error.length > 0) {
      req.log.error(created.error[0]);
      return res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: created.error[0] });
    }

    // Recuperem les parelles d'enllaços de l'usuari
    let myUrls = await data.getUsersUrlPairs(req.user.id);
    if (myUrls.error.length > 0) {
      return res.render('usersProfile', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: myUrls.error[0] });
    }

    req.log.info(`${req.query.urlptita} url created`);
    return res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_success: `${req.query.urlptita} url created`, myUrls: myUrls.result });

  } catch(e) {
    req.log.error(e);
    res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: e.message });
  }
});

/**
 * delUrlPair page. 
 * Elimina de la BD si existeix la parella d'enllaços
  */
router.get('/delUrlPair/:id', require('connect-ensure-login').ensureLoggedIn(), async function(req, res, next) {
  //res.render('index', { title: 'Ptit' });
  try {
    res.locals.userLogged = req.user;

    //let found = urls.find(u => u.urlptita === req.query.urlptita);
    let deleted = await data.deleteNewUrlPair(req.params.id);

    // Error recuperant la url de la BD
    if (deleted && deleted.error.length > 0) {
      req.log.error(deleted.error[0]);
      return res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: deleted.error[0] });
    }

    // Recuperem les parelles d'enllaços de l'usuari
    let myUrls = await data.getUsersUrlPairs(req.user.id);
    if (myUrls.error.length > 0) {
      return res.render('usersProfile', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: myUrls.error[0] });
    }

    req.log.info(`${req.params.id} url deleted`);
    return res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_success: `${req.params.id} url deleted`, myUrls: myUrls.result });

  } catch(e) {
    req.log.error(e);
    res.render('usersProfile', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: e.message });
  }
});

module.exports = router;
