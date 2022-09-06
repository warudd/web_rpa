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

//send report auto
app.get('/que_report_asset', function (req, res) {  
      
    var config = {
        user: 'xxx',
        password: 'xxx',
        server: 'xxx',
        database: 'Bot_DB',
        trustServerCertificate: true
    };
  
    
    sql.connect(config, function (err) {

        if (err) console.log(err);
        console.log("Connecting Success...")
        
        var request = new sql.Request();
        let sqlquery = "SELECT *FROM Que_Asset WHERE status_report='Pending'";
        request.query(sqlquery, function (err, data) {
            if (err) console.log(err+'select_que_pending/que_report_asset') 
         
            if (data.rowsAffected[0] == 0) {
              var json_retunr_Que = { data: "Not Queue" };
              res.send(json_retunr_Que);
  
          } else {
            var File_name=data.recordset[0].File_name;
            var status_for = '';
            let sqlquery = "SELECT *FROM Que_Asset WHERE File_name='"+File_name+"'";
                request.query(sqlquery, function (err, data) {
                    if(err) console.log(err+'select_que_fileinput/que_report_asset')
                    for  (let i = 0 ; i < parseInt(data.rowsAffected) ; i++){
                        var queue = data.recordset[i].status;
                        if (queue != 'Success'){
                            status_for = 'stop'
                            break
                        }
                    }
                    if (status_for == 'stop'){
                        res.status(200).send('Waiting run Asset')
                    }
                    else{
                        let sqlquery_log = "SELECT *FROM Asset_log WHERE File_name='"+File_name+"'";
                        request.query(sqlquery_log, function (err, data){
                            if(err) console.log(err+'select_log_fileinput/que_report_asset')
                            res.status(200).send(data.recordset)
                            let sqlquery_update = "UPDATE Que_Asset SET status_report='Success' WHERE File_name='"+File_name+"'";
                            request.query(sqlquery_update, function (err, data){
                                if(err) console.log(err+'update_que_fileinput/que_report_asset')
                                console.log('Update que report Success');
                            });
                        });
                    }
                });
            }                                                      
        });
    });
});

app.listen(mssql_port, () => {
    console.log('Successfully on port '+mssql_port);
});