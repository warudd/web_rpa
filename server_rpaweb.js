require('dotenv').config();
const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const {mssql_port} = process.env;
const sql = require('mssql');
const cors = require('cors');
const corsOption = {
    origin:'*',
    credentials : true,
};
app.use(cors(corsOption));
app.use(express.json());

// const db_ConnectionString = 'mssql://sa:bzknCuj6@203.154.39.197:3000/Bot_DB'
// const db = sql.connect(db_ConnectionString);
const config = {
    user: 'sa',
    password: 'bzknCuj6@6',
    //server: '172.24.4.197',
    server: '203.154.39.197',
    database: 'Bot_DB',
    trustServerCertificate: true
};

sql.connect(config, function (err) {
    if (err) console.log("sql_connect"+err);

    app.post('/check_cs', (req,response) => {
    var request = new sql.Request();
    var input_cs = req.body.Paperlass_No;
        request.query("SELECT *FROM SO_V2_Log WHERE Folder_Name = '"+input_cs+"'",(err , data) => {
            if(err) console.log('select_err'+err)
            if(input_cs == undefined){
                console.log('Why you send undefined?')
            }
            else if(data.rowsAffected != 0){
            const tag_p_o = "<p><center>";
            const tag_p_c = "</center></p>";
            console.log('input_cs : '+input_cs)
                const entry_date = data.recordset[0].Entry_Date;
                const cs_no = data.recordset[0].Paperlass_No;
                const so_no = data.recordset[0].SO_No;
                const cs_status = data.recordset[0].Costsheet_Status;
                const job_status = data.recordset[0].Jobstatus;
                const data_json ={
                    "entry_date":entry_date,
                    "cs_no":cs_no,
                    "so_no":so_no,
                    "cs_status":cs_status,
                    "job_status":job_status
                }
                console.log(data_json)
            response.header('Access-Control-Allow-Origin','*');
            // response.setHeader('Content-Type','text/html; charset=UTF-8');
            response.statusCode = 200;
            response.send(data_json);
            }
            else {
                response.send({message : 'no cs'})
            }
        })
    });
    app.post('/rerun_cs', (req,response) => {
        let request = new sql.Request();
        var input_cs = req.body.Paperlass_No;
            request.query("SELECT *FROM Que_V2_Bot WHERE type_Doc = 'Costsheet' And doc_id = '"+input_cs+"'",(err , data) => {
                if(err) console.log('select_err'+err)
                if(input_cs == undefined){
                    console.log('Why you send undefined?')
                }
                else if(data.rowsAffected != 0){
                request.query("UPDATE Que_V2_Bot SET status = 'Pending' WHERE type_Doc = 'Costsheet' And doc_id = '"+input_cs+"'",(err , data) => {
                    if(err) console.log('Update_err '+err)
                    request.query("SELECT *FROM Que_V2_Bot WHERE type_Doc = 'Costsheet' And doc_id = '"+input_cs+"'",(err , data) => {
                    console.log(input_cs)
                    console.log(data)
                    const status_queue = data.recordset[0].Status_Queue;
                    const data_json = {
                        "status_q":status_queue
                    }
                    console.log(data_json)
                    response.header('Access-Control-Allow-Origin','*');
                    response.statusCode = 200;
                    response.send(data_json);
                    })
                })
                }
                else {
                    response.send({message : 'no cs update'})
                }
            })
    });
});
app.listen(mssql_port, () => {
    console.log('Successfully on port '+mssql_port);
});