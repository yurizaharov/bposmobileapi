const axios = require('axios');
const oracle = require('../functions/oracle')

// Setting variables
configServiceAddr = process.env.CONFIGSERVICE_ADDR || '192.168.4.231:20080'

module.exports = {

    getdatabaselist: async function(phone){
        let allDataBases = [];
        let response = {};
        let data = [];

        try {
            allDataBases = await axios.get('http://' + configServiceAddr + '/api/configs/database')
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }

        for (let k = 0; k < allDataBases.length; k++) {
            let sqlData = await oracle.getretailpointid(allDataBases[k], phone);

            if (sqlData.length !== 0) {
                let retailPointId = sqlData[0]['RETAIL_POINT_ID'];
                data.push({
                    name : allDataBases[k].name,
                    description : allDataBases[k].description,
                    retailPointId : retailPointId
                });
            }
        }

        if (data.length !== 0) {
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

    sendsmstoken: async function (name, phone) {
        let mobilebackConfig = [];
        try {
            mobilebackConfig = await axios.get('http://' + configServiceAddr + '/api/configs/mobileback/' + name)
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
                    { auth : { username: 'admin', password: mobilebackConfig[0].token } })
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

    getpassword: async function (name, phone, smsToken) {
        let mobilebackConfig = [];
        let resData;
        let result;

        try {
            mobilebackConfig = await axios.get('http://' + configServiceAddr + '/api/configs/mobileback/' + name)
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }

        try {
            result = await axios.post(mobilebackConfig[0].mobileExt + 'rest/phones/' + phone + '/approving', { code: smsToken } ,
                { auth : { username: 'admin', password: mobilebackConfig[0].token } } )
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
