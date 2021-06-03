const oracledb = require('oracledb');

module.exports = {

    getretailpoints: async function(dataBase, phone) {
        let connection;
        let sqlQuery = 'SELECT rp.RETAIL_POINT_ID, rp.TITLE \n' +
            'FROM RETAIL_POINTS rp, PAYMASTER_TOKEN pt \n' +
            'WHERE rp.RETAIL_POINT_ID = pt.RETAIL_POINT_ID \n' +
            'AND pt.IS_DELETE = 0 \n' +
            'AND pt.PHONE = \'' + phone + '\'';
        try {
            let binds, options, result;
            connection = await oracledb.getConnection({
                user: dataBase.user,
                password: dataBase.password,
                connectString: dataBase.connectString
            });

            binds = {};
            options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            };

            result = await connection.execute(sqlQuery, binds, options);

            return result.rows;

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

}
