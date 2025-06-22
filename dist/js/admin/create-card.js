import { activeLoadEfx } from "./app.js";
import { guardarColeccion, consulta, obtenerDoc, actualizar} from "../fbmanifeswebpack.js";

//Client Personal Data
let personalData;
let addressData;
let cardData;

//Variables de Prueba de verificacion de datos
let checkLevel = 0
let existError = false;
let createNewCard = true; //Indicador de creacion de nueva card o actualuzazion de la misma
let paramUrl = new URLSearchParams(location.search)

//id de actualizaciones
let card_id, addres_id, client_idl;

// CREAR NUEVA TARJETA==========================================================
document.querySelector('.submit-new-card').addEventListener('click',()=>{
    //1. Desabilitar el boton de Subir Datos    

    //2. Cargar los datos en objetos
    captureInputs();
    console.log(cardData)
    //3.Realizar las verificacion
    chkPersonalData();
    chkddress();
    chkCardData();

    checkLevel == 3 ? formatData() : '' //Formatear Datos
    checkLevel == 4 ?  initAsincSeccion() : '';

    async function initAsincSeccion() {
        activeLoadEfx('submit-new-card', 0);        
        // Verificar si datos existen en DB
        checkLevel == 4 && createNewCard ? await checkDbData() : saveUpdateData();
        // console.log(checkLevel == 7 ? 'Superado, Subir los Datos':`Hubo en error en seccion ${checkLevel}`);
        // Guardar Los datos
        checkLevel == 7 && createNewCard? await saveNewCard() : '';
        //Error de subida de datos
        checkLevel == 8 &&  existError ? console.log(`Error de seccion ${checkLevel} --> Error al subir los datos`) : '';

        existError ? activeLoadEfx('submit-new-card', 1) : ''; 
    }      
    // console.log(existError ? `Hubo un error en seccion ${checkLevel}` : '');
})

function captureInputs(){
    personalData = {
        name : document.querySelector('.client-name').value.toLowerCase(),
        surname : document.querySelector('.client-surname').value.toLowerCase(),
        email : document.querySelector('.client-email').value.toLowerCase(),
        bornDay : document.querySelector('.client-born-day').value,
        phoneNumber : document.querySelector('.client-phone-number').value,
        sexMale : document.querySelector('.client-sex-male').checked,
        sexFemale : document.querySelector('.client-sex-female').checked    
    }
    //Client Address Data
    addressData = {
        addrsDirection : document.querySelector('.address-direction').value.toLowerCase(),
        addrsPostaCode : document.querySelector('.address-postal-code').value,
        addrsCity : document.querySelector('.address-city').value.toLowerCase(),
        addrsCountry : document.querySelector('.address-country').value.toLowerCase()
    }
    //Client Card Data
    cardData = {
        cardHolderName : document.querySelector('.card-holder-name').value.toUpperCase(),
        cardNumber : document.querySelector('.card-number').value,
        cardExpDate : document.querySelector('.card-expiration-date').value,
        cardCcv : document.querySelector('.card-code-ccv').value,
        cardType: document.querySelector('.type-card').value,
        status:true,
        totalTransactions:0,
        totalSalde:0,
        activeTime:'00d 00h 00m 00s',
        enabled:true        
    }
}

function  chkPersonalData(){
    let {email,bornDay,phoneNumber,sexMale,sexFemale} = personalData;

    let msgPersonalData = ['section-personal'];    
    let errorData = 0;

    //1. Chek campos vacios -------------->
    Object.values(personalData).filter(inputData=>{
        //  console.log(inputData,'--->',`${inputData}`=='')
         if( `${inputData}`==''){
             msgPersonalData[1] = 'No se Admiten Campos Vacios!';//Mensaje de error
             errorData = 1; //Error 1: Se produce en la primera comprobacion
             existError = true;
         }
    });

    //2. Check Formato
    if(errorData==0){
        if(email.indexOf('@') == -1){
            msgPersonalData.push('Formato de correo electronico incorrecto');
            errorData=2 //error 2: no hay @
            existError = true;
        }

        if(bornDay.length !== 10){            
            errorData=2; // Formato de fecha incorrecto
            existError = true;
            msgPersonalData.push('Formato de fecha incorrecto')
        }

        if(phoneNumber.indexOf('+') == -1){
            errorData=2; // Formato de numero de telefono incorrecto
            existError = true;
            msgPersonalData.push('Introduzca el numero de telefono en formato internacional (+240-000-000)')   
        }
    }   
    notification(msgPersonalData,errorData);
    errorData == 0 ? checkLevel = 1 : errorData = 0; //Superar el primer nivel de verificacion si no hay error    
}

