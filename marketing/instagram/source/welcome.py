import pathlib, base64
from build import icon, CSS, D
WCSS='''
.w-av{position:absolute;left:50%;top:214px;width:330px;height:330px;transform:translateX(-50%);border-radius:50%;padding:8px;background:conic-gradient(from 200deg,#E2559A,#D580B6,#8182BE,#E6E3F5,#E2559A);box-shadow:0 40px 70px rgba(46,31,94,.18);z-index:3}
.w-av .in{width:100%;height:100%;border-radius:50%;border:8px solid #fff;background:linear-gradient(160deg,#F7EEF8,#E6E3F5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;overflow:hidden}
.w-av .in img{width:100%;height:100%;object-fit:cover}
.w-av .ph{font:600 24px 'IBM Plex Sans Arabic';color:#8182BE}
.w-ring{position:absolute;left:50%;top:184px;width:390px;height:390px;transform:translateX(-50%);border-radius:50%;border:1.5px dashed rgba(213,128,182,.55);z-index:2}
.w-chip{position:absolute;left:50%;top:520px;transform:translateX(-50%);z-index:4;display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#E2559A,#C2398A);color:#fff;font:700 30px 'IBM Plex Sans Arabic';padding:14px 30px 14px 26px;border-radius:999px;box-shadow:0 16px 34px rgba(226,85,154,.35);border:5px solid #fff;white-space:nowrap}
.conf{position:absolute;z-index:1;border-radius:6px}
.w-text{position:absolute;left:80px;right:80px;top:640px;text-align:center}
.w-text .pre{font:800 52px/1.3 'Alexandria';color:#2E1F5E;margin-top:10px}
.w-text h1{color:#C2398A;font-size:88px;margin-top:0;white-space:nowrap}
.w-text p{margin-top:8px;font-size:40px}
.handle{position:absolute;left:50%;top:1012px;transform:translateX(-50%);display:flex;align-items:center;gap:16px;background:#fff;border:1px solid rgba(129,130,190,.18);box-shadow:0 24px 60px rgba(46,31,94,.08);border-radius:999px;padding:18px 20px 18px 34px;direction:ltr;white-space:nowrap}
.handle b{font:700 36px 'IBM Plex Sans Arabic';color:#2E1F5E;direction:ltr}
.handle .ig{width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#4B3A8C,#2E1F5E 70%);display:flex;align-items:center;justify-content:center}
.handle .hint{font:600 26px 'IBM Plex Sans Arabic';color:#6E6890;direction:rtl;padding-left:6px;border-left:1.5px solid #E6E3F5;padding-left:18px;margin-left:4px}
'''
CONF=[(150,250,26,12,'#D580B6',-30),(230,420,16,16,'#8182BE',20),(880,260,22,10,'#E2559A',35),(850,470,14,14,'#F2A7D0',0),(930,380,30,10,'#8182BE',-15),(120,520,20,9,'#F2A7D0',50),(300,200,12,12,'#E2559A',0),(780,190,12,12,'#D580B6',0)]
def page(v):
    photo=f'<img src="{v["photo"]}">' if v.get('photo') else f'{icon("image-plus","#8182BE",72)}<span class="ph">شعار أو صورة المنظم</span>'
    conf=''.join(f'<i class="conf" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:{c};transform:rotate({r}deg);{"border-radius:50%" if w==h else ""}"></i>' for x,y,w,h,c,r in CONF)
    return f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&display=block" rel="stylesheet">
<style>{CSS}{WCSS}</style></head><body><div class="post"><div class="glow"></div><div class="frame"></div>
<div class="dots"><i></i><i></i></div>{conf}
<div class="w-ring"></div><div class="w-av"><div class="in">{photo}</div></div>
<div class="w-chip">{icon(v["icon"],"#fff",34)}<span>{v["cat"]}</span></div>
<div class="w-text">
 <div class="label"><b></b><em></em>انضم إلى عائلة ترتيب<em></em><b></b></div>
 <div class="pre">أهلاً وسهلاً بـ</div>
 <h1>{v["name"]}</h1>
 <p>{v["desc"]}</p>
</div>
<div class="handle"><div class="ig">{icon("instagram","#F2A7D0",34)}</div><b>{v["handle"]}</b><span class="hint">تابعوهم على</span></div>
</div></body></html>'''
if __name__=='__main__':
    T=[('06-welcome-organizer',dict(icon='party-popper',cat='منظم مناسبات',name='اسم المنظم',desc='تنسيق حفلات التخرّج والمناسبات الخاصة في مسقط',handle='@username')),
       ('07-welcome-adventure',dict(icon='mountain-snow',cat='صاحب مغامرات',name='اسم المغامر',desc='رحلات جبلية وتخييم في أجمل مواقع عُمان',handle='@username'))]
    for n,v in T: (D/f'{n}.html').write_text(page(v))
    print('ok')
