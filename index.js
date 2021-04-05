const express = require('express');

const app = express();
const router = require('./router');

app.use(router);

app.listen(8080, (err) => {
    if (err) console.log(err);
    console.log('Server has been started');
});
