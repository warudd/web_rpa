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

//get mapdata > update status table_db
app.get('/get_mapdata_tfu', function (req, res) {  

    var config = {
        user: 'xxx',
        password: 'xxx',
        server: 'xxx',
        database: 'Bot_DB',
        trustServerCertificate: true
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