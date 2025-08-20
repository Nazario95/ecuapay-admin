import { consulta,obtenerDoc,actualizar,borrar } from "../fbmanifeswebpack.js";
import { orderNumbs, formatNumbWithPoint } from "./app.js";

// console.log(formatNumbWithPoint(30000000, 'es-Es'))
//Leer la URL
let dataOrdered;
let carActiveId;
let client;

let urlId = new URLSearchParams(location.search)
if(urlId.size > 0){
    urlId.forEach((urlValue,urlKey)=>{
        if(urlKey == 'id_card'){
            carActiveId = urlValue;
            loadCardData(urlValue);
            loadTransactions(urlValue);
        }
    })
}
async function loadCardData(urlValue){
    //Captuara datos de tarjeta
    let res = await obtenerDoc('cards',urlValue);

    //Capturar datos de cliente
    let {cardType,cardNumber,activeTime,cardHolderName,clientId} = res.data();
    client = clientId;

    document.querySelector('.card-holder-name').textContent = cardHolderName;
    document.querySelector('.card-numb').textContent = cardNumber;
    document.querySelector('.card-type').textContent = cardType;
    document.querySelector('.active-card-time').textContent = activeTime;
}
async function loadTransactions(cardId) {
    let component = '';
    let allTrx = []; //
    let orderTrx = []

    try {
        let getTransactions = await consulta({cardId:cardId},'/transactions-history');
        // console.log(getTransactions) 
        getTransactions.forEach(getTrx=>{        
            // console.log(getTrx.id);
            //Insertar ID de transacion en cada objeto
            let getTrxData =  getTrx.data()
            getTrxData.idDocTrx = getTrx.id

            allTrx.push(getTrxData)
            orderTrx.push(getTrx.data().numbTx)      
        });
        orderTrx = orderNumbs(orderTrx);

        dataOrdered = orderDataTrx(orderTrx,allTrx);
        // console.log(dataOrdered);
    } catch (error) {
        console.log(error)
    }
    
    if(dataOrdered.length !=0){
        dataOrdered.forEach(data=>{
            // console.log(data)
            let {idTX,numbTx, storeName, timeTransaction, totalPaid, statusPayment, idDocTrx} = data;
            component += `
                    <tr>
                        <th scope="row">000${numbTx}</th>
                        <td>${storeName}</td>
                        <td>${timeTransaction}</td>
                        <td>- ${formatNumbWithPoint(totalPaid)} $</td>
                        <td class="text-${statusPayment ==  '1'?'success':statusPayment =='2'?'danger':'warning'}">${statusPayment =='1'?'Completed':statusPayment =='2'?'Rejected':'Pending'}</td>
                        <td>
                            <div class="border-1 p-0 payment-detail" id="${idTX}">
                                <small class="btn py-0" data-bs-toggle="modal" data-bs-target="#viewTransation">
                                    <img src="../../../dist/svg/eye.svg">
                                </small>
                                <small class="btn py-0 erase-trx erase-trx-${idTX} doc-${idDocTrx}">
                                    <img src="../../../dist/svg/trash.svg">
                                    <img class="load-efx-${idTX}">
                                </small>
                            </div>                                              
                        </td>
                    </tr>
            `;
        });
        // Inyectamos los componente
        document.querySelector('.table-trx').innerHTML = component;
        EnableAdminRootOptions(dataOrdered.length)
        initClicAyeEvent();
        initClicTrashBtnEvent();
    }  
    else if(dataOrdered.length == 0){
        document.querySelector('.btn-payment-detail').removeAttribute('data-bs-toggle','data-bs-target');
    }     
}

function orderDataTrx(order, datas){
    // console.log(order)
    // console.log(datas)
    let orderedData = [];
    datas.forEach(data=>{
        for(let i = 0;i<order.length;i++){
            if( order[i] == data.numbTx){
                orderedData[i]=data;
            }
        }
    }); 
    // console.log(orderedData)  
    return orderedData;
}

