const axios = require('axios');
const oracle = require('../functions/oracle')
const functions = require('../functions/functions')
const fs = require("fs");

// Setting variables
configServiceAddr = process.env.CONFIGSERVICE_ADDR || '192.168.4.231:20080'

const methods = {
    async getDatabaseList (phone) {
        let allDataBases = [];
        let tasksData = [];
        let response = {};
        let data = [];
        let sqlQuery = fs.readFileSync('./sql/getretailpoints.sql').toString();
        sqlQuery = sqlQuery.replace('phone', phone);

        try {
            allDataBases = await axios.get('http://' + configServiceAddr + '/api/configs/database', { timeout : 15000 })
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }

        for (let k = 0; k < allDataBases.length; k++) {
             let dataBase = allDataBases[k].name;
             let initialData = {
                 'name' : dataBase,
                 'dataBase' : dataBase,
                 'user' : allDataBases[k].user,
                 'password' : allDataBases[k].password,
                 'connectString' : allDataBases[k].connectString,
                 'sqlQuery' : sqlQuery
             }
             tasksData.push(initialData);
         }

        let currentPatches = await functions.parallelProcess(oracle.sqlrequest, tasksData);
        currentPatches = currentPatches.filter(obj => obj.data.length > 0);

        for (let k = 0; k < currentPatches.length; k++) {
            let retailPoints = [];
            currentPatches[k].data.forEach(
                function readParams(currentValue) {
                    retailPoints.push({
                        retailPointId: currentValue['RETAIL_POINT_ID'],
                        title: currentValue['TITLE']
                    });
                }
            );
            let tempData = allDataBases.filter(obj => {
                return obj.name === currentPatches[k].name
            });
            data.push({
                name: currentPatches[k].name,
                description: tempData[0].description,
                retailPoints: retailPoints
            });
        }

        if (data.length) {
            response = {
                code: 0,
                status: "success",
                data: data
            }
        } else {
            response = {
                code: 1,
                status: "Phone number wasn't found"
            }
        }
        return response;
        },

     async sendSmsToken (name, phone) {
        let mobilebackConfig = [];
        try {
            mobilebackConfig = await axios.get('http://' + configServiceAddr + '/api/configs/mobileback/' + name, { timeout : 15000 })
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }

        if (mobilebackConfig[0].name === name) {
            let result = [];
            let sendResult = {};
            try {
                result = await axios.post(mobilebackConfig[0].mobileExt + 'rest/phones/' + phone + '/token', null,
                    { auth : { username: 'admin', password: mobilebackConfig[0].token }, timeout : 15000 })
                    .then((response) => {
                        return response.data;
                    });
            } catch (err) {
                console.log(err);
                result = err;
            }

            if (result.sendState === 'SENT') {
                sendResult.code = 0;
                sendResult.status = 'success';
            } else {
                sendResult.code = 1;
                sendResult.status = result.errorMessage || result.message ;
            }
            return sendResult;
        }
    },

    async getPassword (name, phone, smsToken) {
        let mobilebackConfig = [];
        let resData;
        let result;

        try {
            mobilebackConfig = await axios.get('http://' + configServiceAddr + '/api/configs/mobileback/' + name, { timeout : 15000 })
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }

        try {
            result = await axios.post(mobilebackConfig[0].mobileExt + 'rest/phones/' + phone + '/approving', { code: smsToken } ,
                { auth : { username: 'admin', password: mobilebackConfig[0].token }, timeout : 15000 })
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err);
            result = err;
        }

        if (result.password) {
            resData = {
                "code" : 0,
                "status" : "success",
                "data" :
                    {
                        "backend": mobilebackConfig[0].mobileExt,
                        "token" : result.password
                    }
            };
        } else if (result.code) {
            resData = {
                "code": result.code,
                "status": result.message
            }
        } else {
            resData = {
                "code": 1,
                "status": "Something went wrong"
            }
        }
        return (resData)
    }

}

module.exports = methods;
