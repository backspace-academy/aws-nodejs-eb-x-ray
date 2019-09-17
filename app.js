// Include the AWS X-Ray Node.js SDK and set configuration
var XRay = require('aws-xray-sdk');
var AWS = XRay.captureAWS(require('aws-sdk'));
var http = XRay.captureHTTPs(require('http'));
var S3 = new AWS.S3();

var express = require('express');
var bodyParser = require('body-parser');

AWS.config.region = process.env.AWS_REGION

XRay.config([XRay.plugins.EC2Plugin, XRay.plugins.ElasticBeanstalkPlugin]);
XRay.middleware.setSamplingRules('sampling-rules.json');

var app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({extended:false}));

//  Start AWS X-ray segmnent
app.use(XRay.express.openSegment('myfrontend'));

app.get('/', function(req, res) {
    XRay.captureAsyncFunc('Page Render', function(seg) {
      S3.listBuckets(function(err, data) {
        var bucketList = '';
        if (err) bucketList = JSON.stringify(err); // an error occurred
        else     {                                 // successful response
          for (var a=0; a<data.Buckets.length; a++) {
            bucketList += data.Buckets[a].Name + "<br>"
          }
        }
        res.render('index', {
          title: 'BackSpace Academy and AWS X-Ray',
          bucketList: bucketList
        });
        seg.close();
      });
    });
});

app.use(XRay.express.closeSegment());

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});
