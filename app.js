const API="https://script.google.com/macros/s/AKfycbxo1msbWuO_y1wZ3148SUuTW31UDOJQXGVEFfjKnH6Bq8gAqFCM43sWoqO4WprHtyvl_w/exec";
const titleEl=document.getElementById("title");
const versionEl=document.getElementById("version");
const statusCard=document.getElementById("status-card");
let scanner,isScanning=false;
async function appInfo(){
 const r=await fetch(API+"?action=appInfo");
 const i=await r.json();
 titleEl.textContent=i.title;
 versionEl.textContent="Versión "+i.version;
 ready();
 start();
}
function ready(){statusCard.innerHTML="<h2>Sistema listo</h2><p>Esperando código QR...</p>";}
async function start() {
    scanner = new Html5Qrcode("qr-reader");
    const cameras = await Html5Qrcode.getCameras();
    let cameraId = null;
    if (cameras.length > 0) {
        const rear =
            cameras.find(c =>
                /back|rear|environment/i.test(c.label)
            );
        cameraId = rear
            ? rear.id
            : cameras[0].id;
    }
    await scanner.start(
        cameraId,
        {
            fps: 20,
            qrbox: {
                width: 320,
                height: 320
            },
            aspectRatio: 1,
            rememberLastUsedCamera: true,
            disableFlip: false
        },
        onScan,
        () => {}
    );
    isScanning = true;
}
async function onScan(text){
 if(!isScanning)return;
 isScanning=false;
 await scanner.pause();
 try{
   const r=await fetch(API+"?action=processQr&uuid="+encodeURIComponent(text));
   const res=await r.json();
   if(res.success){
     statusCard.innerHTML=`<h2>${res.participant.name}</h2>
     <p><b>Folio:</b> ${res.participant.folio}</p>
     <p><b>Área:</b> ${res.participant.area}</p>
     <p><b>Estado:</b> ${res.participant.status}</p>`;
   }else{
     statusCard.innerHTML=`<h2>QR inválido</h2><p>${res.message||res.code}</p>`;
   }
 }catch(e){
   statusCard.innerHTML=`<h2>Error</h2><p>${e}</p>`;
 }
 setTimeout(async()=>{ready();await scanner.resume();isScanning=true;},2000);
}
document.addEventListener("DOMContentLoaded",appInfo);
