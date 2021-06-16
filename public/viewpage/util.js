import * as Element from './element.js'

export function info(title, body, closeModal){
    if(closeModal) closeModal.hide();
    Element.modalInfoboxTitleElement.innerHTML = title;
    Element.modalInfoboxBodyElement.innerHTML = body;
    Element.modalInfobox.show(); //to render boostrap on the screen
    
}

export function disableButton(button){
    button.disabled = true;
    const label = button.innerHTML;
    button.innerHTML = 'Wait...'
    return label;
}

export function enableButton(button, label){
    if (label) button.innerHTML = label;
    button.disabled = false;
}

//https://www.sitepoint.com/delay-sleep-pause-wait/
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }