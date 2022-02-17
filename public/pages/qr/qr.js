flexText = function () {
    var divs = document.getElementsByClassName("qr-text");
    for(var i = 0; i < divs.length; i++) {
        var relFontsize = divs[i].offsetWidth*0.125;
        divs[i].style.fontSize = relFontsize+'px';
    }
};

window.onload = function(event) {
    flexText();
};
window.onresize = function(event) {
    flexText();
};

function addClassElementEvent(element,className,event){
  
  let elements = document.querySelectorAll(element);

  for(var i = 0; i<elements.length; i++) {
      elements[i].addEventListener(event, function(event) {
           this.classList.toggle(className);
           document.querySelector('.qr-list').classList.toggle(className);
      });
  }
}
addClassElementEvent('.qr-item','active','click');