function  chkddress(){
    let msgPersonalData = ['section-address'];
    let errorData = 0;

    //1. Chek inputs vacios
    Object.values(addressData).filter(inputData=>{
        if( inputData==''){
            msgPersonalData[1] = 'No se Admiten Campos Vacios!';
            errorData = 1;
            existError = true;
        }
    });
    //2. Check Formato

    notification(msgPersonalData,errorData);
    errorData == 0 ? checkLevel = 2 : errorData = 0; //Superar el segundo nivel de verificacion si no hay error
}

function  chkCardData(){
    let msgPersonalData = ['section-card'];
    let errorData = 0;
    
    //1. Chek inputs vacios
    Object.values(cardData).filter(inputData=>{
        console.log(inputData,'--->',`${inputData}`=='')
        if( `${inputData}`==''){
            msgPersonalData[1] = 'No se Admiten Campos Vacios!';
            errorData = 1;
        }
    });

    //2. Check Formato
    if(errorData == 0){
        let {cardNumber,cardExpDate,cardCcv} = cardData;

        if(cardNumber.length != 16){
            msgPersonalData.push('La tarjeta de Credito debe tener 16 Digitos');
            errorData = 2;
            existError = true;
        }

        if(cardExpDate.split('-').length != 3){
            msgPersonalData.push('Formato de Fecha de Expiracion Erronea')
            errorData = 2;
            existError = true;
        }

        else if(chkValidCardYear(cardExpDate.split('-')[0])== false){
            msgPersonalData.push('El año de expiracion es invalido');
            errorData = 2;
            existError = true;
        }

        if(cardCcv.length != 3){
            msgPersonalData.push('CCV debe tener 3 Digitos')
            errorData = 2;
            existError = true;
        }
    }    
    notification(msgPersonalData,errorData);
    errorData == 0 ? checkLevel = 3 : errorData = 0; //Superar el segundo nivel de verificacion si no hay error
}

//3.Formatear y Organizar los datos
async function formatData(){  
    let errorData = 0;

    cardData.cardNumber = formatear16Digitos(cardData.cardNumber)
    cardData.cardExpDate = `${cardData.cardExpDate.split('-')[1]}/${cardData.cardExpDate.split('-')[0][2]}${cardData.cardExpDate.split('-')[0][3]}`;
    // console.log(cardData)
    errorData == 0 ? checkLevel = 4 : errorData = 0;
}

async function checkDbData(){
    activeLoadEfx('submit-new-card', 0);

    let errorData = 0;
    // console.log(personalData);console.log(addressData);console.log(cardData);
    //--->VERICACION REMOTA:

    //1. Verificar si datos de cliente existen ---------------------------------------------------------
    let {name,surname,email,phoneNumber} = personalData;
    let msgPersonalData = '';

    let nameExist = await consulta({'name':name},'clients');
    let surnameExist = await consulta({'surname':surname},'clients');
    let emailExist = await consulta({'email':email},'clients');
    let numberExist = await consulta({'phoneNumber':phoneNumber},'clients');

    if(nameExist.docs.length != 0 && surnameExist.docs.length != 0){
        msgPersonalData += '<span class="text-warning">Este nombre de cliente ya existe</span><br>';
        errorData = 3; existError = true;
    }
    if(emailExist.docs.length != 0){
        msgPersonalData += '<span class="text-warning">Este correo ya existe</span><br>';
        errorData = 3; existError = true;
    }
    if(numberExist.docs.length !=0){
         msgPersonalData += '<span class="text-warning">Este Numero de telefono ya esta siendo usado</span><br>';
         errorData = 3; existError = true;
    } 
    msgPersonalData==''? msgPersonalData = `<span class="text-warning">Todo correcto!</span><br>`:'';
    document.querySelector('.warning-inputs-personal-data').innerHTML = msgPersonalData;
    errorData == 0 ? checkLevel = 5 :'';

    //2. Verificar Direccion ------------------------------------------------------------------------------
    let {addrsCountry,addrsCity,addrsDirection,addrsPostaCode} = addressData;
    let msgAddData = '';

    let addrsExist1 = await consulta({'addrsCity':addrsCity},'addresses');
    let addrsExist2 = await consulta({'addrsCountry':addrsCountry},'addresses');
    let addrsExist3 = await consulta({'addrsDirection':addrsDirection},'addresses');
    let addrsExist4 = await consulta({'addrsPostaCode':addrsPostaCode},'addresses');

    if(addrsExist1.docs.length != 0 && addrsExist2.docs.length != 0 && addrsExist3.docs.length != 0 && addrsExist4.docs.length != 0 ){
        msgAddData = '<span class="text-warning">Esta Direccion esta disponible en la Base de Datos</span><br>';
        //Recurperar Id de direccion para insertar en datos de usuario
        addrsExist3.docs.forEach(data => {
            cardData.idAddress = data.id;
        });
        
    }else{
        msgAddData ='<span class="text-warning">Nueva direccion insertada. Se guardara en la Base de Datos</span><br>';
        guardarNuevaDireccion(addressData);       
    }
    document.querySelector('.warning-inputs-address-data').innerHTML = msgAddData;
    errorData == 0 ? checkLevel = 6 :'';
    
    //3. Verificar si datos de tarjeta existen --------------------------------------------------------
    let {cardHolderName, cardNumber} = cardData;
    let msgCardData = '';
    
    let holderNameExist = await consulta({'cardHolderName':cardHolderName},'cards');
    let cardNumerExist = await consulta({'cardNumber':cardNumber},'cards');
    // console.log(holderNameExist)
    // console.log(cardNumerExist)
    if(holderNameExist.docs.length != 0){
        msgCardData += '<span class="text-warning">Este nombre de titular ya esta siendo usado</span><br>';
        errorData = 3; existError = true;
    }
    if(cardNumerExist.docs.length != 0){
         msgCardData += '<span class="text-warning">Este numero de tarjeta ya esta siendo usado</span><br>';
         errorData = 3; existError = true;
    }

    msgCardData==''?msgCardData = `<span class="text-warning">Todo correcto!</span><br>`:'';
    document.querySelector('.warning-inputs-card-data').innerHTML = msgCardData;
    errorData == 0 ? checkLevel = 7 :'';
}

