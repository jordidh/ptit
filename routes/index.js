var express = require('express');
var router = express.Router();
const config = require('../config/config');

const urls = require('../database/urls.json');

/**
 * GET home page.
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ptit' });
});

/**
 * GOTO page. 
 * Cerca a la BD si existeix l'enllaç curt i si el troba redirecciona 
 * al seu enllaç llarg vinculat.
 */
router.get('/goto', function(req, res, next) {
  //res.render('index', { title: 'Ptit' });
  try {
    let found = urls.find(u => u.urlptita === req.query.urlptita);

    if (found) {
      // Recollim informació de l'usuari iel relacionem amb l'enllaç que prem
      // TODO

      // Si trobem l'enllaç petit a la BD redireccionem
      res.redirect(found.url);
      //res.render('index', { title: 'Ptit', m_alert: `no implementat`  });
    } else {
      // Sinó el trobem tornem a la pàgina incial indicant l'error
      res.render('index', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: `Enllaç "${req.query.urlptita}" no trobat`  });
    }
  } catch(e) {
    res.render('index', { title: 'Ptit', baseUrl : config.APP_CLIENT_BASE_URL, m_alert: e.message });
  }
});

module.exports = router;
