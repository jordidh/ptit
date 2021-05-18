var express = require('express');
var router = express.Router();
const config = require('../config/config');

const urls = require('../database/urls.json');

let PersistentData = require('../database/database');
let data = new PersistentData().getInstance();

/**
 * /api/ptittUrl
 * Cerca a la BD si existeix l'enllaç curt i si el troba el retorna
 */
router.get('/:ptitUrl', async function(req, res, next) {
  //res.render('index', { title: 'Ptit' });
  try {
    res.locals.userLogged = req.user;

    //let found = urls.find(u => u.urlptita === req.query.urlptita);
    let found = await data.getUrlPairFromPtit(req.params.ptitUrl);

    // Error recuperant la url de la BD
    if (found && found.error.length > 0) {
      req.log.error(found.error[0]);
      return res.json({error: found.error[0] });
    }

    // URL no trobada
    if (found && found.result.length <= 0) {
      req.log.error(`${req.query.urlptita} url not found`);
      return res.json({error: `${req.params.ptitUrl} url not found` });
    } else {
      // Recollim informació de l'usuari iel relacionem amb l'enllaç que prem
      // TODO

      // Marquem que s'ha clickat
      let clicked = await data.clickUrlPair(found.result[0].id);
      if (clicked && clicked.error.length > 0) {
        req.log.error(found.error[0]);
        return res.json({error: found.error[0] });
      }

      // Si trobem l'enllaç petit a la BD el retornem
      res.json(found.result[0]);
    }
  } catch(e) {
    req.log.error(e);
    return res.json({error: e.message });
  }
});

module.exports = router;
