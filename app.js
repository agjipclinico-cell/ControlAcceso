const API =
"https://script.google.com/macros/s/AKfycbxo1msbWuO_y1wZ3148SUuTW31UDOJQXGVEFfjKnH6Bq8gAqFCM43sWoqO4WprHtyvl_w/exec";

let scanner;

let scanning=true;

async function loadInfo(){

    const response =
        await fetch(
            API+"?action=appInfo"
        );

    const info=
        await response.json();

    title.textContent=
        info.title;

    version.textContent=
        "Versión "+info.version;

}

function ready(){

status-card.innerHTML=`
<h2>Sistema listo</h2>
<p>Esperando código QR...</p>
`;

}

async function processQr(uuid){

scanning=false;

scanner.pause();

const response=
await fetch(

API+
"?action=processQr&uuid="+
encodeURIComponent(uuid)

);

const result=
await response.json();

if(result.success){

status-card.innerHTML=`

<h2>${result.participant.name}</h2>

<p><b>Folio:</b>
${result.participant.folio}</p>

<p><b>Área:</b>
${result.participant.area}</p>

<p><b>Estado:</b>
${result.participant.status}</p>

`;

}else{

status-card.innerHTML=`

<h2>QR inválido</h2>

<p>${result.message}</p>

`;

}

setTimeout(()=>{

ready();

scanner.resume();

scanning=true;

},2000);

}

async function startScanner(){

scanner=
new Html5Qrcode(
"qr-reader"
);

await scanner.start(

{
facingMode:"environment"
},

{
fps:10,
qrbox:250
},

text=>{

if(!scanning)
return;

processQr(text);

}

);

ready();

}

document.addEventListener(

"DOMContentLoaded",

async()=>{

await loadInfo();

await startScanner();

}

);