// Inicializar evento de clic de boton edit
function initClicAyeEvent(){
    document.querySelectorAll('.payment-detail').forEach(element=>{
        element.addEventListener('click',()=>{
            // console.log(element.id);
            let dataFilter;
            dataOrdered.forEach(filtData => {filtData.idTX == element.id ? dataFilter=filtData:''});
            // console.log(dataFilter)
            let {idTX,storeName,statusPayment,numbTx,totalPaid,timeTransaction,motivPayment} = dataFilter;
            document.querySelector('.trx-id').textContent = idTX;
            document.querySelector('.store-name').innerHTML = `
                ${storeName} <span class="text-${statusPayment == "1"?'success':statusPayment =="2"?'danger':'warning'} 
                ms-2 p-1">${statusPayment == "1"?'Completed':statusPayment == "2"?'Rejected':'Pending'}</span>
                <div>
                    <small class="${statusPayment != "1"?"":"d-none"} text-${statusPayment == "2"?"danger":statusPayment == "3"?"warning":""}">${motivPayment}</small>
                </div>
            `;
            
            document.querySelector('.card-body').innerHTML =`
                <small>Nº: #0000${numbTx}</small><br>
                <small>Total Paid</small>
                <p class="text-danger fw-bold">- ${formatNumbWithPoint(totalPaid)} $ </p>
                <span>${timeTransaction}</span>
            `;
            document.querySelector('.edit-id-trx').setAttribute('href',`../create-transaction/?id_trx=${idTX}`);
        });
    })
}

// Inicializar evento de boton de borrar trx
function initClicTrashBtnEvent(){
    document.querySelectorAll('.erase-trx').forEach(eraseBtn => {
        eraseBtn.addEventListener('click',()=>{
            console.log(eraseBtn.classList)
            if(confirm(`Erase Trasaction with id ${eraseBtn.classList[3].split('-')[2]} ?`)){
                //Desabilitar boton de borrado
                // eraseBtn.classList.add('disabled')
                disableAlltrashBtn();
                document.querySelector(`.load-efx-${eraseBtn.classList[3].split('-')[2]}`).setAttribute('src','../../../dist/svg/load.svg');
                eraseTrx(eraseBtn.classList[4].split('-')[1])
            }
        })
    });

    function disableAlltrashBtn(){
        document.querySelectorAll('.erase-trx').forEach(eraseBtn =>{
            eraseBtn.classList.add('disabled')
        })
    }
}

// Borrar Transaccion
async function eraseTrx(trxID) {
    console.log('Borando doc ',trxID);
    let res =  await borrar('transactions-history',trxID);
    // console.log(res)
    if(res == undefined ){
        alert('Borrado Completado');
        location.reload()
    }
    else{
        alert('ERROR: No se pudo completar el borrado');
    }
    
    
}
//Herraminentas de Admin Root
function EnableAdminRootOptions(totalTrx){
    //#1. Verificar que la cuenta activa sea de admin root.

    //#2. Cargar el menu admin root
    let enROptions = document.querySelector('#ena-r-options');
    enROptions.innerHTML = `
        <div class="dropdown d-flex justify-content-center mb-3">
            <button class="btn border rounded-2 dropdown-toggle text-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Admin Tools
            </button>
            <ul class="dropdown-menu bg-color">
                <li>
                    <button class="adminOpt adminOpt-1 dropdown-item no-hover-1" disabled="true" data-bs-toggle="modal" data-bs-target="#logsAdminTools" style="color:#fff!important">
                        Put UID to TRX
                    </button>
                </li>
                
                <li>
                    <button class="adminOpt adminOpt-2 dropdown-item no-hover-1" disabled="true" data-bs-toggle="modal" data-bs-target="#logsAdminTools" style="color:#fff!important">
                        Put UID to card
                    </button>
                </li>

            </ul>
        </div>
    `;

    //#2.1. Verificar si total trx > 0
    // console.log('total trx '& totalTrx)
    if(totalTrx > 0){
        let btnRootOptions = document.querySelectorAll('.adminOpt');
        btnRootOptions.forEach(btnRoot=>{
            btnRoot.removeAttribute('disabled');
            // console.log(btnRoot)
        })
    }

    //3. habilitar el listener el OPT Button
    document.querySelectorAll('.adminOpt').forEach(opt=>{
        opt.addEventListener('click',()=>{
            // console.log(opt.classList)
            if(opt.classList[1] == 'adminOpt-1'){
                //Inyectar UID de usuario en las transacciones
                btnRootAdminOption(1)
            }
            if(opt.classList[1] == 'adminOpt-2'){
                // Inyectar UID de usuario en las tarjetas
                btnRootAdminOption(2)
            }
        })
    })    
}

