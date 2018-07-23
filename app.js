// Include the AWS X-Ray Node.js SDK and set configuration
var XRay = require('aws-xray-sdk');
var AWS = XRay.captureAWS(require('aws-sdk'));
var http = XRay.captureHTTPs(require('http'));

var express = require('express');
var bodyParser = require('body-parser');

AWS.config.region = process.env.REGION

XRay.middleware.setSamplingRules('sampling-rules.json');
XRay.middleware.enableDynamicNaming();

var app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({extended:false}));

//Start X-ray segment
app.use(XRay.express.openSegment('myfrontend'));

app.get('/', function(req, res) {
    XRay.captureAsyncFunc('Page Render', function(seg) {
      res.render('index', {
        title: 'BackSpace Academy and AWS X-Ray'
      });
      seg.close();
    });
    res.status(200).end();
});

app.use(XRay.express.closeSegment());

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});
