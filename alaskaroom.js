'use strict';

/*
[2017-12-21 01:22:46.331] [ERROR] [default] - Error: self signed certificate in certificate chain RequestError: Error: self signed certificate in certificate chain
*/
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'; //todo: check it out whats going on

//todo: find out why flat_utilities are so many

const express = require('express');
const app = express();
const config = require('./config/common');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const logger = require('log4js').getLogger();

logger.setLevel(config.logger.level);

// Prettyfing html output with indentation
app.locals.pretty = true;

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));
app.use(bodyParser.text());

app.use(cookieParser());

app.use(compression());


if (config.app.mode === 'development') {
	app.use(express.static('public'));
}
app.set('views', __dirname + '/view/');
app.set('view engine', 'pug');

app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/site'));

app.all('*', function(req, res, next) {
	res.render('errors/404.pug');
});

app.listen(config.app.port, (err) => {
    if (err) {
        logger.error(`Couldn't start server: ${err.message} ${err.stack}`);
        return;
    }
    logger.info(`Server is listening on port ${config.app.port}`);
});