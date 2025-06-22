import { consulta,obtenerDoc } from "../fbmanifeswebpack.js";
import { orderNumbs, formatNumbWithPoint } from "./app.js";

// console.log(formatNumbWithPoint(30000000, 'es-Es'))
//Leer la URL
let dataOrdered;

let urlId = new URLSearchParams(location.search)
if(urlId.size > 0){
    urlId.forEach((urlValue,urlKey)=>{
        if(urlKey == 'id_card'){
            loadCardData(urlValue);
            loadTransactions(urlValue);
        }
    })
}
async function loadCardData(urlValue){
    let res = await obtenerDoc('cards',urlValue);
    // console.log(res)
    let {cardType,cardNumber,activeTime,cardHolderName} = res.data();
    document.querySelector('.card-holder-name').textContent = cardHolderName;
    document.querySelector('.card-numb').textContent = cardNumber;
    document.querySelector('.card-type').textContent = cardType;
    document.querySelector('.active-card-time').textContent = activeTime;
}
async function loadTransactions(cardId) {
    let getTransactions = await consulta({cardId:cardId},'/transactions-history');
    // console.log(getTransactions)
    let component = '';
    let allTrx = []; //
    let orderTrx = []

    getTransactions.forEach(getTrx=>{
        // console.log(getTrx.data());
        allTrx.push(getTrx.data())
        orderTrx.push(getTrx.data().numbTx)      
    });
    orderTrx = orderNumbs(orderTrx);

    dataOrdered = orderDataTrx(orderTrx,allTrx);
    // console.log(dataOrdered);
    if(dataOrdered.length !=0){
        dataOrdered.forEach(data=>{
            let {idTX,numbTx, storeName, timeTransaction, totalPaid, statusPayment} = data;
            component += `
                    <tr>
                        <th scope="row">000${numbTx}</th>
                        <td>${storeName}</td>
                        <td>${timeTransaction}</td>
                        <td>- ${formatNumbWithPoint(totalPaid)} XAF</td>
                        <td class="text-${statusPayment ==  '1'?'success':'danger'}">${statusPayment ==  '1'?'Completed':'Nor Completed'}</td>
                        <td>
                            <div class="border-1 p-0 payment-detail" id="${idTX}">
                                <small class="btn py-0" data-bs-toggle="modal" data-bs-target="#viewTransation">
                                    <img src="../../../dist/svg/eye.svg" alt="">
                                </small>
                            </div>                                              
                        </td>
                    </tr>
            `;
        });
        // Inyectamos los componente
        document.querySelector('.table-trx').innerHTML = component;
        initClicAyeEvent()
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

function initClicAyeEvent(){
    document.querySelectorAll('.payment-detail').forEach(element=>{
        element.addEventListener('click',()=>{
            // console.log(element.id);
            let dataFilter;
            dataOrdered.forEach(filtData => {filtData.idTX == element.id ? dataFilter=filtData:''});
            // console.log(dataFilter)
            let {idTX,storeName,statusPayment,numbTx,totalPaid,timeTransaction} = dataFilter;
            document.querySelector('.trx-id').textContent = idTX;
            document.querySelector('.store-name').innerHTML = `${storeName} <span class="text-${statusPayment == "1"?'success':'danger'} ms-2 p-1">${statusPayment == "1"?'Completed':'Not Completed'}</span>`;
            document.querySelector('.card-body').innerHTML =`
                <small>Nº: #0000${numbTx}</small><br>
                <small>Total Paid</small>
                <p class="text-danger fw-bold">- ${formatNumbWithPoint(totalPaid)} XAF </p>
                <span>${timeTransaction}</span>
            `;
            document.querySelector('.edit-id-trx').setAttribute('href',`../create-transaction/?id_trx=${idTX}`);
        })
    })
}