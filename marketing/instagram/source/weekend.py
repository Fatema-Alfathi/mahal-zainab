from build import icon, D
rows=[('الخميس','🎶','حفلة موسيقية'),('الجمعة','🛶','رحلة بحرية'),('السبت','🏞️','مغامرة وادي')]
r=''.join(f'<div class="row"><span class="d">{d}</span><span class="e">{e}</span><span class="t">{t}</span><span class="ck">{icon("check","#fff",20)}</span></div>' for d,e,t in rows)
html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@800&family=IBM+Plex+Sans+Arabic:wght@500;600;700&display=block" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:1350px}}
.post{{position:relative;width:1080px;height:1350px;background:url(neck-clean.png) 0 0/1080px 1350px;overflow:hidden;font-family:'IBM Plex Sans Arabic'}}
h1{{position:absolute;right:56px;top:268px;font:800 72px/1.25 'Alexandria';color:#2E1F5E;text-align:right}}
h1 .hl{{color:#C2398A}}
.sub{{position:absolute;right:56px;top:470px;text-align:right;font:600 32px/1.5 'IBM Plex Sans Arabic';color:#4B4270}}
.sub b{{color:#C2398A;font-weight:700}}
.card{{position:absolute;right:48px;top:588px;width:370px;padding:24px 26px 18px;border-radius:32px;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.9);box-shadow:0 30px 60px rgba(46,31,94,.16)}}
.card h3{{display:flex;align-items:center;gap:10px;font:700 28px 'IBM Plex Sans Arabic';color:#2E1F5E;margin-bottom:10px}}
.card h3 .ic{{width:44px;height:44px;border-radius:14px;background:radial-gradient(circle at 30% 25%,#4B3A8C,#2E1F5E 70%);display:flex;align-items:center;justify-content:center}}
.row{{display:flex;align-items:center;gap:10px;padding:12px 0;border-top:1px solid #EEEAF7}}
.row .d{{font:600 22px 'IBM Plex Sans Arabic';color:#C2398A;width:74px}}
.row .e{{font-size:24px}}
.row .t{{flex:1;font:600 25px 'IBM Plex Sans Arabic';color:#2E1F5E;white-space:nowrap}}
.ck{{width:32px;height:32px;border-radius:10px;background:#E2559A;display:flex;align-items:center;justify-content:center}}
.cta{{position:absolute;left:70px;top:1162px;display:flex;align-items:center;gap:10px;font:700 32px 'IBM Plex Sans Arabic';color:#2E1F5E;direction:rtl}}
</style></head><body><div class="post">
<h1>طوّلت رقبتك<br><span class="hl">تدوّر؟</span></h1>
<div class="sub">جدول ويكندك <b>جاهز</b><br>في ترتيب ✨</div>
<div class="card"><h3><span class="ic">{icon("calendar-heart","#F2A7D0",26)}</span>جدول الويكند</h3>{r}</div>
<div class="cta">{icon("sparkles","#E2559A",30)}<span>رتّب ويكندك الحين</span></div>
</div></body></html>'''
(D/'10-weekend.html').write_text(html)
