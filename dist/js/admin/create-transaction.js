import { coleccionDatos,guardarColeccion,consulta,actualizar } from "../fbmanifeswebpack.js";
import { disableEnable,activeLoadEfx, getUrlParams } from "./app.js";

//Variables
let clients;
let idCard;
let savedIdCardsToLocal = [];
let errorCode = 0;
let dataTransaction;
let currentTrxNumb;

let updateTrx = false;//interuptor de actualizacion de trx
let trxIdUpdate;//Id de transaccion para actualizacion
let constDataUptTrx = []

await getNumbTrx()
// console.log(currentTrxNumb)
getCards();

async function getCards() {
    let cards = await coleccionDatos('cards');
    cards.size > 0 ? createSelecListClient(cards):'';
}
//1. Definir tipo de dispositivo ================================
if(chkTypeDevice() == 'movil'){
    document.querySelector('#list-clients').removeAttribute('multiple');
    document.querySelector('.payment-status').removeAttribute('multiple');
    //Habilitar btn de busqueda
    document.querySelector('.movil-search-btn').classList.remove('d-none');
}

// Crear los Select de los clientes
function createSelecListClient(cards){
    let tagSelectCards = '<option disabled>Select Client</option>';
    let i = 1
    //Crear options
    cards.forEach(card => {
        let {cardHolderName} = card.data();
        tagSelectCards += `<option id="${card.id}" class="clients" value="${i}" ${i==1?'selected':''}>${cardHolderName}</option>`;
        //Guardar en local
        savedIdCardsToLocal.push(card.id);
        localStorage.setItem(`${card.id}`,JSON.stringify(card.data()));
        i++
    });

    //Agrupar el Select
    let selectOptions = tagSelectCards;               
    
    //Inyectar el contenedor
    document.querySelector('#list-clients').innerHTML = selectOptions;

    //Activar Elementos del Formulario
    disableEnable('form-element','class',0,'disabled');

    //Habilitar evento Clic en cliente:
    enableClicEventForClientList()
}

function enableClicEventForClientList(){
    let counter = 0;
    clients = document.querySelectorAll('.clients')
    clients.forEach(client=>{       
            counter++
            if(chkTypeDevice()=='movil' || chkTypeDevice()=='tablet'){
                document.querySelector('.movil-search-btn').addEventListener('click',()=>{
                    completeCardDataMovil();
                });           
            }
            else{
                client.addEventListener('click',(e)=>{ 
                    // alert(client)
                    // alert('hizo un cambio')                                   
                    rellarFormularioPorClick(e);
                })
            }
        
       
    })

    function completeCardDataMovil(){
        // console.log(document.querySelector('#list-clients').options.length)
        let selectedOtion = document.querySelector('#list-clients').options;
        let totalOptions = document.querySelector('#list-clients').options.length;
        let idSelectedElement;
        for(let i=0;  i< totalOptions;i++){
            // console.log(selectedOtion[i].selected+'->'+selectedOtion[i].id)
            if(selectedOtion[i].selected){
                idSelectedElement = selectedOtion[i].id;
                rellarFormularioPorClick(idSelectedElement,'movil')
            }
        }
        // console.log(document.querySelector('#list-clients').options[1].selected)
    }
}

function rellarFormularioPorClick(clikedElement,device){
    //1. id elemento cliqueado:
    if(device == 'movil' || device == 'tablet'){
        idCard = clikedElement;
    }
    else{
        idCard = clikedElement.target.id;
    }
    let {cardNumber,cardHolderName,cardType} = JSON.parse(localStorage.getItem(idCard));
    //2. Inyectar valores en los elementos del formulario
    document.querySelector('.card-number').value = cardNumber;
    document.querySelector('.card-type').textContent = cardType == "mc"?'MasterCard':'VISA';
    document.querySelector('.card-holder').value = cardHolderName;
}

// Escuchar click del btn submit
document.getElementById('submit-transaction').addEventListener('click',()=>{
    //Bloquear BTN de Submit
    activeLoadEfx('submit-transaction',0); 
    //1. Agrupar los elementos en un objeto
    dataTransaction = {
        cardId:idCard,
        idTX:updateTrx?constDataUptTrx[0]:generateIdTx(),
        numbTx:updateTrx?constDataUptTrx[1]:currentTrxNumb,
        storeName:document.querySelector('.store-name').value,
        statusPayment:document.querySelector('.payment-status').value,
        motivPayment:document.querySelector('.motive-status').value,
        totalPaid:document.querySelector('.total-paid').value,
        timeTransaction:document.querySelector('.time-payment').value
    }
    console.log(dataTransaction);

    // 2. Verificaciones
    Object.values(dataTransaction).forEach(chkData=>{
        if(`${chkData}` == ''){
            errorCode = 1;
        }
    });
    //3. Guardar Transaccion
    errorCode != 0 ? showMsgError(): submitTransaction();
});


