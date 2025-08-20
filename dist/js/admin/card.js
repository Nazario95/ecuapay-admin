import { coleccionDatos,consulta, actualizar} from "../fbmanifeswebpack.js";
import { disableEnable } from "./app.js";

let loadComplete = false;

//1.Iniciar Carga de las Tarjetas
async function loadCards(){
    //1. Verificar el total de Cartas
    let getCards = await coleccionDatos('cards');
    // console.log(res.data())
    //2. Inyectar Contenedores Segun el numero de cartas
    getCards.size > 0 ? insertCardContainers(getCards) : '';
}
loadCards()

//2. Inyectar contenedores de tarjetas
function insertCardContainers(getCards){
    let accordion = '';
    let idCards = [];

    getCards.forEach(card => {
        localStorage.setItem(card.id,JSON.stringify(card.data()))
        // console.log(card.id,'---------->')
        // console.log(card.data())

        idCards.push(card.id)
        accordion += cardItemCreator(card.id, card.data())
    });   
    document.querySelector('#accordion').innerHTML = accordion;

    // Inicializar tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    transacionsCreator(idCards);
}

//3. Crear Items Accordions
function cardItemCreator(idCard,cardData,){
    let {activeTime, cardHolderName, cardNumber, cardType, status, totalSalde, totalTransactions, enabled} = cardData; 
    // console.log(enabled,'-->',status)
    let item ='';
    let item2 ='';

    if(enabled || status){
        item2 =

        `           
            <div class="p-2 accordion-body w-100 ">

                    <!-- ---------------------#1. DATOS BASICOS DE LA TARJETA 1 ---------------------- -->
                      <div class="d-flex justify-content-around">
                          <P class="text-light">${cardNumber}</P>
                          <p class="text-warning">ACTIVE: <span class="text-light">
                            ${activeTime}
                        </span></p>
                    </div>

                    <!-- ---------------------#2. DATOS BASICOS DE LA TARJETA 2 ---------------------- -->
                    <div class="d-flex justify-content-center gap-5 over-scrol common-bg">

                          <!-- type card -->
                           <div>
                              <small class="text-warning text-nowrap">Card Type</small>
                              <p class="text-light text-center">
                                  ${cardType == 'visa'?'VISA':
                                    cardType == 'mc'?'MasterCard':
                                    'Type Not Found'
                                }
                              </p>
                           </div>
  
                           <!-- status transaction-->
                           <div>                            
                              <small class="text-warning text-nowrap">Status:</small><br>
                              <h5 class="text-light text-center">                        
                                 ${status ? 'OK': '<span class="text-danger">DISABLED</span>'}
                              </h5>
                           </div>
  
                           <!-- total transacions -->
                           <div>
                              <small class="text-warning text-nowrap">Total transaction:</small><br>
                              <p class="text-light text-center">
                                  ${totalTransactions}
                              </p>
                           </div>
                           
                           <!-- total sald rest -->
                           <div>
                              <small class="text-warning text-nowrap">Sald Rest:</small><br>
                              <p class="text-light">
                                 -
                              </p>
                           </div>
  
                           <!-- total sald spended -->
                           <div>
                              <small class="text-warning text-nowrap">Salde Spended:</small><br>
                              <p class="text-danger">
                                   <img src="../../../dist/svg/load.svg">
                              </p> 
                           </div>
  
                           <!-- total all salde -->
                           <div>
                              <small class="text-warning text-nowrap">Salde:</small><br>
                              <p class="text-light text-center">                                  
                                    ${totalSalde} $
                              </p>
                           </div>                        
                      </div>
  
                      <!-- ----------------#3. HISTORIAL DE TRANSACCIONES--------------- -->
                      <div class="overflow-auto" style="height: 320px;" id="component-tx-${idCard}">
                            <!-- ----Transcacciones Aqui- -->                     
                       </div>                    
                  </div>

                  <div class="d-flex gap-2">
                    <!-- ------------------------#4. BOTONES DE ACCION -------------------------------- -->
                    <button id="delete-${idCard}" class="btn common-border w-50 text-light btn-action ${enabled == false && status == false?'card-deleted':'card-undeleted'}" data-bs-toggle="modal" data-bs-target="#EraseCard" style="font-size: .8rem;" disabled>
                        Delete Card
                        <img src="../../dist/svg/trash.svg" alt="">
                    </button>

                    <button id="disabled-${idCard}" class="btn common-border w-50 text-light btn-action ${enabled == true && status == false?'card-disabled':'card-enabled'}" data-bs-toggle="modal" data-bs-target="#disabledEnabledCard" style="font-size: .8rem;" disabled>
                        ${enabled && status?'Disable Card':'Enabled Card'}
                        <img src="../../dist/svg/x.svg" alt="">
                    </button>
  
                    <button id="details-${idCard}" class="btn common-border w-50 text-light btn-action" data-bs-toggle="modal" data-bs-target="#showCard" style="font-size: .8rem;" disabled>
                        Card Details
                        <img src="../../dist/svg/eye.svg" alt="">
                    </button>
  
                    <button id="transactions-${idCard}" class="btn text-light common-border w-50 rounded btn-action" style="font-size: .8rem;" disabled>
                        <a href="./transactions/?id_card=${idCard}" class=" text-center text-decoration-none">                        
                            Show Transactions
                            <img src="../../dist/svg/go-to.svg" alt="">                            
                        </a>
                    </button>
                      
                </div>            
        `
    }

    item = `
        <div class="accordion-item ${idCard}">
                <h2 class="accordion-header" id="${idCard}">
                  <button class="accordion-button text-light bg-color" type="button" data-bs-toggle="collapse" data-bs-target="#collapseId-${idCard}" aria-expanded="true" aria-controls="collapseOne">
                      <div>
                          TITLE:

                          <span class=" ${enabled == false && status == false ? 'text-decoration-line-through text-secondary':''} ${enabled == true && status == false?'text-secondary':''} ${enabled && status?'text-warning':''}">
                            ${cardHolderName} 
                            ${enabled == false && status == false?'(CARD DELETED)':''} 
                            ${enabled == true && status == false?'(CARD DISABLED)':''}                            
                          </span>

                          <i type="button" class="btn btn-tranparent"
                            data-bs-toggle="tooltip" data-bs-placement="top"
                            data-bs-custom-class="custom-tooltip"
                            data-bs-title="This top tooltip is themed via CSS variables.">
                                <img src="../../dist/svg/notification-danger.svg">
                            </i>
                      </div>
                  </button>
                </h2>

                <div id="collapseId-${idCard}" class="accordion-collapse collapse w-100" aria-labelledby="${idCard}" data-bs-parent="#accordionExample">
                    ${item2}
                </div>  
        </div> 
    `;
    return item;
}   

