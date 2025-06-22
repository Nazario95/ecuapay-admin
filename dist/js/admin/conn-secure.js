import {checkLocalTokenValitidy } from "../switch-data.js"

// VERIFICAR CONEXION SEGURA======================
    // Paso 1: chk Local Token
    setInterval(()=>{
        chckValidSesionData()?validateToken():resetToken()
    } ,5000)

    //validar datos en remoto
    function validateToken(){
        //1. Capgtuar Token Local
        const localToken =  localStorage.getItem('ep-token');
        //2. Buscar dicho token en remoto
        let res = checkLocalTokenValitidy(localToken);
        //3. Cerrar Sesion Si se manipula el token
        res?'': resetToken()
    }

    function resetToken(){
        localStorage.clear();
        location.href = '../../';
    }

// CHECK DATOS DE SESION EN LOCAL-STORAGE
    export function chckValidSesionData(remoteAccess){
        let sesionData = true;

        if(!localStorage.getItem('ep-active-usr')){sesionData=false}
        else if(!localStorage.getItem('ep-timeSesion')){sesionData=false}
        else if(!localStorage.getItem('ep-token')){sesionData=false}

        if(remoteAccess && sesionData == false){ resetToken()}

        return sesionData;
    }

// VALIDAR AUTENCIDAD DE DATOS EN LOCAL Y REMOTO
export function validateSesionData(){
    let res;
    //1. Teimpore de sesion
        let localTimeSesion = localStorage.getItem('ep-timeSesion').split('T');
        let systemTimeNow = new Date(Date.now()).toISOString().split('T');

        //Verificar dia
        // console.log( localTimeSesion[0],'->',systemTimeNow[0],'=> iS', localTimeSesion[0] != systemTimeNow[0])
        localTimeSesion[0] != systemTimeNow[0] ? resetToken():res=true;

    //2. token y usuario valido (PROXIMAMENTE)
        return res;
}