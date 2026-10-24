import re, pathlib
D=pathlib.Path(__file__).parent
def icon(name, color, size):
    s=(D/'npm/package/icons'/f'{name}.svg').read_text()
    s=re.sub(r'<!--.*?-->','',s,flags=re.S)
    s=s.replace('width="24"',f'width="{size}"').replace('height="24"',f'height="{size}"')
    s=s.replace('stroke="currentColor"',f'stroke="{color}"').replace('stroke-width="2"','stroke-width="1.75"')
    return s
def hl(t): return re.sub(r'<(.+?)>',r'<span class="hl">\1</span>',t)
posts=[
 dict(id='01-events',hero='hero4',label='فعاليات عُمان',title='مساحة <الفعاليات>',
      body='اكتشف أحدث <المهرجانات> واحجز مكانك بسهولة.',
      cats=[('ferris-wheel','معارض ومهرجانات'),('drama','فعاليات ثقافية'),('music','مهرجانات موسيقية')]),
 dict(id='02-private',hero='hero5',label='مناسباتك الخاصة',title='منظمو <المناسبات>',
      body='اجعل كل مناسبة <مميّزة> مع أفضل المنظمين في عُمان.',
      cats=[('flower-2','تنسيق وديكور'),('gift','توزيعات وهدايا'),('cake','حلويات المناسبات')]),
 dict(id='03-adventures',hero='hero6',label='دليلك الإلكتروني',title='دليلك <للمغامرات>',
      body='اكتشف أجمل التجارب والأنشطة <السياحية> في عُمان.',
      cats=[('tent','مخيمات وتخييم'),('mountain-snow','مغامرات جبلية'),('waves','غوص ورياضات مائية')]),
]
CSS=(D/'style.css').read_text()
for dark in (False,True):
 for p in posts:
     cats=''.join(f'<div class="card"><div class="ic">{icon(i,"#fff" if dark else "#F2A7D0",60)}</div><div class="cl">{t}</div></div>' for i,t in p['cats'])
     html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
 <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&display=block" rel="stylesheet">
 <style>{CSS}</style></head><body><div class="post{' dark' if dark else ''}">{'<img class="logo" src="logo-white.png"><div class="url">'+icon("globe","#CFCBEA",34)+'<span>www.trtib.app</span></div><div class="big-c"></div>' if dark else ''}<div class="glow"></div><div class="frame"></div>
 <div class="hero">
   <img class="blob-back" src="{p['hero'].replace('hero','backd' if dark else 'back')}.png">
   <img class="photo" src="{p['hero']}.png">
  
   <img class="ring" src="{p['hero'].replace('hero','ring')}.png"><div class="c c1"></div><div class="c c3"></div>
   <div class="badge">{icon('map-pin','#E2559A',30)}<span>سلطنة عُمان</span></div>
 </div>
 <div class="dots"><i></i><i></i></div>
 <div class="text">
   <div class="label"><b></b><em></em>{p['label']}<em></em><b></b></div>
   <h1>{hl(p['title'])}</h1>
   <p>{hl(p['body'])}</p>
 </div>
 <div class="cards">{cats}</div>
 </div></body></html>'''
     (D/f"{p['id']}{'-dark' if dark else ''}.html").write_text(html)
 print('ok')
