// document.querySelector('#button').onclick = function(){alert('hello');};
// let button = document.getElementById("button")
// if(button.addEventListener)
//     button.addEventListener('click',doFunction,false);
// else if(button.addEventListener)
//     button.attachEvent('onclick',doFunction);
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
let output=document.querySelector('#output');
//rerun
let buttonRerun=document.getElementById('rerun');

// function send_data(event){
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
            task_entdate.innerHTML = input_entry_date
            task_ppl.innerHTML = input_ppl_no
            task_sono.innerHTML = input_so_no
            task_csstatus.innerHTML = input_cs_status
            task_jobstatus.innerHTML = input_job_status
        }
        addhtml();
        console.log(cs_json)
    })
    .catch((error) => {
        console.log(error.message)
    })
    if(input_cs === ''){
        return
    }
    if(mytable.style.display === ''){
        mytable.style.display = 'block';
    } 
    if(rerun.style.display === ''){
        rerun.style.display = 'block';
    }
    headso.innerHTML = input_cs
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