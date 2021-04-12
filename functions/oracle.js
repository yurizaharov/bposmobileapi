const oracledb = require('oracledb');

module.exports = {

    getretailpoints: async function(dataBase, phone) {
        let connection;
        let sqlQuery = 'select retail_point_id, title from retail_points where phone = \'' + phone + '\'';
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
