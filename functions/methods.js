const axios = require('axios');

// Setting variables
configServiceAddr = process.env.CONFIGSERVICE_ADDR || '192.168.4.231:20080'

module.exports = {

/*    getinitialdata: async function () {
        let initialData = [];
        try {
            initialData = await axios.get('http://' + initialDataURL + '/api/configs/liquicheck')
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }
        return initialData;
    }

 */
    getinitialdata: function () {
        const initialData = {
            "code" : 0,
            "status" : "success",
            "data" : [
                {
                    "name": "dev122",
                    "description" : "Тестовая база 4.122"
                },
                {
                    "name": "dev150",
                    "description" : "Тестовая база 4.150"
                }
            ]
        };
        return initialData;
    },

    sendsmstoken: async function (name, phone) {
        let backendConfig = [];
        try {
            backendConfig = await axios.get('http://' + configServiceAddr + '/api/configs/mobileback/' + name)
                .then((response) => {
                    return response.data;
                });
        } catch (err) {
            console.log(err)
        }

        if (backendConfig[0].name === name) {
            let result = [];
            let data;
            let sendResult = {};
            try {
                result = await axios.post(backendConfig[0].mobileExt + 'rest/phones/' + phone + '/token', data,
                    { auth : { username: 'admin', password: backendConfig[0].token } })
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
    }

}
