const oracledb = require('oracledb');

const oracle = {

    async sqlrequest (initialData) {
        let connection;
        try {
            let binds, options, result;

            connection = await oracledb.getConnection(initialData);

            binds = {};
            options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            };
            result = await connection.execute(initialData.sqlQuery, binds, options);
            return {
                'name' : initialData.name,
                'data' : result.rows
            };
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

module.exports = oracle;
