//task
let task_entdate = document.querySelector('#task-Entry_Date');
let task_ppl = document.querySelector('#task-Paperless_No');
let task_sono = document.querySelector('#task-SO_No');
let task_csstatus = document.querySelector('#task-CS_Status');
let task_jobstatus = document.querySelector('#task-Jobstatus');
//body
let mytable=document.getElementById('mytable');
let headso = document.getElementById('head-so');
let input_type = document.querySelector('#input-csno');
let buttonSearch=document.querySelector('#button');
//rerun
let buttonRerun=document.getElementById('rerun');
//     event.preventDefault();
//     let Paperlass_No = input_type.value
//     console.log(Paperlass_No)

//     const ppl_no = {
//         Paperlass_No:Paperlass_No
//     };
//     console.log(ppl_no)
//     fetch('http://localhost:3000/testtest', {
//         method:'POST',
//         headers:{
//             'Content-Type':'application/json;charset=utf-8'
//         },
//         body: JSON.stringify(ppl_no)
//     })
//     .then((response) =>{
//         return response.json();
//     })
//     .then((json) => {
//         const paperless = json.Paperlass_No;
//         alert(paperless)
//     })
//     .catch((error) => {
//         console.log(error.message)
//     })
//     if(Paperlass_No === ''){
//         return
//     }
//     if(mytable.style.display === ''){
//         mytable.style.display = 'block';
//     } 
//     if(rerun.style.display === ''){
//         rerun.style.display = 'block';
//     }
//     headso.innerHTML = Paperlass_No
// }

// button.addEventListener('click' , send_data);

buttonSearch.addEventListener('click', (eventSearch)=>{
    eventSearch.preventDefault();
    let input_cs = input_type.value
    console.log(input_cs)
    if(input_cs === ''){
        buttonRerun.style.display = 'none';
        mytable.style.display = 'none';
        return
    }
    else if(input_cs!==''){
        mytable.style.display = 'block';
    }
    headso.innerHTML = '<center>'+input_cs+'</center>'
    const ppl_no = {
        Paperlass_No: input_cs
    };
    fetch('http://localhost:3000/check_cs', {
        method:'POST',
        headers:{
            'Content-Type':'application/json;charset=utf-8'
        },
        body: JSON.stringify(ppl_no)
    })
    .then((response) =>{
        return response.json();
    })
    .then((json) => {
        const cs_json = json;
        function addhtml(){
            let input_entry_date = cs_json.entry_date;
            let input_ppl_no = cs_json.cs_no;
            let input_so_no = cs_json.so_no;
            let input_cs_status = cs_json.cs_status;
            let input_job_status = cs_json.job_status;
            task_entdate.innerHTML = '<center>'+input_entry_date+'</center>'
            task_ppl.innerHTML = '<center>'+input_ppl_no+'</center>'
            task_sono.innerHTML = '<center>'+input_so_no+'</center>'
            task_csstatus.innerHTML = '<center>'+input_cs_status+'</center>'
            task_jobstatus.innerHTML = '<center>'+input_job_status+'</center>'
            if(input_job_status === 'Success' || input_job_status === undefined){
                buttonRerun.style.display = 'none';
            }
            else if(input_job_status !== 'Success'){
                buttonRerun.style.display = 'block';
            }
        }
        addhtml();
    })
    .catch((error) => {
        console.log(error.message)
    })

});
buttonRerun.addEventListener('click',(eventRerun) =>{
    eventRerun.preventDefault();
    let input_cs = input_type.value
    const ppl_no = {
        Paperlass_No: input_cs
    };
    fetch('http://localhost:3000/rerun_cs', {
        method:'POST',
        headers:{
            'Content-Type':'application/json;charset=utf-8'
        },
        body: JSON.stringify(ppl_no)
    })
    .then((response) =>{
        return response.json();
    })
    .then((json) => {
        const cs_json = json;
        function addhtml(){
            let input_job_status = cs_json.status_q;
            task_jobstatus.innerHTML = input_job_status
        }
        addhtml();
        console.log(cs_json)
    })
    .catch((error) => {
        console.log(error.message)
    })
});