let index=0
let jawaban=new Array(bankSoal.length)

shuffle(bankSoal)

buatNavigasi()

tampil()

function tampil(){

document.getElementById("nomor").innerText=
"Soal "+(index+1)

document.getElementById("pertanyaan").innerText=
bankSoal[index].soal

let html=""

bankSoal[index].pilihan.forEach((p,i)=>{

html+=`
<div>
<input type="radio" name="pilih"
onclick="pilih(${i})"
${jawaban[index]==i?"checked":""}
>
${p}
</div>
`

})

document.getElementById("pilihan").innerHTML=html

updateNav()

}

function pilih(i){

jawaban[index]=i

updateNav()

}

function next(){

if(index<bankSoal.length-1) index++

tampil()

}

function prev(){

if(index>0) index--

tampil()

}

function buatNavigasi(){

let nav=""

for(let i=0;i<bankSoal.length;i++){

nav+=`
<div class="nav belum" id="nav${i}"
onclick="lompat(${i})">
${i+1}
</div>
`

}

document.getElementById("navSoal").innerHTML=nav

}

function lompat(i){

index=i

tampil()

}

function updateNav(){

jawaban.forEach((j,i)=>{

let el=document.getElementById("nav"+i)

if(j!=undefined)
el.className="nav jawab"

})

}

function shuffle(a){

for(let i=a.length-1;i>0;i--){

let j=Math.floor(Math.random()*(i+1))

[a[i],a[j]]=[a[j],a[i]]

}

}
