let time=45*60

let timer=setInterval(()=>{

let m=Math.floor(time/60)
let s=time%60

document.getElementById("timer").innerText=
m+":"+("0"+s).slice(-2)

time--

if(time<=0){

clearInterval(timer)

finish()

}

},1000)

function finish(){

localStorage.setItem("jawaban",
JSON.stringify(jawaban))

location.href="../result.html"

}
