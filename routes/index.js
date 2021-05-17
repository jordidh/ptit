var express = require('express');
var router = express.Router();
const config = require('../config/config');

const urls = require('../database/urls.json');

let PersistentData = require('../database/database');
let data = new PersistentData().getInstance();

const MAX_NUM_TOP_URLS = 5;

/**
 * GET home page.
 */
router.get('/', async function(req, res, next) {
  try {
    res.locals.userLogged = req.user;
    
    let topUrls = await data.getMostClickedUrlPairs(MAX_NUM_TOP_URLS);

    // Error recuperant la url de la BD
    if (topUrls && topUrls.error.length > 0) {
      req.log.error(topUrls.error[0]);
      return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: topUrls.error[0] });
    }

    res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, topUrls: topUrls.result });
  } catch(e) {
    req.log.error(e);
    res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: e.message });
  }
});

/**
 * GOTO page. 
 * Cerca a la BD si existeix l'enllaç curt i si el troba redirecciona 
 * al seu enllaç llarg vinculat.
 */
router.get('/goto', async function(req, res, next) {
  //res.render('index', { title: 'Ptit' });
  try {
    res.locals.userLogged = req.user;

    //let found = urls.find(u => u.urlptita === req.query.urlptita);
    let found = await data.getUrlPairFromPtit(req.query.urlptita);

    // Error recuperant la url de la BD
    if (found && found.error.length > 0) {
      req.log.error(found.error[0]);
      return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: found.error[0] });
    }

    // URL no trobada
    if (found && found.result.length <= 0) {
      req.log.error(`${req.query.urlptita} url not found`);
      return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: `${req.query.urlptita} url not found` });
    } else {
      // Recollim informació de l'usuari iel relacionem amb l'enllaç que prem
      // TODO

      // Marquem que s'ha clickat
      let clicked = await data.clickUrlPair(found.result[0].id);
      if (clicked && clicked.error.length > 0) {
        req.log.error(found.error[0]);
        return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: found.error[0] });
      }

      // Si trobem l'enllaç petit a la BD redireccionem
      res.redirect(found.result[0].url);
    }
  } catch(e) {
    req.log.error(e);
    res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: e.message });
  }
});

/**
 * newTempUrlPair page. 
 * Cerca a la BD si existeix l'enllaç curt i si NO el troba
 * crea una nova parella d'enllaços curt-llarg
 */
router.get('/newTempUrlPair', async function(req, res, next) {
  //res.render('index', { title: 'Ptit' });
  try {
    res.locals.userLogged = req.user;

    //let found = urls.find(u => u.urlptita === req.query.urlptita);
    let found = await data.getUrlPairFromPtit(req.query.urlptita);

    // Error recuperant la url de la BD
    if (found && found.error.length > 0) {
      req.log.error(found.error[0]);
      return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: found.error[0] });
    }

    // URL repetida
    
    if (found && found.result.length > 0) {
      req.log.error(`${req.query.urlptita} url already exists`);
      return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: `${req.query.urlptita} url already exists` });
    }

    // Creem la url
    let now = (new Date()).getTime();
    let newPair = {
      ptitUrl: req.query.urlptita,
      url: req.query.urlllarga,
      createdAt: now,
      endsAt: (req.query.duracio === "24" ? now + 86400000 : now + 172800000 ),
      userId: (req.user && req.user.id ? req.user.id : 0)
    }

    let created = await data.saveNewUrlPair(newPair);

    // Error creant la url de la BD
    if (created && created.error.length > 0) {
      req.log.error(created.error[0]);
      return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: created.error[0] });
    }

    let topUrls = await data.getMostClickedUrlPairs(MAX_NUM_TOP_URLS);

    // Error recuperant la url de la BD
    if (topUrls && topUrls.error.length > 0) {
      req.log.error(topUrls.error[0]);
      return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: topUrls.error[0] });
    }

    req.log.info(`${req.query.urlptita} url created`);
    return res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_success: `${req.query.urlptita} url created`, topUrls: topUrls.result });

  } catch(e) {
    req.log.error(e);
    res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: e.message });
  }
});

module.exports = router;