//Guardar transaccion
async function submitTransaction(){
    // console.log(dataTransaction)
    //Actualizar transaccion
    if(updateTrx){
        try {
            // console.log('Actualizando')
            let resUpdteTx = await actualizar('transactions-history',trxIdUpdate,dataTransaction);
            console.log(resUpdteTx)
            resUpdteTx ?console.log("Error al Subir los Datos"):eraseLocalData();
        } catch (error) {
            console.log(error)
        }
        
    }
    // Crear Nueva Transaccion
    else if(updateTrx == false){
        try {
            let resSubmitTx = await guardarColeccion('transactions-history',dataTransaction)
            console.log(resSubmitTx);
            resSubmitTx?eraseLocalData():console.log("Error al Subir los Datos");
        } catch (error) {
            console.log(error)
        }        
    }
    
    function eraseLocalData(){
        alert('La transaccion de compra se ha guardado correctamente.');
        savedIdCardsToLocal.forEach(remCardData=>{
            localStorage.removeItem(remCardData)
        });        
        location.href=`../transactions/?id_card=${idCard}`;
    }  
}
 
//Mostrar Error
function showMsgError(){
    let msg;
    // console.log(errorCode)
    if(errorCode == 1){
        msg = 'No se admiten campos vacios!';
        errorCode=0
    }
    //Imprimir error    
    document.querySelector('.msg-error-code').textContent = msg;
}

// Generar Id de Transaccion
function generateIdTx() {
    const caracteresPermitidos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteresPermitidos.length);
      id += caracteresPermitidos.charAt(indiceAleatorio);
    }
    return id;
}

//Generar Numero de Transaccion
async function getNumbTrx(){
    //Bloquear Btn "Create Transaction"
    activeLoadEfx('submit-transaction', 0);

    let trx = [];
    let trxNumbs = [];
    let trxNumbOrdenado;    

    let resAllTrx = await coleccionDatos('transactions-history');
    // console.log(resAllTrx.empty)
    if(resAllTrx.empty){
        currentTrxNumb = 1;
    }

    else{
        resAllTrx.forEach(resTrx=>{
            // console.log(resTrx.data())
            let {idTX,numbTx} = resTrx.data()
            trx.push({idTX:idTX,numbTx:numbTx});
            trxNumbs.push(Number(numbTx));        
        });
        // console.log(trxNumbs)
        trxNumbOrdenado = ordenarNumTrx(trxNumbs)
        currentTrxNumb = trxNumbOrdenado[(trxNumbOrdenado.length)-1] + 1;
        // console.log(currentTrxNumb);
    }    
    activeLoadEfx('submit-transaction', 1);  
}
function ordenarNumTrx(arr) {
    const arrayCopia = [...arr];
    return arrayCopia.sort((a, b) => a - b);
}

//ACTUALIZAR TRANSACCION
if(getUrlParams('id_trx')){
    updateTrx = true;
    let urlParam = getUrlParams('id_trx')
    // console.log(urlParam)
    getTrxData(urlParam);    
}

async function getTrxData(trxId) {
    constDataUptTrx[0] = trxId;//1. Id de Transaccion: Dato constante de atualizacion de trx

    // console.log(trxId)
    let resTrx = await consulta({idTX:trxId},'transactions-history');
    // console.log(resTrx)
    
    resTrx.forEach(trx=>{
        let {storeName,statusPayment,timeTransaction, totalPaid, cardId, numbTx} = trx.data();
        trxIdUpdate = trx.id;
        idCard = cardId

        constDataUptTrx[1] = numbTx //2. Num de Transaccion: Dato constante de atualizacion de trx
        // console.log(trx.id)
        console.log(trx.data())
        //Card Data
        let {cardHolderName,cardNumber,cardType} = JSON.parse(localStorage.getItem(cardId));

        document.querySelector('.card-holder').value = cardHolderName;
        document.querySelector('.card-number').value = cardNumber;
        document.querySelector('.card-type').textContent = cardType;
        document.querySelector('#list-clients').innerHTML = `
            <option selected id="${cardId}" value="1">${cardHolderName}</option>
        `

        document.querySelector('.store-name').value = storeName;
        document.querySelector('.payment-status').value = statusPayment;
        document.querySelector('.total-paid').value = totalPaid;
        document.querySelector('.time-payment').value = timeTransaction;
        //btn Text Value
        document.querySelector('.submit-transaction').value = 'Update Trasanction';

    });
}

function chkTypeDevice() {
    const userAgent = navigator.userAgent;
    let device;
    // Expresiones regulares para detectar dispositivos
    const esMovil = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
    const esTablet = /iPad|Android(?!.*Mobi)/i.test(userAgent);
    const esOrdenador = !esMovil && !esTablet;

    if (esMovil) {
       device = 'movil'
    } else if (esTablet) {
        device = 'tablet'
    } else if (esOrdenador) {
        device = 'pc'
    } else {
        device = 'unknow'
    }
    return device;
}

