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
             user: 'xxx',
             password: 'xxx',
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
//get data sendline (queue)
app.get('/get_sendque_tfu', function (req, res) { 

    var token_line = '9iR2ytnJibWglY1a1lq29t47aWGoHkDg7Z6YTfBRV2B'

    var config = {
        user: 'xxx',
        password: 'xxx',
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
//get mapdata > update status table_db
app.get('/get_mapdata_tfu', function (req, res) {  

    var config = {
        user: 'xxx',
        password: 'xxx',
        //server: '172.24.4.197',
        server: '203.154.39.197',
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
//send report auto
app.get('/que_report_asset', function (req, res) {  
      
    var config = {
        user: 'xxx',
        password: 'xxx',
        //server: '172.24.4.197',
        server: '203.154.39.197',
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

//PPLV3
//Post Insert DB from pplv3 (PRD)
app.post('/data_v3',function (req,res){
    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
        database: 'Bot_DB',
        trustServerCertificate: true
    };
var account_id = req.body.account_id;
var email_user = req.body.email_user;
var transaction_id = req.body.transaction_id;
var document_id = req.body.document_id;
var flow_account = req.body.flow_account;
var pdf_base = req.body.pdf_base;
var json_data = req.body.json_data;
var external_data = req.body.external_data;
var action_type = req.body.action_type;
var approver = req.body.approver;
var others_data = req.body.others_data;
var attach_file = req.body.attach_file;
var approver2 = (JSON.stringify(approver));
var external_data2 = (JSON.stringify(external_data));
var others_data2 = (JSON.stringify(others_data));
var datetime = new Date(new Date().getTime()+(3600*1000*7)).toISOString();
var dateAll=datetime.split("T");
var timeAll=dateAll[1].split(".");
var date = new Date();
var month=date.getMonth()+1;
var day=date.getDate();
var year=date.getFullYear().toString();
var Time_create=day+"/"+month+"/"+year+" "+timeAll[0];
var split_docid=document_id.split("-");
var type_docid=split_docid[0];
console.log(Time_create)

if(type_docid=="CNREC"){
    var type_docid = "CN";
}
if(action_type=="reject" || action_type=="cancel"){
    res.send("Not send document to bot , reject or cancel")
}
else {
    sql.connect(config, function (err) {
        if (err) console.log("API: /data_v3"+err);
        var request = new sql.Request();
        let sqlquery_botid = "SELECT *FROM Runing_Bot_PPLV3 WHERE type ='"+type_docid+"'";
            request.query(sqlquery_botid, function (err, data) {
            if (err) console.log("API: /grninet_data/botid"+err)
            var table_name = data.recordset[0].table_name;
            if (month<10){
                        month = "0"+month;
                        console.log("month");
            };
                var string_month = String(month);
                var string_year = String(year);
                var string_YM = string_year+string_month;
                var num_id = data.recordset[0].bot_id;
                var split_id = num_id.split("-");
                var split_YM = split_id[0].split("_");
                var id = parseInt(split_id[1])+1;
                var zero = "";
            if(String(split_YM[2]) ==string_YM){
                    console.log(String(id).length);
                    for (let index = 0; index < (10-(String(id).length)); index++){
                    zero = zero +"0";
                    }
                    var Bot_id = "BOT_"+type_docid+"_"+string_YM+"-"+zero+String(id);
                    console.log(Bot_id)
                }
            else {
                console.log(String(id).length);
                var set_newid = "0000000000";
                var set_idtoint = parseInt(set_newid)+1;
                for (let index = 0; index < (10-(String(set_idtoint).length)); index++){
                    zero = zero +"0";
                }
                var Bot_id = "BOT_"+type_docid+"_"+string_YM+"-"+zero+String(set_idtoint);
                console.log(Bot_id);
            }
                let sql_query = "SELECT *FROM "+table_name+" WHERE document_id = '"+document_id+"'";
                request.query(sql_query, function (err,data) {
                    if(err)console.log("API: /data_v3"+err)
                    if(data.rowsAffected[0]==0){
                        let sqlquery_insert = "INSERT Into "+table_name+" (Time_create,account_id,email_user,transaction_id,document_id,flow_account,pdf_base,json_data,external_data,action_type,approver,others_data,attach_file,Status_Queue,Bot_id) VALUES ('"+Time_create+"','"+account_id+"','"+email_user+"','"+transaction_id+"','"+document_id+"','"+flow_account+"','"+pdf_base+"','"+json_data+"','"+external_data2+"','"+action_type+"','"+approver2+"','"+others_data2+"','"+attach_file+"','Pending','"+Bot_id+"')"
                        request.query(sqlquery_insert, function (err, data){
                            if(err) console.log("API: /data_v3(Insert)"+err)
                            res.send('Insert /data_v3 Success..')
                                let sqlquery_update = "UPDATE Runing_Bot_PPLV3 SET bot_id = '"+Bot_id+"' WHERE type='"+type_docid+"'";
                                request.query(sqlquery_update, function (err, data) {
                                    if(err) console.log("API Update :/data_v3"+err)
                                    console.log('Update Bot_id /data_v3 Success...')
                                });
                        })
                    }
                    else{
                    res.send('Duplicate File')
                    }
                })
            })
    })
}
});
//Post Insert DB from pplv3 (UAT)
app.post('/uatdata_v3',function (req,res){
    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
        database: 'Bot_DB',
        trustServerCertificate: true
    };
var account_id = req.body.account_id;
var email_user = req.body.email_user;
var transaction_id = req.body.transaction_id;
var document_id = req.body.document_id;
var flow_account = req.body.flow_account;
var pdf_base = req.body.pdf_base;
var json_data = req.body.json_data;
var external_data = req.body.external_data;
var action_type = req.body.action_type;
var approver = req.body.approver;
var others_data = req.body.others_data;
var attach_file = req.body.attach_file;
var approver2 = (JSON.stringify(approver));
var external_data2 = (JSON.stringify(external_data));
var others_data2 = (JSON.stringify(others_data));
var datetime = new Date(new Date().getTime()+(3600*1000*7)).toISOString();
var dateAll=datetime.split("T");
var timeAll=dateAll[1].split(".");
var date = new Date();
var month=date.getMonth()+1;
var day=date.getDate();
var year=date.getFullYear().toString();
var Time_create=day+"/"+month+"/"+year+" "+timeAll[0];
var split_docid=document_id.split("-");
var type_docid=split_docid[0];
console.log(Time_create)

if(type_docid=="CNREC"){
    var type_docid = "CN";
}
if(action_type=="reject" || action_type=="cancel"){
    res.send("Not send document to bot , reject or cancel")
}
else {
    sql.connect(config, function (err) {
        if (err) console.log("API: /uatdata_v3"+err);
        var request = new sql.Request();
        let sqlquery_botid = "SELECT *FROM UAT_Runing_Bot_PPLV3 WHERE type ='"+type_docid+"'";
            request.query(sqlquery_botid, function (err, data) {
            if (err) console.log("API: /uatdata_v3"+err)
            var table_name = data.recordset[0].table_name;
            console.log(table_name)
            if (month<10){
                        month = "0"+month;
            };
                var string_month = String(month);
                var string_year = String(year);
                var string_YM = string_year+string_month;
                var num_id = data.recordset[0].bot_id;
                var split_id = num_id.split("-");
                var split_YM = split_id[0].split("_");
                var id = parseInt(split_id[1])+1;
                var zero = "";
            if(String(split_YM[2]) ==string_YM){
                    console.log(String(id).length);
                    for (let index = 0; index < (10-(String(id).length)); index++){
                    zero = zero +"0";
                    console.log("if1");
                    }
                    var Bot_id = "UATBOT_"+type_docid+"_"+string_YM+"-"+zero+String(id);
                    console.log(Bot_id)
                }
            else {
                console.log(String(id).length);
                var set_newid = "0000000000";
                var set_idtoint = parseInt(set_newid)+1;
                for (let index = 0; index < (10-(String(set_idtoint).length)); index++){
                    zero = zero +"0";
                    console.log("if2");
                }
                var Bot_id = "UATBOT_"+type_docid+"_"+string_YM+"-"+zero+String(set_idtoint);
            }
                let sql_query = "SELECT *FROM "+table_name+" WHERE document_id = '"+document_id+"'";
                request.query(sql_query, function (err,data) {
                    if(err)console.log("API: /uatdata_v3"+err)
                    if(data.rowsAffected[0]==0){
                        let sqlquery_insert = "INSERT Into "+table_name+" (Time_create,account_id,email_user,transaction_id,document_id,flow_account,pdf_base,json_data,external_data,action_type,approver,others_data,attach_file,Status_Queue,Bot_id) VALUES ('"+Time_create+"','"+account_id+"','"+email_user+"','"+transaction_id+"','"+document_id+"','"+flow_account+"','"+pdf_base+"','"+json_data+"','"+external_data2+"','"+action_type+"','"+approver2+"','"+others_data2+"','"+attach_file+"','Pending','"+Bot_id+"')"
                        request.query(sqlquery_insert, function (err, data){
                            if(err) console.log("API: /uatdata_v3(Insert)"+err)
                            res.send('Insert /uatdata_v3 Success..')
                                let sqlquery_update = "UPDATE UAT_Runing_Bot_PPLV3 SET bot_id = '"+Bot_id+"' WHERE type='"+type_docid+"'";
                                request.query(sqlquery_update, function (err, data) {
                                    if(err) console.log("API Update :/uatdata_v3"+err)
                                    console.log('Update Bot_id /uatdata_v3 Success...')
                                });
                        })
                    }
                    else{
                    res.send('Duplicate File')
                    }
                })
            })
    })
}
});
//Get RFC_data pplv3
app.get('/rfc_data', function (req, res) {  

    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
        database: 'Bot_DB',
        trustServerCertificate: true
    };
    sql.connect(config, function (err) {
  
        var request = new sql.Request();
        let sqlquery = "SELECT *FROM RFC_data WHERE Status_Queue = 'Pending'";
        request.query(sqlquery, function (err, data) {
            if (err) console.log("API : /get_RFC_dataV3"+err)
            if (data.rowsAffected[0]==0)
            res.send({message : "No data"});
            else {
                res.send(data.recordset[0])
                var docid_data = data.recordset[0].document_id;
                let sqlquery_update = "UPDATE RFC_data SET Status_Queue = 'On Process' WHERE document_id ='"+docid_data+"'";
                request.query(sqlquery_update, function (err, data) {
                    if(err) console.log("API : /get_RFC_dataV3"+err)
                    console.log('Update status_queue success...')
                });
            }
        })
    });
});

//mail_certax (newque+inputdata)
//Post Que+Input mailcertax
app.post('/que_input_mct_art', function (req, res) {

    var que_no=req.body.que_no;
    var year_doc = req.body.year_doc;
    var time_file=req.body.time_file;
    var receipt_date = req.body.receipt_date;
    var receipt_no = req.body.receipt_no;
    var inv_no = req.body.inv_no;
    var amount = req.body.amount;
    var cus_no = req.body.cus_no;
    var cus_name = req.body.cus_name;
    var mail_cus = req.body.mail_cus;
    var finance_ar = req.body.finance_ar;
    var datetime = new Date(new Date().getTime()+(3600*1000*7)).toISOString();
    var dateAll=datetime.split("T");
    var timeAll=dateAll[1].split(".");
    var date = new Date();
    var month=date.getMonth()+1;
    var day=date.getDate();
    var year=date.getFullYear().toString();
    var Time_create=day+"/"+month+"/"+year+" "+timeAll[0];
    console.log(Time_create)

    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
        database: 'Bot_DB',
        trustServerCertificate: true
    };
    sql.connect (config, function (err) {
        if (err) console.log("API : /que_input_mct_art"+err);
        console.log("Connecting Success...")
        var request = new sql.Request();
  
        let sql_select_input = "SELECT *FROM mail_certax_input_ART WHERE que_no='"+que_no+"' AND inv_no='"+inv_no+"'AND cus_no='"+cus_no+"'";
        request.query(sql_select_input , function(err , data) {
            if (data.rowsAffected[0]==0){
                let sqlquery_insert = "INSERT INTO mail_certax_input_ART (que_no,receipt_date,receipt_no,inv_no,amount,cus_no,cus_name,mail_cus,finance_ar) VALUES ('"+que_no+"','"+receipt_date+"','"+receipt_no+"','"+inv_no+"','"+amount+"','"+cus_no+"','"+cus_name+"','"+mail_cus+"','"+finance_ar+"')"
                request.query(sqlquery_insert , function(err,data) {
                    if(err) res.send('Insert Error...')
                    if(err) console.log("API : /insert_input_mct_art"+err)
                    res.send('Insert Success...')
                        let sqlquery = "SELECT *FROM Que_Mail_certax_ART WHERE que_no='"+que_no+"' AND cus_no='"+cus_no+"'";
                        request.query(sqlquery, function (err, data) {
                            if (data.rowsAffected[0] == 0) {
                            let sqlquery_botid = "SELECT bot_id FROM Running_Bot WHERE type ='MCT'";
                            request.query(sqlquery_botid, function (err, data) {
                            if (err) console.log("API: /que_input_mct_art/botid"+err)  
                            if (month<10){
                                month = "0"+month;
                                console.log("month");
                            };
                                var string_month = String(month);
                                var string_year = String(year);
                                var string_YM = string_year+string_month;
                                var num_id = data.recordset[0].bot_id;
                                var split_id = num_id.split("A");
                                var split_YM = split_id[0].split("_");
                                var id = parseInt(split_id[1])+1;
                                var zero = "";
                                if(String(split_YM[2]) ==string_YM){
                                    console.log(String(id).length);
                                    for (let index = 0; index < (7-(String(id).length)); index++){
                                    zero = zero +"0";
                                    console.log("if1");
                                    }
                                    var Bot_id = "B_MCT_"+string_YM+"A"+zero+String(id);
                                    console.log(Bot_id)
                                }
                                else {
                                        console.log(String(id).length);
                                        var set_newid = "0000000000";
                                        var set_idtoint = parseInt(set_newid)+1;
                                        for (let index = 0; index < (7-(String(set_idtoint).length)); index++){
                                            zero = zero +"0";
                                            console.log("if2");
                                        }
                                        var Bot_id = "B_MCT_"+string_YM+"A"+zero+String(set_idtoint);
                                    }
                                    let sql_insert = "INSERT INTO Que_Mail_certax_ART (que_no,time_file,cus_no,cus_name,bot_id,status) VALUES ('"+que_no+"','"+time_file+"','"+cus_no+"','" +cus_name+ "','"+Bot_id+"','Waiting')"
                                    request.query(sql_insert, function (err, data) {
                                        if (err) res.send("Insert Que_mct ERROR");
                                        let sqlquery_update = "UPDATE Running_Bot SET bot_id = '"+Bot_id+"' WHERE type='MCT'";
                                        request.query(sqlquery_update, function (err, data) {
                                            if(err) console.log("API Update :que_input_mct_art"+err)
                                            console.log('Update Bot_id MCT Success...')
                                            console.log('Insert Que_mail_certax Success!')
                                    })
                                });
                            });
                        } else console.log('Dup Que Mail_certax');
                    });
                });
            }
            else{
                res.status(200).send('Duplicate Data inv_no : '+inv_no);
            }

        });
    });
});
//Update Q mailcertax
app.put('/update_que_mct_art', function (req, res) {
    var bot_id = req.param("bot_id");

    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
        database: 'Bot_DB',
        trustServerCertificate: true
    };

    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);
        console.log("Up_Que_Connecting Success...")
        // create Request object
        var request = new sql.Request();
        let sqlquery = "UPDATE Que_Mail_certax_ART SET status = 'Pending' WHERE bot_id = '"+bot_id+"'";
        request.query(sqlquery, function (err, data) {
            if (err) console.log("API: /update_que_mct_art"+err)
            if (data.rowsAffected[0] == 0) {
                var data_json = { File_name : "Not data" }
                res.send(data_json)
            }
            else {
                let sqlquery_queue = "SELECT *FROM Que_Mail_certax_ART WHERE bot_id = '"+bot_id+"'";
                request.query(sqlquery_queue, function (err, data) {
                    if (err) console.log("API: /update_que_mct_art"+err)
                    res.send(data.recordset)
                });

            }

        });
    });

});
//Update receipt mailcertax
app.put('/update_rec_mct_art', function (req, res) {

    var que_no = req.param("que_no");
    var cus_no = req.param("cus_no");
    var inv_no = req.param("inv_no");
    var receipt_no = req.param("receipt_no");

    var config = {
        user: 'sa',
        password: 'bzknCuj6@6',
        //server: '172.24.4.197',
        server: '203.154.39.197',
        database: 'Bot_DB',
        trustServerCertificate: true
    };

    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log("API: /update_rec_mct_art"+err);
        console.log("Up_Que_Connecting Success...")
        // create Request object
        var request = new sql.Request();
        console.log(receipt_no)
        let sqlquery = "UPDATE mail_certax_input_ART SET receipt_no = '"+receipt_no+"' WHERE cus_no = '"+cus_no+"' And inv_no = '"+inv_no+"'And que_no = '"+que_no+"'";
        request.query(sqlquery, function (err, data) {
            if (err) console.log("API: /update_rec_mct_art"+err)
            if (data.rowsAffected[0]==0){
                res.status(200).send("Data mismatch");
            }
            else {
                let sqlquery_update = "UPDATE Que_Mail_certax_ART SET status = 'Pending' WHERE que_no = '"+que_no+"' And cus_no = '"+cus_no+"'";
                request.query(sqlquery_update, function (err, data) {
                    if(err) console.log("API: /update_rec_mct_art"+err)
                    res.status(200).send("Update REC Success..")
                });
            }
        });
    });
});


app.listen(mssql_port, () => {
    console.log('Successfully on port '+mssql_port);
});