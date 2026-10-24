from build import icon, D
rows=[('الخميس','🎶','حفلة موسيقية'),('الجمعة','🛶','رحلة بحرية'),('السبت','🏞️','مغامرة وادي')]
r=''.join(f'<div class="row"><span class="d">{d}</span><span class="e">{e}</span><span class="t">{t}</span><span class="ck">{icon("check","#fff",20)}</span></div>' for d,e,t in rows)
html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&family=Montserrat:wght@800&display=block" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:1350px}}
.post{{position:relative;width:1080px;height:1350px;background:url(neck-clean3.png) 0 0/1080px 1350px;overflow:hidden;font-family:'IBM Plex Sans Arabic'}}
.logo{{position:absolute;right:80px;top:72px;height:84px}}
.glowtr{{position:absolute;right:-120px;top:-80px;width:760px;height:640px;background:radial-gradient(closest-side,rgba(255,255,255,.55),rgba(255,255,255,0))}}
.label{{position:absolute;right:80px;top:212px;display:flex;align-items:center;gap:12px;font:600 28px 'IBM Plex Sans Arabic';color:#C2398A}}
.label b{{width:60px;height:1.5px;background:linear-gradient(270deg,transparent,#D580B6)}}
.label em{{display:inline-block;width:9px;height:9px;background:#D580B6;transform:rotate(45deg);border-radius:2px}}
.frame{{position:absolute;inset:36px;border:1.5px solid rgba(255,255,255,.6);border-radius:44px;pointer-events:none}}
.dots{{position:absolute;left:84px;top:104px;display:flex;gap:10px}}.dots i{{width:16px;height:16px;border-radius:50%;background:#D580B6;box-shadow:0 2px 8px rgba(46,31,94,.2)}}
h1{{position:absolute;right:80px;top:250px;font:800 88px/1.25 'Alexandria';color:#2E1F5E;text-align:right;white-space:nowrap}}
h1 .hl{{color:#C2398A}}
.sub{{position:absolute;right:80px;top:372px;text-align:right;font:600 38px/1.45 'IBM Plex Sans Arabic';color:#4B4270}}
.sub b{{color:#C2398A;font-weight:700}}
.swash{{position:absolute;right:80px;top:490px;width:230px;height:8px;border-radius:8px;background:linear-gradient(90deg,rgba(226,85,154,0),#E2559A)}}
.card{{position:absolute;right:80px;top:560px;width:370px;padding:24px 26px 18px;border-radius:32px;background:rgba(255,255,255,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(129,130,190,.16);box-shadow:0 24px 60px rgba(46,31,94,.14)}}
.card h3{{display:flex;align-items:center;gap:10px;font:700 28px 'IBM Plex Sans Arabic';color:#2E1F5E;margin-bottom:10px}}
.card h3 .ic{{width:44px;height:44px;border-radius:14px;background:radial-gradient(circle at 30% 25%,#4B3A8C,#2E1F5E 70%);display:flex;align-items:center;justify-content:center}}
.row{{display:flex;align-items:center;gap:10px;padding:12px 0;border-top:1px solid #EEEAF7}}
.row .d{{font:600 22px 'IBM Plex Sans Arabic';color:#C2398A;width:74px}}
.row .e{{font-size:24px}}
.row .t{{flex:1;font:600 25px 'IBM Plex Sans Arabic';color:#2E1F5E;white-space:nowrap}}
.ck{{width:32px;height:32px;border-radius:10px;background:#E2559A;display:flex;align-items:center;justify-content:center}}
.pill{{position:absolute;left:80px;top:1218px;height:84px;display:flex;align-items:center;gap:20px;background:#fff;border-radius:42px;padding:0 10px 0 26px;direction:ltr;box-shadow:0 20px 44px rgba(46,31,94,.18)}}
.pill b{{font:800 34px 'Montserrat';color:#2E1F5E;letter-spacing:-.5px}}
.pill .go{{width:64px;height:64px;border-radius:50%;background:#E2559A;display:flex;align-items:center;justify-content:center}}
.cta{{position:absolute;left:84px;top:1160px;display:flex;align-items:center;gap:10px;font:700 32px 'IBM Plex Sans Arabic';color:#2E1F5E;direction:rtl}}
</style></head><body><div class="post"><div class="frame"></div><div class="dots"><i></i><i></i></div>
<div class="glowtr"></div><img class="logo" src="logo-color.png">
<div class="label"><em></em>خطّط ويكندك<em></em><b></b></div>
<h1>ريّح راسك</h1>
<div class="sub">وخلّ ويكندك<br>على <b>ترتيب</b> ✨</div><div class="swash"></div>
<div class="card"><h3><span class="ic">{icon("calendar-heart","#F2A7D0",26)}</span>جدول الويكند</h3>{r}</div>
<div class="pill">{icon("globe","#2E1F5E",42)}<b>www.trtib.app</b><div class="go">{icon("arrow-right","#fff",36)}</div></div>
<div class="cta">{icon("sparkles","#E2559A",30)}<span>رتّب ويكندك الحين</span></div>
</div></body></html>'''
(D/'10-weekend.html').write_text(html)
