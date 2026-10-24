import pathlib,re
from build import icon, hl, CSS, D
JCSS='''
.j-text{position:absolute;left:80px;right:80px;top:212px;text-align:center}
.j-text h1{white-space:normal;font-size:84px;line-height:1.3;margin-top:10px}
.j-text p{margin-top:14px}
.j-cards{position:absolute;left:80px;right:80px;top:700px;display:flex;gap:24px}
.j-card{flex:1;position:relative;text-align:center;padding:84px 24px 32px;border-radius:32px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(10,4,30,.35)}
.j-card .ic{top:-64px}
.j-card h3{font:700 36px/1.3 'IBM Plex Sans Arabic';color:#fff}
.j-card span{display:block;margin-top:6px;font:500 26px/1.5 'IBM Plex Sans Arabic';color:#CFCBEA}
.perks{position:absolute;left:80px;right:80px;top:968px;display:flex;justify-content:center;gap:34px}
.perk{display:flex;align-items:center;gap:12px;font:600 28px 'IBM Plex Sans Arabic';color:#fff}
.chk{width:40px;height:40px;border-radius:12px;background:#E2559A;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(226,85,154,.35)}
.share{position:absolute;left:80px;right:80px;top:1064px;display:flex;justify-content:center;align-items:center;gap:12px;font:600 28px 'IBM Plex Sans Arabic';color:#F2A7D0}
.pill{position:absolute;left:232px;top:1166px;width:616px;height:112px;border-radius:56px;background:#fff;display:flex;align-items:center;direction:ltr;padding:0 36px 0 16px;gap:22px;box-shadow:0 24px 50px rgba(10,4,30,.4);z-index:6}
.pill b{font:700 40px 'IBM Plex Sans Arabic';color:#2E1F5E;flex:1;text-align:center;direction:rtl}
.pill .go{width:80px;height:80px;border-radius:50%;background:#E2559A;display:flex;align-items:center;justify-content:center}
'''
def page(extra=''):
 return f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&family=Montserrat:wght@800&display=block" rel="stylesheet">
<style>{CSS}{JCSS}{extra}</style></head><body><div class="post dark">
<img class="logo" src="logo-white.png"><div class="big-c"></div><div class="glow"></div><div class="frame"></div>
<div class="dots"><i></i><i></i></div>
<div class="j-text">
 <div class="label"><b></b><em></em>دعوة انضمام<em></em><b></b></div>
 <h1>تنظّم مناسبات<br>أو تقدّم <span class="hl">مغامرات</span>؟</h1>
 <p>انضم إلى <span class="hl">ترتيب</span> واعرض خدماتك في عُمان.</p>
</div>
<div class="j-cards">
 <div class="j-card"><div class="ic">{icon("party-popper","#fff",60)}</div><h3>منظمو المناسبات</h3><span>حفلات، تخرّج، ديكور وتوزيعات</span></div>
 <div class="j-card"><div class="ic">{icon("mountain-snow","#fff",60)}</div><h3>أصحاب المغامرات</h3><span>رحلات، تخييم، غوص وأنشطة</span></div>
</div>
<div class="perks">
 <div class="perk"><div class="chk">{icon("check","#fff",26)}</div>صفحة خاصة لخدماتك</div>
 <div class="perk"><div class="chk">{icon("check","#fff",26)}</div>وصول لعملاء جدد</div>
</div>
<div class="share">{icon("send","#F2A7D0",30)}<span>تعرف منظم أو مغامر؟ شارك البوست معه</span></div>
<div class="pill"><div class="go">{icon("arrow-left","#fff",40)}</div><b>راسلنا على الدايركت</b>{icon("message-circle-heart","#E2559A",50)}</div>
</div></body></html>'''
(D/'04-join-dark.html').write_text(page())
STORY='''
html,body,.post,.post.dark{height:1920px}
.dark .logo{top:226px}
.dots{top:268px}
.j-text{top:430px}
.j-text h1{font-size:92px}
.j-cards{top:880px;flex-direction:column;gap:32px}
.j-card{display:grid;grid-template-columns:128px 1fr;grid-template-rows:auto auto;column-gap:32px;align-content:center;text-align:right;padding:36px 40px;min-height:200px}
.j-card .ic{position:static;transform:none;grid-row:1 / 3;align-self:center}
.j-card h3{font-size:40px;align-self:end}
.j-card span{font-size:28px;align-self:start}
.perks{top:1368px}
.share{top:1448px}
.pill{top:1524px}
.dark .big-c{bottom:-380px}
'''
(D/'05-join-story.html').write_text(page(STORY))
