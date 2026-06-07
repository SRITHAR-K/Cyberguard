// src/components/ParticleCanvas.tsx
import { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    let W = 0, H = 0
    const pts: { x:number;y:number;vx:number;vy:number;r:number }[] = []
    const drops: number[] = []
    const rings: { x:number;y:number;r:number;a:number }[] = []
    const mat = '01アイウエオカキクケコサシスセソABCDEF'
    let raf = 0

    const resize = () => {
      W = c.width  = window.innerWidth
      H = c.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    for (let i = 0; i < 110; i++)
      pts.push({ x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45,
        r:Math.random()*1.6+.5 })
    const cols = Math.floor(W / 22)
    for (let i = 0; i < cols; i++) drops[i] = Math.random() * -80

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      // matrix rain
      ctx.font = '11px monospace'
      ctx.fillStyle = 'rgba(56,189,248,0.06)'
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(mat[Math.floor(Math.random()*mat.length)], i*22, drops[i]*22)
        if (drops[i]*22 > H && Math.random() > .975) drops[i] = 0
        drops[i] += .35
      }
      // connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i+1; j < pts.length; j++) {
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y
          const d=Math.sqrt(dx*dx+dy*dy)
          if (d < 140) {
            ctx.strokeStyle = `rgba(56,189,248,${(1-d/140)*.18})`
            ctx.lineWidth = .7
            ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke()
          }
        }
      }
      // dots
      const now = Date.now()
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle = `rgba(56,189,248,${.35+.3*Math.sin(now/1200+i)})`
        ctx.fill()
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0||p.x>W) p.vx*=-1
        if(p.y<0||p.y>H) p.vy*=-1
      }
      // pulse rings
      if (Math.random() < .003)
        rings.push({ x:Math.random()*W, y:Math.random()*H, r:0, a:.6 })
      for (let i = rings.length-1; i >= 0; i--) {
        const l = rings[i]
        ctx.beginPath(); ctx.arc(l.x,l.y,l.r,0,Math.PI*2)
        ctx.strokeStyle = `rgba(56,189,248,${l.a})`
        ctx.lineWidth = 1; ctx.stroke()
        l.r += 2.5; l.a -= .015
        if (l.a <= 0) rings.splice(i, 1)
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} id="cg-canvas" />
}
