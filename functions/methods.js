const axios = require('axios');
const oracle = require('../functions/oracle')
const functions = require('../functions/functions')
const responses = require('../responses');
const fs = require('fs');

// Setting variables
configServiceAddr = process.env.CONFIGSERVICE_ADDR || '192.168.4.231:20080'

const methods = {
    async getDatabaseList (phone) {
        let allDataBases = [];
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

        const tasksData = allDataBases.map( db => {
            let dataBase = db.name;
            return {
                'name' : dataBase,
                'dataBase' : dataBase,
                'user' : db.user,
                'password' : db.password,
                'connectString' : db.connectString,
                'sqlQuery' : sqlQuery
            }
        });

        let partnersList = await functions.parallelProcess(oracle.sqlrequest, tasksData);
        partnersList = partnersList.filter(obj => obj.data.length > 0);

        const retailPoints = partnersList.map( partner => {
            return {
                'name' : partner.name,
                'description' : allDataBases.filter( db => {
                    return db.name === partner.name
                }).map( obj => { return obj.description })[0],
                'retailPoints' : partner.data.map( data => {
                    return {
                        'retailPointId' : data['RETAIL_POINT_ID'],
                        'title' : data['TITLE']
                    }
                })
            }
        });

        if (retailPoints.length) {
            return {
                code: 0,
                status: "success",
                data: retailPoints
            }
        } else {
            return {
                code: 1,
                status: "Phone number wasn't found"
            }
        }
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

        if (mobilebackConfig.name === name) {
            let result = [];
            try {
                result = await axios.post(mobilebackConfig.mobileExt + 'rest/phones/' + phone + '/token', null,
                    { auth : { username: 'admin', password: mobilebackConfig.mobileToken }, timeout : 15000 })
                    .then((response) => {
                        return response.data;
                    });
            } catch (err) {
                console.log(err);
                result = err;
            }

            if (result.sendState === 'SENT') {
                return {
                    'code' : 0,
                    'status' : 'success'
                }
            } else {
                return {
                    'code' : 1,
                    'status' : result.errorMessage || result.message
                }
            }
        }
    },

    async getPassword (name, phone, smsToken) {
        let mobilebackConfig = [];
        let bmscardwebConfig = {};
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
            bmscardwebConfig = await axios.get('http://' + configServiceAddr + '/api/configs/bmscardweb/' + name, { timeout : 15000 })
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }

        try {
            result = await axios.post(mobilebackConfig.mobileExt + 'rest/phones/' + phone + '/approving', { code: smsToken } ,
                { auth : { username: 'admin', password: mobilebackConfig.mobileToken }, timeout : 15000 })
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err);
            result = err;
        }

        if (result.password) {
            return {
                "code" : 0,
                "status" : "success",
                "data" :
                    {
                        "backend" : mobilebackConfig.mobileExt,
                        "token" : result.password,
                        "projectID": mobilebackConfig.projectID,
                        "web" : bmscardwebConfig.bmscardwebUrl
                    }
            };
        } else if (result.code) {
            return {
                "code": result.code,
                "status": result.message
            }
        } else {
            return {
                "code": 1,
                "status": "Something went wrong"
            }
        }
    },

    async getDescription (name) {
        let result;
        try {
            const request = await axios.get('http://' + configServiceAddr + '/api/configs/getprojectid/' + name, { timeout: 15000 });
            result = request.data;
        } catch (err) {
            console.log(err)
        }
        if (!result.code) {
            responses.response201.data.name = name;
            responses.response201.data.description = result.description;
            return responses.response201;
        } else {
            return result;
        }
    }

}

module.exports = methods;
