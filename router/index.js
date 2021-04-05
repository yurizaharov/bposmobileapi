const express = require('express');
const jsonParser = express.json();
const router = express.Router();
const {getinitialdata} = require('../functions/methods.js')
const {sendsmstoken} = require('../functions/methods.js')

router
    .use(function timeLog(req, res, next) {
        if(req.url !== '/ping') {
            const currentDate = new Date().toLocaleString('ru-RU');
            console.log (currentDate, '-', req.connection.remoteAddress.split(':')[3], '-', req.url);
        }
        next();
    })

    .get('/ping', function(req, res) {
        res
            .status(200)
            .send('BPOSMobileAPI');
    })

    .get('/api/endpointsList/:phone', async function (req, res) {
        const phone = req.params.phone;
        console.log(phone);
        let initialData = await getinitialdata();
        res
            .status(200)
            .send(initialData);
    })

    .post("/api/endpointConfirm", jsonParser, async function (req, res) {
        if(!req.body) return res.sendStatus(400);
        const name = req.body.name;
        const phone = req.body.phone;

        let sendResult = await sendsmstoken(name, phone);
        console.log(sendResult)

        res
            .status(200)
            .send(sendResult);
    })

    .post("/api/endpointSettings", jsonParser, async function (req, res) {
        if(!req.body) return res.sendStatus(400);
        const name = req.body.name;
        const phone = req.body.phone;
        const smsToken = req.body.smsToken;

        console.log(name, phone, smsToken)

        const resData = {
            "code" : 0,
            "status" : "success",
            "data" :
                {
                    "backend": "https://st-02.stage.bms.group/mobile/",
                    "token" : "qTyM6VWqqP6Y"
                }
        };
        res
            .status(200)
            .send(resData);
    })

module.exports = router;
