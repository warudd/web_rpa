require('dotenv').config();
var {mssql_port,token_line} = process.env;
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
             user: 'sa',
             password: 'bzknCuj6@6',
             //server: '172.24.4.197',
             server: '203.154.39.197',
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
                request.query(sqlquery_insert, function (err, data2) {
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
// get data sendline (queue)
app.get('/get_sendque_tfu', function (req, res) { 

    var token_line = '9iR2ytnJibWglY1a1lq29t47aWGoHkDg7Z6YTfBRV2B'

    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
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
// get mapdata > update status table
app.get('/get_mapdata_tfu', function (req, res) {  

    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
        database: 'Bot_DB'
    };
    sql.connect(config, function (err) {
  
        var request = new sql.Request();
        let sql_select = "SELECT *FROM line_noti_CSSO_JV WHERE status = 'Pending'";
        request.query(sql_select, function (err, data) {
            if (err) console.log("select.pending API : /get_mapdata_tfu"+err)
            if (data.rowsAffected[0]==0){
                if (err) console.log("data.rowaffected API : /get_mapdata_tfu"+err)
                res.send({message : "No data"});
            }  
        
            else {
                var cs_no = data.recordset[0].cs_no;
                let sqlquery = "SELECT *FROM line_noti_CSSO_JV JOIN Log_CS_JV ON line_noti_CSSO_JV.cs_no = Log_CS_JV.Paperlass_No WHERE cs_no = '"+cs_no+"'";
                request.query(sqlquery, function (err, data) {
                    if(err) console.log("select.join API : /get_mapdata_tfu"+err)
                    if(data.rowsAffected[0]==0){
                        let sql_select = "SELECT *FROM Que_CS_JV WHERE CostSheet_No = '"+cs_no+"'";
                        request.query(sql_select, function (err, data) {
                            if(err) console.log("select.que_sendSO API : /get_mapdata_tfu"+err)
                            if(data.recordset[0].status == 'Send SO'){
                                let sqlquery_update = "UPDATE line_noti_CSSO_JV SET status = 'On Process',so_no_line = 'Send_SO' WHERE cs_no = '"+cs_no+"'";
                                request.query(sqlquery_update, function (err, data) {
                                    if(err) console.log("update.cspending API : /get_mapdata_tfu"+err)
                                    res.send('Send_SO Pending')
                                });
                            }
                            else {
                                let sqlquery_update = "UPDATE line_noti_CSSO_JV SET so_no_line = 'Pending',status = 'On Process' WHERE cs_no = '"+cs_no+"'";
                                request.query(sqlquery_update, function (err, data) {
                                    if(err) console.log("update.que_cspending API : /get_mapdata_tfu"+err)
                                    res.send('CS Pending')
                                });
                            }
                        });
                    }

                    else {
                    res.send(data.recordset[0])
                    var SO_No = data.recordset[0].SO_No;
                    var Jobstatus = data.recordset[0].Jobstatus;
                        if(Jobstatus == 'Fail' || Jobstatus == 'Reject'){
                            let sqlquery_update = "UPDATE line_noti_CSSO_JV SET status = 'On Process',so_no_line = '"+Jobstatus+"' WHERE cs_no ='"+cs_no+"'";
                            request.query(sqlquery_update, function (err, data) {
                                if(err) console.log("update.sono(fail) API : /get_mapdata_tfu"+err)
                                console.log('Update (Jobstatus.Fail) TFU Success...')
                            })
                        }
                        else{
                            let sqlquery_update = "UPDATE line_noti_CSSO_JV SET status = 'On Process',so_no_line = '"+SO_No+"' WHERE cs_no ='"+cs_no+"'";
                            request.query(sqlquery_update, function (err, data) {
                                if(err) console.log("update.sono(success) API : /get_mapdata"+err)
                                console.log('Update SO_No success...')
                            })
                        }
                    }
                });
            };
        });
    });
});

app.listen(mssql_port, () => {
    console.log('Successfully on port '+mssql_port);
});