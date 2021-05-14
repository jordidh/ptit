const sqlite = require("./sqlite3");

/**
 * Classe per guardar dades del bot de forma persistent
 * Es fa servir una BD SqLite
 * 
 * Es fa servir de la següent manera:
 * var PersistentData = require('./database');
 * var data = new PersistentData().getInstance();
 */
class PersistentData {

    constructor() {
        this.active = false;
    }

    CheckDatabaseTables = async function() {
        try {
            // Taula d'usuaris
            await sqlite.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                createdAt REAL NOT NULL,
                loggedAt REAL NOT NULL,
                lastActionAt REAL NOT NULL,
                active INTEGER NOT NULL
            )`);

            // Taula de parelles de url petites i grans temporals i permanents
            await sqlite.run(`CREATE TABLE IF NOT EXISTS urlPair (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ptitUrl TEXT NOT NULL UNIQUE,
                url TEXT NOT NULL,
                createdAt REAL NOT NULL,
                endsAt REAL,
                userId INTEGER,
                clicks INTEGER DEFAULT 0
            )`);

            return {
                "error": [ ],
                "result": [ "Database checked successfully" ]
            }
        } catch (err) {
            return {
                "error": [ "Database checked with errors " + err.message ],
                "result": [ ]
            }
        }
    }

    /**
     * Funció que recupera una parella d'enllaços a partir de l'enllaç curt
     * Retorna un objecte del tipus:
     * {
     *      "error": [],
     *      "result": []
     * }
     * @param {*} urlptita : string amb el codi de la urlptita
     */
    getUrlPairFromPtit = async function(ptitUrl) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM urlPair WHERE ptitUrl = '${ptitUrl}' LIMIT 1`);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                return {
                    "error" : [],
                    "result" : data
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que obté els parells d'urls més clickats
     * @param {*} topUrlPairs 
     */
    getMostClickedUrlPairs = async function(topUrlPairs) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM urlPair ORDER BY clicks DESC LIMIT ${topUrlPairs}`);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                return {
                    "error" : [],
                    "result" : data
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que crea un nou parell url
     * @param {*} urlpair 
     */
    saveNewUrlPair = async function(urlpair) {
        try {
            let sql = `INSERT INTO urlPair (ptitUrl, url, createdAt, endsAt, userId) 
                       VALUES ('${urlpair.ptitUrl}', 
                               '${urlpair.url}', 
                                ${urlpair.createdAt}, 
                                ${urlpair.endsAt}, 
                                ${urlpair.userId})`;

            let result = await sqlite.run(sql);

            return {
                "error" : [ ],
                "result" : result
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que incrementa els clicks d'un parell d'urls
     * @param {*} urlpair 
     */
    clickUrlPair = async function(id) {
        try {
            let sql = `UPDATE urlPair SET clicks = clicks + 1 WHERE id = ${id};`;
            let result = await sqlite.run(sql);

            return {
                "error" : [ ],
                "result" : result
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }






    /**
     * Funció que recuperem l'última dada emmagatzemada per aquest mercat
     * Retorna una cosa del tipus: {
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * }
     * @param {*} marketId : id del mercat que es recuperarà
     */
    getLastMarketData = async function(marketId) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM marketData WHERE market = '` + marketId + `' ORDER BY windowEnd DESC LIMIT 1`);
            if (data && data != null && Array.isArray(data) && data.length > 0 && data[0].indicatorValues){
                data[0].indicatorValues = JSON.parse(data[0].indicatorValues);
                return {
                    "error" : [],
                    "result" : data[0]
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que recuperem les últimes dades emmagatzemades per aquest mercat
     * Retorna una cosa del tipus: [{
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * },...]
     * @param {*} marketId : id del mercat que es recuperarà
     * @param {*} limit : numero màxim de dades que es recuperaran
     */
    getLastMarketDatasDesc = async function(marketId, limit) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM marketData WHERE market = '` + marketId + `' ORDER BY windowEnd DESC LIMIT ` + limit);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                // Parsegem a json en totes les dades obtingudes
                for (let i = 0; i < data.length; i++) {
                    data[i].indicatorValues = JSON.parse(data[i].indicatorValues);  
                }

                return {
                    "error" : [],
                    "result" : data
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que recuperem les últimes dades emmagatzemades per aquest mercat
     * Retorna una cosa del tipus: [{
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * },...]
     * @param {*} marketId : id del mercat que es recuperarà
     * @param {*} limit : numero màxim de dades que es recuperaran
     */
    getLastMarketDatasAsc = async function(marketId, limit) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM marketData WHERE market = '` + marketId + `' ORDER BY windowEnd DESC LIMIT ` + limit);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                // Parsegem a json en totes les dades obtingudes
                for (let i = 0; i < data.length; i++) {
                    data[i].indicatorValues = JSON.parse(data[i].indicatorValues);  
                }

                return {
                    "error" : [],
                    // Li donem la volta per tenir-los en mode ascendent
                    "result" : data.reverse()
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que guarda dades d'un mercat a la BD
     * @param {*} data : objecte del tipus: {
     *   market : "id",
     *   windowStart : 1614933060,
     *   windowEnd : 1614945000,
     *   price : 34,
     *   indicatorValues : [
     *     { "name" : "DEMA", "period" : 20, "value" : 34 },
     *     { "name" : "DEMA", "period" : 50, "value" : 34 }
     *   ],
     *   decision : "realx"
     * }
     */
    saveCurrentMarketData = async function(data) {
        try {
            let sql = `INSERT INTO marketData (market, windowStart, windowEnd, price, indicatorValues, decision) 
                       VALUES ('` + data.market + `',` + 
                                    data.windowStart + `,` + 
                                    data.windowEnd + `,` + 
                                    data.price + `,'` + 
                                    JSON.stringify(data.indicatorValues) + `','` + 
                                    data.decision + `')`;

            let result = await sqlite.run(sql);

            return {
                "error" : [ ],
                "result" : result
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }


    /**
     * Funció que recupera els diferents mercats emmagatzemats a la tula de logs
     */
    getMarkets = async function() {
        try {
            let sql = "SELECT DISTINCT market FROM marketData";
            let data = await sqlite.all(sql);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                return {
                    "error" : [],
                    "result" : data
                }
            } else {
                return {
                    "error" : [],
                    "result" : []
                }
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que retorna l'última decisió presa d'un mercat
     * Sinó existeix retorna result = { id:0, market: market.id, decision:"", price: 0 }
     * @param {*} marketId 
     */
    getLastMarketDecision = async function(marketId) {
        try {
            let data = {};

            data = await sqlite.all(`SELECT * FROM marketLastDecision WHERE market = '` + marketId + `' LIMIT 1`);
            if (data && data != null && Array.isArray(data) && data.length > 0){
                return {
                    "error" : [],
                    "result" : data[0]
                }
            } else {
                return {
                    "error" : [],
                    "result" : {
                        id: 0,
                        market: marketId,
                        decision: "",
                        price: 0
                    }
                }
            }
        } catch (err) {
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    /**
     * Funció que guarda l'última decisió
     * Si l'objecte que es proporciona no té id o aquest és null o 0 es fa un insert, sinó un replace
     * @param {*} data 
     */
    saveLastMarketDecision = async function(data) {
        try {
            let sql = "";
            if (data.id && data.id != null && data.id > 0) {
                sql = `REPLACE INTO marketLastDecision (id, market, price, timestamp, decision) 
                       VALUES (` + data.id + `'` + 
                            data.market + `',` + 
                            data.price + `,` + 
                            (new Date()).getTime() + `,'` + 
                            data.decision + `')`;
            } else {
                sql = `INSERT INTO marketLastDecision (market, price, timestamp, decision) 
                       VALUES (` +
                           `'` + data.market + `',` + 
                           data.price + `,` + 
                           (new Date()).getTime() + `,'` + 
                           data.decision + `')`;
            }

            console.log(sql);

            let result = await sqlite.run(sql);

            return {
                "error" : [ ],
                "result" : result
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }

    deleteLastMarketDecision = async function(marketId) {
        try {
            let sql = `DELETE FROM marketLastDecision WHERE market = '` + marketId + `'`;

            let result = await sqlite.run(sql);

            return {
                "error" : [ ],
                "result" : result
            }
        } catch (err) {
            console.error(err);
            return {
                "error" : [ err ],
                "result" : []
            }
        }
    }
}

class Singleton {

  constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new PersistentData();
        }
    }

    getInstance() {
        return Singleton.instance;
    }
}

module.exports = Singleton;