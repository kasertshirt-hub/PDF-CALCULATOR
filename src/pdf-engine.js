let pdfjsLibPromise = null;
let pdfLibPromise = null;
async function getPdfjs(){
  if(!pdfjsLibPromise){
    pdfjsLibPromise = import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs').then(m => {
      const lib = m.default || m;
      if(lib.GlobalWorkerOptions){
        // PDF.js 5.x requires an explicit worker source in Electron.
        // Keep the worker inside the packaged Electron app so no Python backend is needed.
        lib.GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
      }
      return lib;
    });
  }
  return pdfjsLibPromise;
}
async function getPdfLib(){
  if(!pdfLibPromise){
    pdfLibPromise = import('../node_modules/pdf-lib/dist/pdf-lib.esm.js').then(m => m.default || m);
  }
  return pdfLibPromise;
}
function parsePages(spec,total){if(!spec||['semua','all','*'].includes(String(spec).trim().toLowerCase()))return Array.from({length:total},(_,i)=>i);const out=new Set();for(const part of String(spec).split(',')){const x=part.trim();if(!x)continue;try{if(x.includes('-')){let[a,b]=x.split('-').map(Number);if(a>b)[a,b]=[b,a];for(let n=a;n<=b;n++)if(n>=1&&n<=total)out.add(n-1)}else{const n=Number(x);if(n>=1&&n<=total)out.add(n-1)}}catch{}}return [...out].sort((a,b)=>a-b)}
function compactPages(pages){if(!pages.length)return '-';const a=pages.map(x=>x+1),out=[];let s=a[0],p=a[0];for(const n of a.slice(1)){if(n===p+1)p=n;else{out.push(s===p?String(s):`${s}-${p}`);s=p=n}}out.push(s===p?String(s):`${s}-${p}`);return out.join(', ')}
function renderCanvas(page,scale){const viewport=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(viewport.width));canvas.height=Math.max(1,Math.ceil(viewport.height));const ctx=canvas.getContext('2d',{willReadFrequently:true});return page.render({canvasContext:ctx,viewport}).promise.then(()=>({canvas,width:canvas.width,height:canvas.height}));}
function isColor(canvas,sensitivity){const max=900;let c=canvas;if(c.width>max||c.height>max){const ratio=Math.min(max/c.width,max/c.height);const s=document.createElement('canvas');s.width=Math.max(1,Math.floor(c.width*ratio));s.height=Math.max(1,Math.floor(c.height*ratio));s.getContext('2d').drawImage(c,0,0,s.width,s.height);c=s}const d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height).data;let sum=0,count=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];const gray=0.299*r+0.587*g+0.114*b;sum+=Math.abs(r-gray)+Math.abs(g-gray)+Math.abs(b-gray);count++}const mean=(sum/count)/3;return mean>(11-Number(sensitivity||5))*0.1}
export async function loadPdf(path){const pdfjsLib=await getPdfjs();const r=await window.kaser.readFile(path);if(!r.ok)throw new Error(r.error);const bytes=Uint8Array.from(atob(r.data),c=>c.charCodeAt(0));const pdf=await pdfjsLib.getDocument({data:bytes}).promise;return pdf}
export async function preview(path,pageNum,scale=1.5){const pdf=await loadPdf(path);const page=await pdf.getPage(pageNum+1);const {canvas,width,height}=await renderCanvas(page,scale);return{pageCount:pdf.numPages,width,height,png:canvas.toDataURL('image/png')}}
export async function analyze(path,spec,sensitivity,priceBw,priceColor){const pdf=await loadPdf(path);const selected=parsePages(spec,pdf.numPages);const results={};const bw=[],warna=[];for(const p of selected){const page=await pdf.getPage(p+1);const {canvas}=await renderCanvas(page,.75);if(isColor(canvas,sensitivity)){results[p]='warna';warna.push(p+1)}else{results[p]='bw';bw.push(p+1)}}const total=bw.length*Number(priceBw)+warna.length*Number(priceColor);return{pageCount:pdf.numPages,results,bw:bw.length,warna:warna.length,total,selected,log:`🎨 WARNA (${warna.length} hal):\n${compactPages(warna)}\nBiaya: Rp ${warna.length*Number(priceColor).toLocaleString('id-ID')}\n\n⚫ HITAM PUTIH (${bw.length} hal):\n${compactPages(bw)}\nBiaya: Rp ${bw.length*Number(priceBw).toLocaleString('id-ID')}`}}
export async function splitPdf(path,outdir,results){const { PDFDocument }=await getPdfLib();const r=await window.kaser.readFile(path);if(!r.ok)throw new Error(r.error);const src=Uint8Array.from(atob(r.data),c=>c.charCodeAt(0));const pdf=await PDFDocument.load(src);const groups={bw:[],warna:[]};for(const [k,v] of Object.entries(results))groups[v].push(Number(k));const base=path.split(/[/\\]/).pop().replace(/\.pdf$/i,'');const files=[];for(const type of ['bw','warna']){if(!groups[type].length)continue;const out=await PDFDocument.create();const copied=await out.copyPages(pdf,groups[type]);copied.forEach(p=>out.addPage(p));const bytes=await out.save();const name=base+'_'+(type==='bw'?'BW':'WARNA')+'.pdf';const w=await window.kaser.writeFile(outdir,name,btoa(String.fromCharCode(...bytes)));if(!w.ok)throw new Error(w.error);files.push(w.path)}return files}
export const PDFEngine={loadPdf,preview,analyze,splitPdf};