//4. Consultar Transaccion en DB
function transacionsCreator(idCards){
    idCards.forEach(id=>{
        getTx(id)
        async function getTx(id) {
            let getTransactions = await consulta({cardId:id},'transactions-history');
            createElementTx(getTransactions,id)
        }       
    })
}

//5. create Component e Inyectar en el DOM
function createElementTx(Txs,virtuadCardId){
    let componentTx = '';
    Txs.forEach(Tx=>{      
        let {storeName,timeTransaction,totalPaid,numbTx,idTx,statusPayment} = Tx.data()
        // console.log(Tx.data());

        componentTx += `   
                <div class="card bg-color common-border my-2"> 
                    <div class="card-body placeholder-wave"> 
                        <div class="card-header text-light">                                   
                            <span class="placeholder-wave">
                                Store Name:
                                ${storeName} <span class="text-${statusPayment==1?'success':statusPayment==2?'danger':'warning'} fw-bold ms-2 p-1">${statusPayment==1?'Completed':statusPayment==2?'Rejected':'Pending'}</span>
                            </span>                                 
                        </div>


                        <span>Nº:</span>
                        <small> #00${numbTx}</small>
                        <br>

                        <small>Id de Transaccion: </small>
                        <span>${idTx}</span>
                        <br>

                        <small>Total Paid: </small>
                        <span class="text-danger fw-bold">- ${totalPaid} $ </span>
                        <br>

                        <span>Time Transaction: </span>
                        <small>${timeTransaction}</small>

                    </div>
                </div> 
        `
    });
    let idComponetTx = document.getElementById(`component-tx-${virtuadCardId}`) ? document.getElementById(`component-tx-${virtuadCardId}`) : '';
    idComponetTx.innerHTML = componentTx;
   
    disableEnable('btn-action','class',0,'disabled');
    loadComplete = true; //Todos los datos han sido Cardagos

   loadComplete ? enableEventBtnAction() : '';
}

//6. Cargar escucha de los botones de accion
function enableEventBtnAction(){
    document.querySelectorAll('.btn-action').forEach(btnAction =>{
        btnAction.addEventListener('click',(e)=>{

            let acctionId = e.currentTarget.id;

            // console.log(acctionId.split('-')[1])
            // console.log(Object.values(e.currentTarget.classList)[5])

            acctionId.split('-')[0] == 'delete' ? deleteCard(acctionId) : '';
            acctionId.split('-')[0] == 'disabled' ? disableCard(acctionId) : '';
            acctionId.split('-')[0] == 'details' ? showCardDetails(acctionId.split('-')[1]) : '';  
        })
    })
}

