require('dotenv').config();
const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const {mssql_port} = process.env;
const sql = require('mssql');
const { dirname } = require('path');
const { toWeb } = require('form-data');
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

//  app.get('/SO_V2_Log', (req,response) => {
//     const { method,url } = req;
//     var request = new sql.Request();
//     var Paperlass_No = req.body.Paperlass_No;
//     console.log(Paperlass_No)
// //Paperlass_No = '"+Paperlass_No+"'
//         request.query("SELECT *FROM SO_V2_Log WHERE Folder_name = 'CS-202201021611'",(err , data) => {
//             if(err) console.log('select_err'+err)
//             const tag_p_o = "<p><center>";
//             const tag_p_c = "</center></p>";
//             console.log(Paperlass_No)
//             // const entry_date = data.recordset[0].Entry_Date;
//             // const cs_no = data.recordset[0].Paperlass_No;
//             // const so_no = data.recordset[0].SO_No;
//             // const cs_status = data.recordset[0].Costsheet_Status;
//             // const job_status = data.recordset[0].Jobstatus;
//             //var to_web = tag_p_o+send_web+tag_p_c;

//             response.header('Access-Control-Allow-Origin','*');
//             response.setHeader('Content-Type','text/html; charset=UTF-8');
//             response.statusCode = 200;
//             response.end('data');
            
//         })
//     });

    app.post('/testtest', (req,response) => {
    var request = new sql.Request();
    var input_cs = req.body.Paperlass_No;
        request.query("SELECT *FROM SO_V2_Log WHERE Folder_Name = '"+input_cs+"'",(err , data) => {
            if(err) console.log('select_err'+err)
            if(input_cs == undefined){
                console.log('Why you send undefined?')
            }
            else{
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
        })
    });
});
app.listen(mssql_port, () => {
    console.log('Successfully on port '+mssql_port);
});