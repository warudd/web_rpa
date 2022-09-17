// let jpending = document.queryselector('job-pending');
// let jonprocess = document.queryselector('job-onprocess');
// let jsuccess = document.queryselector('job-success');
// let jtotal = document.querySelectorAll('.job');
// document.querySelector('#button').onclick = function(){alert('hello');};
// let button = document.getElementById("button")
// if(button.addEventListener)
//     button.addEventListener('click',doFunction,false);
// else if(button.addEventListener)
//     button.attachEvent('onclick',doFunction);
let task_entdate = document.querySelector('#task-Entry_Date');
let taskppl = document.querySelector('#task-Paperless_No')
let bodytable = document.querySelector('#body-table');
let headso = document.getElementById('head-so');
let input_type = document.querySelector('#input-csno');
let button=document.querySelector('#button');
let output=document.querySelector('#output');
let mytable=document.getElementById('mytable');
let rerun=document.getElementById('rerun');

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

button.addEventListener('click', (event)=>{
    event.preventDefault();
    let input_cs = input_type.value

    const ppl_no = {
        Paperlass_No: input_cs
    };
    console.log(ppl_no)
    fetch('http://localhost:3000/testtest', {
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
        let input_entry_date = cs_json.entry_date; // เอาพวกนี้ใส่ function แล้วเรียกทีเดียว
        let input_ppl_no = cs_json.cs_no;
        task_entdate.innerHTML = input_entry_date
        taskppl.innerHTML = input_ppl_no
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

// button.addEventListener('click',()=>{
//     mytable.innerHTML.show = output
// });