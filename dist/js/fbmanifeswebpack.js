
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {getAuth } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js"
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";

import {setDoc, getFirestore,collection,getDocs, addDoc,updateDoc, doc, getDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// import {getStorage, ref, getDownloadURL,uploadBytes, deleteObject} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyA93zj_wLvpSH_6cKRff0P2XRmya8_uoh4",
  authDomain: "ecuapay-c9de7.firebaseapp.com",
  projectId: "ecuapay-c9de7",
  storageBucket: "ecuapay-c9de7.firebasestorage.app",
  messagingSenderId: "168812396551",
  appId: "1:168812396551:web:100d6cfa9c425eff802aa2",
  measurementId: "G-1Z287M5NJY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// const analytics = getAnalytics(app);

//=============>crud auth
    // const auth = getAuth(app);

    //***********1.Conexion con app de sesion    
    // console.log('-----check: app de login. funciona-----')
    // console.log(auth)
    
    // function crearUsuario(email,password){        
    //     createUserWithEmailAndPassword(auth, email, password)
    //         .then((userCredential) => {
    //             let usr = userCredential.user;
    //             console.log(usr.email);                
    //             // let sesion = {
    //             //     usr:'',
    //             //     nombre:'',
    //             //     correo:''
    //             // }
    //         })
    //         .catch((error) => {
    //             var errorCode = error.code;
    //             var errorMessage = error.message;
    //             console.log(errorCode);
    //             alert(errorCode == 'auth/email-already-in-use' ? 
    //                 'Ya existe un usuario con este nombre' : '');
    //         });
    // }
    
    //*********** 3. Iniciar sesion
    // if(document.querySelector('#btn-access')){
    //     document.querySelector('#btn-access').addEventListener('click',(e)=>{
    //         e.preventDefault();
    //         const email = document.querySelector('.usuario').value;
    //         const password = document.querySelector('.psw').value;

    //         console.log(email,password)
    //         iniciarSesion(email,password);
    //     });

    // export async function iniciarSesion(email,password){  
    //     try {
    //         let res = await signInWithEmailAndPassword(auth, email, password);
    //         return res;
    //     } catch (error) {
    //         const errorCode = error.code;
    //         // const errorMessage = error.message;
    //         // console.log(errorCode)
    //         if(errorCode == 'auth/invalid-credential'){
    //             alert('Datos de sesion invalidos')
    //         }
    //         else{alert('Ha ocurrido un error, recargue la paguina e intentelo de nuevo')}
    //     }
    // }
    // }
    // *************3. Check estado de sesion
    // export async function chekSesionStatus(){
    //     try {
    //         await onAuthStateChanged(auth, (user) => {
    //             // console.log(user)
    //             if(!user){localStorage.setItem('sesion','null')}            
    //         });            
    //     } 
    //     catch (error) {localStorage.setItem('sesion','null')}        
    // }
    
    // //**************4. Cerar sesion */
    // export async function logOut(){
    //     try {
    //         let res = await signOut(auth);
    //         return res ? true : res;
    //     } 
    //     catch (error) {return error;}
    // }

    //******************Crear Nuevo Usuario */
    export async function createNewUsr(email,password) {
        createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
                return userCredential
			})
			.catch((error) => {
                return error
		});
    }
    

//=================>CRUD FIRESTORE
    const db = getFirestore(app)
    // ------>subir datos
        export async function guardarDoc(ruta,idDoc,datos){
            await setDoc(doc(db, ruta, idDoc), datos);
        }
        
        export async function guardarColeccion(ruta,datos){
            const respuesta =  await addDoc(collection(db,ruta),datos);
            if(respuesta)  return respuesta;
            else return false;      
        }
        export async function actualizar(ruta,id,datos){
           let res =  await updateDoc(doc(db,ruta,id),datos);
           return res;
        }

        export async function borrar(ruta,id){
            let res = await deleteDoc(doc(db,ruta,id));
            return res;
        }

        export async function obtenerDoc(ruta,id){
            const res = await getDoc(doc(db,ruta,id));
            return res;
        }

    //---------> CONSULTAR DATOS
    
        export async function consulta(consultarDatos,ruta) {
            // console.log(consultarDatos)
            // console.log(`${Object.keys(consultarDatos)[0]}`)
            // console.log(`${Object.values(consultarDatos)[0]}`)
            let res
            try {
                res = await getDocs(query(collection(db,ruta,),  where(`${Object.keys(consultarDatos)[0]}`, "==", `${Object.values(consultarDatos)[0]}`)));
                return res
            } catch (error) {
                return error
            }
        }
        
        export async function coleccionDatos(ruta) {
            const res = await getDocs(collection(db,ruta));
            return res;
        }

//=================>CRUD STORAGE    
    // const storage = getStorage(app); 
    // //>>>>> Descargar
    // export async function subirMultimedia(nomArchivo,archivo,path){

    //     const storageRef = ref(storage, `${path}/${nomArchivo}`);

    //     uploadBytes(storageRef, archivo)
    //         .then((res) => {
    //             localStorage.setItem('up_file','true');
    //             return res;
    //         })
    //         .catch(err=>{
    //             return err
    //         })
    // }   
    // //>>>>>Borrar
    // export async function  borrarMultimedia(ruta,nomImg){
    //     const archivoRef = ref(storage,`${ruta}/${nomImg}`);		
	// 	deleteObject(archivoRef)
    //         .then((res) => {return res})
    //         .catch((err) => {return err});
    // }
    // //>>>>>>Descargar
    // export async function downMultimedia(ruta,id){
    //     const res = getDownloadURL(ref(storage, `${ruta}/${id}`));
    //     return res;
    // }
