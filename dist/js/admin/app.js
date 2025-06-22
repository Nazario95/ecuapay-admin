//------->Mostrar u Ocultar efecto de carga
export function activeLoadEfx(btn,action){
    //Deshabilitar Btn y mostrar Efx Loading
    if(action == 0){
        document.querySelector(`.${btn}`).setAttribute('disabled','true');
        document.querySelector(`.loading-${btn}`).classList.remove('d-none');
    }
    //Habilitar Btn y ocultar Efx Loading
    else if(action == 1){
        document.querySelector(`.${btn}`).removeAttribute('disabled');
        document.querySelector(`.loading-${btn}`).classList.add('d-none');
    }
}

//Eliminiar, ocultar y mostrar elementos
export function disableEnable(tagName,selectBy,action,applyAttribute){
    //0 = Remover elemento
    if(action == 0){
        if(selectBy=='class'){
            document.querySelectorAll(`.${tagName}`).forEach(tag =>{
                tag.removeAttribute(`${applyAttribute}`);
            })
        }
    }
    //1 = ocultar elemento
    //2 = mostrar elemento
    //3 = Activa    
}

//Orden ascendiente de numeros de un array
export function orderNumbs(arr) {
    const arrayCopia = [...arr];
    return arrayCopia.sort((a, b) => b- a);
}

//Formatea los numeros en unidades monetarias
export function formatNumbWithPoint(numero, locale = 'es-ES') {
    // console.log(numero)
    // Intentamos convertir la entrada a un número
    const num = Number(numero);
  
    // Verificamos si la conversión resultó en un número válido
    if (isNaN(num)) {
      console.warn(`"${numero}" no es un número válido y no puede ser formateado.`);
      return ''; // Retorna una cadena vacía para entradas no válidas
    }
    // 'es-ES' usa el punto como separador de miles y la coma como separador decimal.
    // 'en-US' usa la coma como separador de miles y el punto como separador decimal.
    // Puedes cambiar el 'locale' según tus necesidades.
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0, // Asegura que no haya decimales si el número es entero
        maximumFractionDigits: 20 // Permite mostrar decimales si existen
      }).format(num);
    } catch (error) {
      console.error(`Error al formatear el número con el locale "${locale}":`, error);
      return num.toString(); // En caso de error, retorna el número como cadena sin formato
    }
}

//obtener Parrametros de la URL
export function getUrlParams(param){
    let urlId = new URLSearchParams(location.search)
    let res;

    if(urlId.size > 0){
        urlId.forEach((urlValue,urlKey)=>{
            if(urlKey == param){
                res = urlValue
            }
        })
    }
    else if(urlId.size == 0){
        res = null
    }
    return res;
}