async function btnRootAdminOption(option){

    let clientUID;
    let netUpdate = false;

    //#1. Capturando UID 
    if(!localStorage.setItem('uid',clientUID)){
        clientUID = await getUID();
    }  
    else{
        clientUID = localStorage.getItem('uid');
    }

    // ----------------------------------------------------
    //#2 Inyectar UID de usuario en las TRX
    if(option == 1){
        console.log('Iniciando opt-1')
        //#2.0. Mostrar msg de estado en el modal
        document.querySelector(`.msg-opt-${option}`).classList.remove('d-none')

        //#2.1. Leyendo todas las TRX de la tarjeta...        
        let res = await consulta({cardId:carActiveId},'/transactions-history');
        document.querySelector('.total-txt-up-uid').textContent = ` ${res.docs.length} Finded... `
        document.querySelector('.load-status').setAttribute('src','../../../dist/svg/check.svg')

        //#3. Inyectar UID        
        res.forEach(idDocToUpdate => {
             let initUpdate = async()=>{
                
                if(!idDocToUpdate.data().uid){
                    netUpdate = true;
                    let initUpdate = insertUIDtoData('uid-to-trx', '/transactions-history',idDocToUpdate.id,clientUID);
                    if(initUpdate == undefined){
                        updState('devtool-action-success','SUCCESS!!')
                    }
                    else{
                        updState('devtool-action-error','SOMETHING IS WRONG')
                    }
                }               
            };initUpdate();

        });
        document.querySelector('.finish-status').setAttribute('src','../../../dist/svg/check.svg');

        if(!netUpdate){
            updState('devtool-action-error','Everything is update');
            //Para actualizacion, monstrar opcion de salir del moda
            reloadPg();
        }
        else{
            updState('devtool-action-success','UPDATE COMPLETE!!');
            reloadPg();
        }
    }

    // ----------------------------------------------------
    //3. Inser UID en los datos de las tarjetas
    if(option == 2){
        console.log('Iniciando opt-2')
        //3.0. Mostrar mgs en el Modal
        document.querySelector(`.msg-opt-${option}`).classList.remove('d-none')
        //3.1. CHK si UID ya existe
         let res =  await obtenerDoc('/cards',carActiveId);

         //3.2 UID No existe
        //  console.log(res.data());
         if(!res.data().uid){

            let resUpUidToCard = await insertUIDtoData('uid-to-card', 'cards', carActiveId, clientUID);

            if(resUpUidToCard == undefined){
                console.log(resUpUidToCard)
                updState('devtool-action-success','UPDATE COMPLETE!!');
                loadStatusSVG()
                reloadPg();
            }
            else{
                console.log(resUpUidToCard)
                loadStatusSVG()
                updState('devtool-action-error','SOMETHING IS WRONG');
            }            
         }

         //3.3 UID existe
        else if(res.data().uid){
            loadStatusSVG();
            updState('devtool-action-error','Everything is update');
            reloadPg();
        }

        //SUB-Function-Mostra SVG Cheket
        function loadStatusSVG(){
            document.querySelector('.load-status-2').setAttribute('src','../../../dist/svg/check.svg');
            document.querySelector('.finish-status').setAttribute('src','../../../dist/svg/check.svg');            
        }      
    }

    //===============Sub-Funciones Comunices===============//
        //SUB-1: GET USR ID
        async function getUID(){
            try {
                let resCardData = await obtenerDoc('/clients',client);
                return resCardData.data().uid
            } catch (error) {
                return error
            }        
        }

        //SUB-2: UPDATE DATA
        async function insertUIDtoData(option, pathDir, idDoc, uidClient){
            if(option == 'uid-to-trx'){
                try {
                    let resUpdateState = await actualizar(pathDir,idDoc,{uid:uidClient});
                    return resUpdateState;
                } catch (error) {
                    return error;
                } 
            }

            if(option == 'uid-to-card'){
                try {
                    let resUpdateState = await actualizar(pathDir,idDoc,{uid:uidClient});
                    return resUpdateState;
                } catch (error) {
                    return error;
                } 
            }
                
        }

        //SUB-3: MOSTRAR MSG DE UPDATE STATE
        function updState(domElemt,txt){
            console.log(domElemt)
            document.querySelector(`.${domElemt}`).textContent = `${txt}`;
        }

        //SUB-4: RECARGAR PAGINA
        function reloadPg(){
            setTimeout(() => {
                    location.reload()
            }, 2000);
        }
}