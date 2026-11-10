#!/usr/bin/env python3
"""รวมไฟล์ใน src/ เป็น index.html ไฟล์เดียว  ใช้:  python3 build.py"""
import os
D=os.path.dirname(os.path.abspath(__file__)); S=os.path.join(D,'src')
ORDER=['logo.js','kb.js','cross.js','master.js','engine.js','lab.js','foodac.js','policy.js','policy70.js','ui.js','dtl.js','tools.js','rca.js','crrt.js','mrplan.js','wfdi.js','mr.js','arv.js','oi.js','anticoag.js','periop.js','antidote.js','nac.js','hd.js','pedx.js','hadx.js','tbtab.js','tbleaf.js','tbre.js','tbsum.js','drtb.js','neo.js','iou.js','liqleaf.js','liqpaste.js','liqreco.js','adr.js','adra.js','rash.js','platform.js','ocr.js','copy.js']
shell=open(os.path.join(S,'shell.html'),encoding='utf-8').read()
js=''.join(open(os.path.join(S,f),encoding='utf-8').read()+'\n' for f in ORDER)
open(os.path.join(D,'index.html'),'w',encoding='utf-8').write(shell.replace('<!--SCRIPTS-->','<script>\n'+js+'</script>'))
print('สร้าง index.html เรียบร้อย')
