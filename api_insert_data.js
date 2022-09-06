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

//insert data to table
app.post('/post_cs_noti_tfu', function (req, res) {
        
    var time_run=req.body.time_run;
    var cs_no=req.body.cs_no;
    var so_no_line=req.body.so_no_line;
    var company=req.body.company;
    
         var config = {
             user: 'xxx',
             password: 'xxx',
             server: 'xxx',
             database: 'Bot_DB',
             trustServerCertificate: true
        };
  
        sql.connect(config, function (err) {
          if (err) console.log("API :/post_cs_noti_tfu"+err);
          var request = new sql.Request();
          let sql_select = "SELECT *FROM line_noti_CSSO_JV WHERE cs_no = '"+cs_no+"'";
          request.query(sql_select, function (err, data) {
            if (err) console.log("API :/post_cs_noti_tfu"+err);
            if (data.rowsAffected[0]==0) {
                let sqlquery_insert = "INSERT INTO line_noti_CSSO_JV (time_run,cs_no,so_no_line,company,status) VALUES ('"+time_run+"','"+cs_no+"','"+so_no_line+"','"+company+"','Pending')";
                request.query(sqlquery_insert, function (err, data) {
                    if(err) console.log("API :/post_cs_noti_tfu"+err);
                    res.send({data : "Insert success"})
            });
        }
            else {
                res.send('Duplicate CS_TFU')
            }
        });
    });
});

app.listen(mssql_port, () => {
    console.log('Successfully on port '+mssql_port);
});