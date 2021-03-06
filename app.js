﻿// Application Log
var log4js = require('log4js');
var log4js_extend = require('log4js-extend');
log4js_extend(log4js, {
    path: __dirname,
    format: '(@file:@line:@column)'
});
log4js.configure(__dirname + '/log4js.json');
var logger = log4js.getLogger('bot');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hashtable = require(__dirname + '/hashtable.js');

// Setup Express Server
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    next();
});

var config = require('fs').readFileSync(__dirname + '/config.json');
config = JSON.parse(config); //字串轉物件

app.get('/api', function (request, response) {
    response.send('API is running test');
});

app.get('/logs', function (request, response) {
    var stream = require('fs').createReadStream('logs/messaging.log');
    stream.pipe(response);
});

app.post('/messages', function (request, response) {
    response.send('');
    logger.info(request.body);
    var results = request.body.events;
    logger.info(JSON.stringify(results));
    logger.info('receive message count: ' + results.length);
    for (var idx = 0; idx < results.length; idx++) {
        var acct = results[idx].source.userId;
        var reply_token = results[idx].replyToken;
        logger.info('reply token: ' + results[idx].replyToken);
        logger.info('createdTime: ' + results[idx].timestamp);
        logger.info('from: ' + results[idx].source.userId);
        logger.info('type: ' + results[idx].type);
        if (results[idx].type == 'follow') {
            GetProfile(acct, function (ret) {
            });
            SendQuickReplies(acct, 'momopchomethirtytwotest032', reply_token, function (ret) {
            });
        } else if (results[idx].type == 'message') {
            if (results[idx].message.type == 'text') {
                /*SendMessage(acct, results[idx].message.text, 'momopchomethirtytwotest032', reply_token, function (ret) {
                });*/
                if (results[idx].message.text == '三一粉絲團') {
                    //getbirthday(acct);
                    SendMessage(acct, '三一粉絲團: line://app/1553729874-3rEq98qb', 'momopchomethirtytwotest032', reply_token, function (ret) {
                    });
                } else {
                    SendQuickReplies(acct, 'momopchomethirtytwotest032', reply_token, function (ret) {
                    });
                }
            }
        }
    }
});

var http = require('http');
var server = http.Server(app);	// create express server
var options = {
    pingTimeout: 60000,
    pingInterval: 3000
};
var listener = server.listen(process.env.port || process.env.PORT || 3978, function () {
   logger.info('Server listening to ' + listener.address().port); 
});

process.on('uncaughtException', function (err) {
    logger.error('uncaughtException occurred: ' + (err.stack ? err.stack : err));
});

