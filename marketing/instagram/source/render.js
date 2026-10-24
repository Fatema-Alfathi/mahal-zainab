const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:+(process.env.H||1350)}});
for(const f of process.argv.slice(2)){await pg.goto('file://'+path.resolve(f));await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(300);
const m=await pg.evaluate(()=>{const r=[];document.querySelectorAll('h1,p,.cl,.cards').forEach(e=>{const b=e.getBoundingClientRect();r.push(e.className||e.tagName,Math.round(b.left),Math.round(b.right),Math.round(b.top),Math.round(b.bottom),e.scrollWidth>e.clientWidth?'OVERFLOW':'')});return r.join(' ')});console.log(f,m);
await pg.screenshot({path:'out/'+path.basename(f,'.html')+'.png'});}await b.close();})();
