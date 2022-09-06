require('dotenv').config();
var {mssql_port} = process.env;
var express = require('express');
var app = express();
app.use(express.json());
var sql = require('mssql');
const bodyParser = require('body-parser');
const req = require('express/lib/request');
const { request } = require('http');
const { type } = require('express/lib/response');
const { parse } = require('path');
app.use(bodyParser.json());

//get data sendline (queue)
app.get('/get_sendque_tfu', function (req, res) { 

    var token_line = 'xxx'

    var config = {
        user: 'xxx',
        password: 'xxx',
        server: 'xxx',
        database: 'Bot_DB',
        trustServerCertificate: true
    };
    sql.connect(config, function (err) {
        if (err) console.log("API:/get_sendque_tfu"+err);
        console.log("Connecting Success...")

        var request = new sql.Request();
        let sqlquery = "SELECT *FROM line_noti_CSSO_JV WHERE status='Pending'";
        request.query(sqlquery, function (err, data) {
            if (err) console.log("API:/get_sendque_tfu"+err) 
         
            else if (data.rowsAffected[0] == 0) {
              var json_retunr_Que = { data: "Not Que" };
              res.send(json_retunr_Que);
                //const url_line_notification = "https://notify-api.line.me/api/notify";
                const lineNotify = require('line-notify-nodejs')(token_line);

                lineNotify.notify({
                    message: json_retunr_Que,
                  }).then(() => {
                    console.log('send completed!');
                  });
            }
            else {
                var total = data.rowsAffected;
                var text = "";
                for (index=0 ; (index<total);index++){
                    cs = data.recordset[index].cs_no;
                    text = text+"\n"+cs
                }
                res.send(data.recordset);
                var all = "ขณะนี้มีเอกสาร Cost Sheet"+"\n"+"อยู่ระหว่างการรอคิวออก SO ทั้งหมด "+total+" ใบ"+text
                //const url_line_notification = "https://notify-api.line.me/api/notify";
                const lineNotify = require('line-notify-nodejs')(token_line);

                lineNotify.notify({
                    message: all,
                  }).then(() => {
                    console.log('send completed!');
                  });
            }
        });
    });
});

app.listen(mssql_port, () => {
    console.log('Successfully on port '+mssql_port);
});