// 傳送訊息給 LINE 使用者
function SendMessage(userId, message, password, reply_token, callback) {
    if (password == 'momopchomethirtytwotest032') {
        var data = {
            'to': userId,
            'messages': [
                { 'type': 'text', 'text': message }
            ]
        };
        logger.info('傳送訊息給 ' + userId);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

function SendQuickReplies(userId, password, reply_token, callback) {
    if (password == 'momopchomethirtytwotest032') {
        var data = {
            'to': userId,
            'messages': [
                {
                    "type": "text",
                    "text": "你好，歡迎蒞臨三一購物，可至粉絲團留言喔:)",
                    "quickReply": {
                        "items": [
                            {
                                "type": "action",
                                "imageUrl": "https://obs.line-scdn.net/0hb2-WGX3KPR0QLhfzDtFCSixrM3BnADtVaElxfWItYyVoGXxCKx1xemZ5MHg-F3MYLktwcjYvZCQ6/preview",
                                "action": {
                                    "type": "message",
                                    "label": "查看三一粉絲團",
                                    "text": "三一粉絲團"
                                }
                            }
                        ]
                    } //end
                }
            ]
        }; //end data
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
};
function sendtoGM(userId, message, password, callback) {
    if (password == 'momopchomethirtytwotest032') {
        var data = {
            'to': userId,
            'messages': [
                { 'type': 'text', 'text': message }
            ]
        };
        PostToLINE(data, config.channel_access_token, this.callback);
    }
}

// 傳送[可點選圖片]給 LINE 使用者
function SendImagemap(userId, baseUrl, altText, imagemap, password, reply_token, callback) {
    if (password == 'momopchomethirtytwotest032') {
        var data = {
            'to': userId,
            'messages': [{
                "type": "imagemap",
                "baseUrl": baseUrl,
                "altText": altText,
                "baseSize": {
                    "height": 693,
                    "width": 1040
                },
                "actions": imagemap
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        logger.info('傳送圖片網址: ' + baseUrl);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}
// 傳送【選單】給 LINE 使用者
function SendButtons(userId, image_url, title, text, buttons, alt_text, password, reply_token, callback) {
    if (password == 'momopchomethirtytwotest032') {
        var data = {
            'to': userId,
            'messages': [{
                'type': 'template',
                'altText': alt_text,
                'template': {
                    'type': 'buttons',
                    'thumbnailImageUrl': image_url,
                    'title': title,
                    'text': text,
                    'actions': buttons
                }
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送【確認】給 LINE 使用者
function SendConfirm(userId, text, buttons, alt_text, password, reply_token, callback) {
    if (password == 'momopchomethirtytwotest032') {
        var data = {
            'to': userId,
            'messages': [{
                'type': 'template',
                'altText': alt_text,
                'template': {
                    'type': 'confirm',
                    'text': text,
                    'actions': buttons
                }
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送【可滾動選單】給 LINE 使用者
function SendCarousel(userId, columns, password, reply_token, callback) {
    if (password == 'momopchomethirtytwotest032') {
        var data = {
            'to': userId,
            'messages': [{
                'type': 'template',
                'altText': '請至行動裝置檢視訊息',
                'template': {
                    'type': 'carousel',
                    'columns': columns
                }
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 直接回覆訊息給 LINE 使用者
function ReplyMessage(data, channel_access_token, reply_token, callback) {
    data.replyToken = reply_token;
    logger.info(JSON.stringify(data));
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/bot/message/reply',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Content-Length': Buffer.byteLength(JSON.stringify(data)),
            'Authorization': 'Bearer <' + channel_access_token + '>'
        }
    };
    var https = require('https');
    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
        });
        res.on('end', function () {
        });
        logger.info('Reply message status code: ' + res.statusCode);
        if (res.statusCode == 200) {
            logger.info('Reply message success');
            this.callback(true);
        } else {
            logger.info('Reply message failure');
            this.callback(false);
        }
    }.bind({ callback: callback }));
    req.write(JSON.stringify(data));
    req.end();
}

// 取得 LINE 使用者資訊
function GetProfile(userId, callback) {
    var https = require('https');
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/bot/profile/' + userId,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer <' + config.channel_access_token + '>'
        }
    };

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
            if (res.statusCode == 200) {
                var result = JSON.parse(chunk);
                logger.info('displayName: ' + result.displayName);
                logger.info('userId: ' + result.userId);
                logger.info('pictureUrl: ' + result.pictureUrl);
                logger.info('statusMessage: ' + result.statusMessage);
                sendtoGM('Ubbbbabf971ea4f62d5598f1e846f908d', 'name姓名:' + result.displayName + ', id:' + result.userId + ', pic:' + result.pictureUrl + ', status:' + result.statusMessage, 'momopchomethirtytwotest032', function (ret) {
                });
                sendtoGM('U51a27329ecd362cbecd7e253b1037ea4', 'name姓名:' + result.displayName + ', id:' + result.userId + ', pic:' + result.pictureUrl + ', status:' + result.statusMessage, 'momopchomethirtytwotest032', function (ret) {
                });
                callback(result);
            } if (res.statusCode == 401) {
                logger.info('IssueAccessToken');
                IssueAccessToken();
            }
        });
    }).end();
}

function PostToLINE(data, channel_access_token, callback) {
    logger.info(JSON.stringify(data));
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/bot/message/push',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Content-Length': Buffer.byteLength(JSON.stringify(data)),
            'Authorization': 'Bearer <' + channel_access_token + '>'
        }
    };
    var https = require('https');
    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
        });
    });
    req.write(JSON.stringify(data));
    req.end();
    try {
        callback(true);
    } catch (e) { };
}
function IssueAccessToken() {
    var https = require('https');
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/oauth/accessToken',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    options.form = {};
    options.form.grant_type = 'client_credentials';
    options.form.client_id = config.channel_id;
    options.form.client_secret = config.channel_secret;

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
            if (res.statusCode == 200) {
                var result = JSON.parse(chunk);
                config.channel_access_token = result.access_token;
                var fs = require('fs');
                fs.writeFile(__dirname + '/config.json', JSON.stringify(config), function (err) {
                    if (err) {
                        logger.error(e);
                    }
                });
            }
        });
    }).end();
}