//-----BTN ACCIONES-----
function deleteCard(idCard){
    
    let idDeleteCard = idCard.split('-')[1];

    // console.log(idDeleteCard)

    //Mostrar Datos de la tarjeta
    let {cardNumber,cardHolderName} = JSON.parse(localStorage.getItem(idDeleteCard));

    //Asignar Propiedades a los botones del modal
    document.querySelector('.delete-modal-card-holder-name').textContent = cardNumber;
    document.querySelector('.confirm-delete-btn').setAttribute('id',`confirm-delete-card-${idDeleteCard}`);

    let btnConfirmDelete = document.querySelector(`#confirm-delete-card-${idDeleteCard}`);

    //Action 1 ---------- Delete
    btnConfirmDelete.addEventListener('click',()=>{        
        deletingCard();
    });    
    async function deletingCard(){
        // console.log('deleting card =>',idDeleteCard);
        let res = await actualizar('cards',idDeleteCard,{enabled:false,status:false});

        if(res == undefined ){
            alert(`La Tarjeta con ID "${idDeleteCard}" de ${cardHolderName} ha sido Eliminada Correctamente`);
            location.reload()
        }
    }

}

function disableCard(idCard){
    let idDisabledCard = idCard.split('-')[1];

    //Mostrar Datos de la tarjeta
    // console.log(idDisabledCard)
    let {cardNumber,cardHolderName,status} = JSON.parse(localStorage.getItem(idDisabledCard));
    
    //Asignar Propiedades a los botones del modal
    document.querySelector('.disable-enable').textContent = `${status ? 'Disabler':'Enabler'}`
    document.querySelector('.disable-modal-card-holder-name').textContent = cardHolderName;
    document.querySelector('.disable-modal-card-number').textContent = cardNumber;
    document.querySelector('.confirm-disable-btn').setAttribute('id',`confirm-disable-card-${idDisabledCard}`);

    let btnConfirmDisable = document.querySelector(`#confirm-disable-card-${idDisabledCard}`);

    //Action 1 ---------- Delete
    btnConfirmDisable.addEventListener('click',()=>{        
        disablingCard();
    });    
    async function disablingCard(){
        // console.log('deleting card =>',idDeleteCard);
        let res = await actualizar('cards',idDisabledCard,{enabled:true,status:!status});

        if(res == undefined ){
            alert(`La Tarjeta con ID "${idDisabledCard}" de ${cardHolderName} ha sido ${!status ? 'Halitada':'Desabilitada'} Correctamente`);
            location.reload()
        }
    }

}

function showCardDetails(idCard){
    let {cardHolderName, cardNumber, totalSalde, cardExpDate, cardCcv, cardType} = JSON.parse(localStorage.getItem(idCard));
    // console.log(cardType);

    let logoVisa = document.querySelector('.visa-logo');
    let logoMc = document.querySelector('.mc-logo');

    if(cardType == 'mc'){
        
        //Ocultar Visa
        logoVisa.classList[2] == 'd-none'?'': 
        logoVisa.classList[2] == undefined ?logoVisa.classList.add('d-none'):'';

        //mostrar MC
        // console.log(`logo Mc --> ${logoMc.classList[1]}`)
        logoMc.classList[1] == 'd-none'?logoMc.classList.remove('d-none'): '';
        logoMc.classList[1] == undefined ?'':'';

    }
    if(cardType == 'visa'){
        //ocultar MC
        logoMc.classList[1] == undefined ?logoMc.classList.add('d-none'):'';
        logoMc.classList[1] == 'd-none'?'':       
        //mostrar Visa
        //  console.log(`logo Visa --> ${logoVisa.classList[2]}`)
         logoVisa.classList[2] == undefined ?'':'';
         logoVisa.classList[2] == 'd-none'? logoVisa.classList.remove('d-none'):''
         ;
    }

    document.querySelector('.virtual-card-holder-name').setAttribute('value',`${cardHolderName}`);
    document.querySelector('.virtual-card-number').setAttribute('value',`${cardNumber}`);
    document.querySelector('.virtual-card-salde').setAttribute('value',`${totalSalde}.0 $`);
    document.querySelector('.virtual-card-exp-date').setAttribute('value',`${cardExpDate}`);
    document.querySelector('.virtual-card-ccv').setAttribute('value',`${cardCcv}`);
    document.querySelector('.virtual-card-ccv').setAttribute('type','text');

    //Actualizar btn de Create Card
    document.querySelector('.link-edit-card').setAttribute('href',`./create-card/?id_card=${idCard}`);   
}