//5.Guardar
async function saveNewCard(){
    activeLoadEfx('submit-new-card', 0);
    // console.log('Guardando...')
    // console.log(personalData,addressData,cardData)
    let res;  
    //--->Vericacion remota:
    //1. Verificar que el email no exista
    //2. Verificar que el numero de telefono no exista
    //3. verificar que no exista nadie con el mismo nombre y apellido
    res = await guardarColeccion('clients',personalData);
    // console.log('res1-------->')
    // console.log(res)

    if(res){
        cardData.clientId = res.id
        res = await guardarColeccion('cards',cardData)
        // console.log('res2-------->')
        // console.log(res)
        location.href = '../'
    }else{
        checkLevel = 8 ; existError = true;
    }  
}

// --------------------FUNCIONES DE USO COMUN------------------

//Imprimir mensaje en navegador
function notification(msg,error){ 
    let tag = '';
    let printMsg = '';

    //-----MSG Seccion de Personal
    if(msg[0] == 'section-personal'){
        tag = 'warning-inputs-personal-data';

        //error = 0 || error = 1
        error == 0 || error == 1 ? defaultMsg() : '';

        //other error
        error != 0 && error != 1 ? defaultMsg2() : ''
        
    }

    if(msg[0] == 'section-address'){
        tag = 'warning-inputs-address-data';
       //error = 0 || error = 1
       error == 0 || error == 1 ? defaultMsg() : '';
    }

    if(msg[0] == 'section-card'){
        tag = 'warning-inputs-card-data';
        //error = 0 || error = 1
        error == 0 || error == 1 ? defaultMsg() : '';
        //other error
        error != 0 && error != 1 ? defaultMsg2() : ''
    }

    //Imprimir mensajes de error
    function defaultMsg(){
        // console.log(error,'Tag-->',tag)
        if(error == 0){printMsg = '<span class="text-warning">Todo Correcto!</span>'}
        //error = 1
        if(error == 1){printMsg = '<span class="text-warning">No se admiten campos vacios</span>';}
    }
    function defaultMsg2(){
        // console.log(error,'Tag-->',tag)
        msg.forEach(text=>{
            if(text != msg[0]){
                printMsg += `<span class="text-warning">${text}</span><br>` 
            }
        });
    }
    document.querySelector(`.${tag}`).innerHTML= printMsg
}

