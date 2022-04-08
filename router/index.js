const express = require('express');
const jsonParser = express.json();
const router = express.Router();
const methods = require('../functions/methods')

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

    .get('/api/getdescription/:name', async function (req, res) {
        const name = req.params.name;
        let result = await methods.getDescription(name)
        res
            .status(200)
            .send(result);
    })

    .get('/api/endpointsList/:phone', async function (req, res) {
        let result;
        let phone = req.params.phone;
        if (phone.match('(7)([0-9]{10})')) {
//            phone = ['+', phone.slice(0,1), ' (', phone.slice(1,4), ') ', phone.slice(4,7), '-', phone.slice(7,9), '-', phone.slice(9,11)].join('')
            result = await methods.getDatabaseList(phone);
        } else {
            result = {
                code: 1,
                status: "Incorrect phone number"
            }
        }
        res
            .status(200)
            .send(result);
    })

    .post("/api/endpointConfirm", jsonParser, async function (req, res) {
        if(!req.body) return res.sendStatus(400);
        const name = req.body.name;
        const phone = req.body.phone;

        let sendResult = await methods.sendSmsToken(name, phone);

        res
            .status(200)
            .send(sendResult);
    })

    .post("/api/endpointSettings", jsonParser, async function (req, res) {
        if(!req.body) return res.sendStatus(400);
        const name = req.body.name;
        const phone = req.body.phone;
        const smsToken = req.body.smsToken;

        let resData = await methods.getPassword(name, phone, smsToken);

        res
            .status(200)
            .send(resData);
    })

module.exports = router;
