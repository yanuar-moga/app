document.documentElement.requestFullscreen()

document.addEventListener("fullscreenchange",()=>{

if(!document.fullscreenElement){

alert("Harap kembali ke mode fullscreen")

document.documentElement.requestFullscreen()

}

})

document.addEventListener("visibilitychange",()=>{

if(document.hidden){

alert("Terdeteksi berpindah tab!")

}

})

document.addEventListener("keydown",(e)=>{

if(e.ctrlKey && e.key=="m"){

document.addEventListener("keydown",(b)=>{

if(b.key=="b"){

document.exitFullscreen()

}

})

}

})
