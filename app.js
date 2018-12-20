const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'html')

app.use(function(req, res, next) {
    res.header ('Access-Control-Allow-Origin', '*')
    res.header ('Access-Control-Allow-Credentials', true);
    res.header ('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header ('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


app.use(require('./routes/web'))
app.use('/', express.static('public'));

app.listen(3000, () => {
    console.log('Listeting on 3000')
})