//Separar numeros de la tarjeta de credito
function formatear16Digitos(numeros) {
    if (typeof numeros !== 'string' || numeros.length !== 16 || !/^\d+$/.test(numeros)) {
    //   console.error("Error: La entrada debe ser una cadena de 16 dígitos numéricos.");
      return null;
    }  
    // 2. Agrupar y unir con guiones:
    let resultado = '';
    for (let i = 0; i < numeros.length; i++) {
      resultado += numeros[i];
      // Añadir un guion después de cada grupo de 4 dígitos, excepto al final
      if ((i + 1) % 4 === 0 && (i + 1) !== numeros.length) {
        resultado += '-';
      }
    }  
    return resultado;
} 

//Verificar año actual con el año de la tarjeta de credito
function chkValidCardYear(year){
    // console.log(Number(year), ' <=>', new Date().getFullYear())
    if(Number(year) < new Date().getFullYear()){
        // console.log('Formato de axo incorrecto 1')
        return false;
    }
    else if( Number(year) > new Date().getFullYear()){
        if( Number(year) - new Date().getFullYear() > 0 &&  Number(year) - new Date().getFullYear() < 4 ){
            // console.log('Formato de axo correcto')
            return true
        }
        else if( Number(year) - new Date().getFullYear() > 3){
            // console.log('Formato de axo incorrecto 2')
            return false
        }
    }
}

//-----------> Guardar nueva direccion
async function guardarNuevaDireccion(newDir){    
    let res = await guardarColeccion('addresses',newDir);
    // console.log(res.id)
    cardData.idAddress = res.id;
}


// ACTUALIZAR LA TARJETA===================================================
//Verificar si se crea una card nueva o se actualiza

if(paramUrl.size > 0){
    paramUrl.forEach((value,key)=>{
        // console.log(value)
        if(key == 'id_card'){
            // indicar estado de actualizacion de tarjeta
            createNewCard = false;
            card_id = value;
            loadCardData(value);
        }
    })
}
//cargar datos de la tarjeta par actualizar
async function loadCardData(idCard){
    activeLoadEfx('submit-new-card', 0);
    // console.log(idCard)
    let localCardData = JSON.parse(localStorage.getItem(idCard));
    document.querySelector('.type-card').value = localCardData.cardType;
    document.querySelector('.card-holder-name').value = localCardData.cardHolderName;
    document.querySelector('.card-number').value = localCardData.cardNumber.replace(/\D/g, '');;
    document.querySelector('.card-expiration-date').value = `20${localCardData.cardExpDate.split("/")[1]}-${localCardData.cardExpDate.split("/")[0]}-01`
    document.querySelector('.card-code-ccv').value = localCardData.cardCcv;

    client_idl = localCardData.clientId
    console.log(client_idl);
    let resCardData = await obtenerDoc('clients',client_idl);
    // console.log(resCardData);
    // console.log(resCardData.data());
    let {name,surname,email,bornDay,phoneNumber} = resCardData.data();
    document.querySelector('.client-name').value = name;
    document.querySelector('.client-surname').value = surname;
    document.querySelector('.client-email').value = email;
    document.querySelector('.client-born-day').value = bornDay;
    document.querySelector('.client-phone-number').value = phoneNumber;
    
    addres_id = localCardData.idAddress
    let resAdresData = await obtenerDoc('addresses',addres_id);
    // console.log(resAdresData.data());

    let {addrsCity,addrsCountry,addrsDirection,addrsPostaCode} = resAdresData.data();
    document.querySelector('.address-direction').value = addrsDirection;
    document.querySelector('.address-postal-code').value = addrsPostaCode;
    document.querySelector('.address-city').value = addrsCity;
    document.querySelector('.address-country').value = addrsCountry;
    
    activeLoadEfx('submit-new-card', 1);
    document.querySelector('.submit-new-card').value = 'Update';    
}

// document.querySelector('.submit-update-card').addEventListener('click',()=>{
//     captureInputs();
// })

async function saveUpdateData() {
    let res1,res2,res3
    console.log("Actualizando")
    // console.log(card_id, addres_id, client_idl)
    // console.log(personalData);console.log(addressData);console.log(cardData);

    //actualizar datos Personales
    res1 = await actualizar('clients',client_idl,personalData)
    console.log(res1,'Datos Personales Actualizados');
    //actualizar Direccion
    if(res1==undefined){
         res2 = await actualizar('addresses',addres_id,addressData);
        //  console.log('Datos Direccion Actualizados');
    }

    //actualizar datos de la Card
    if(res2==undefined){
        res3 = await actualizar('cards',card_id,cardData);
        // console.log('Datos de Tarjeta Actualizados');
    } 

    if(res3==undefined){
        console.log('Actualizacion Completada');
        activeLoadEfx('submit-new-card', 1);
        location.href = '../';
    }
}
