'use client';
import React from 'react';

export function BarChart({ data, height = 240 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(48, Math.floor(600 / data.length) - 16);
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${Math.max(data.length*(barW+24)+40,300)} ${height+40}`} className="w-full" style={{minWidth:data.length*(barW+24)+40}}>
        {[0,0.25,0.5,0.75,1].map(p=>(
          <g key={p}>
            <line x1="40" y1={height-p*(height-20)} x2={data.length*(barW+24)+40} y2={height-p*(height-20)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray={p===0?'0':'4,4'}/>
            <text x="36" y={height-p*(height-20)+4} textAnchor="end" className="fill-slate-400" fontSize="10">{Math.round(max*p)}</text>
          </g>
        ))}
        {data.map((d,i)=>{
          const barH=(d.value/max)*(height-20), x=50+i*(barW+24), y=height-barH, c=d.color||colors[i%colors.length];
          return (
            <g key={i}>
              <rect x={x} y={y+2} width={barW} height={barH} rx={6} fill={c} opacity={0.15}/>
              <rect x={x} y={y} width={barW} height={barH} rx={6} fill={c}/>
              <text x={x+barW/2} y={y-8} textAnchor="middle" className="fill-slate-700" fontSize="11" fontWeight="600">{d.value}</text>
              <text x={x+barW/2} y={height+18} textAnchor="middle" className="fill-slate-500" fontSize="10">{d.label.length>10?d.label.slice(0,10)+'…':d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PieChart({ data, size=200, donut=true }: { data:{label:string;value:number;color?:string}[]; size?:number; donut?:boolean }) {
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  const cx=size/2, cy=size/2, r=size/2-10, ir=donut?r*0.6:0;
  const colors=['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];
  let cum=-90;
  const slices=data.map((d,i)=>{
    const ang=(d.value/total)*360, sa=cum, ea=cum+ang; cum=ea;
    const sr=(sa*Math.PI)/180, er=(ea*Math.PI)/180, la=ang>180?1:0;
    const x1=cx+r*Math.cos(sr),y1=cy+r*Math.sin(sr),x2=cx+r*Math.cos(er),y2=cy+r*Math.sin(er);
    const ix1=cx+ir*Math.cos(sr),iy1=cy+ir*Math.sin(sr),ix2=cx+ir*Math.cos(er),iy2=cy+ir*Math.sin(er);
    const path=donut?`M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${la} 0 ${ix1} ${iy1} Z`
      :`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`;
    return {path,color:d.color||colors[i%colors.length],label:d.label,value:d.value,pct:((d.value/total)*100).toFixed(1)};
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} className="transition-all duration-300 hover:opacity-80" stroke="white" strokeWidth={2}/>)}
        {donut&&<text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-slate-900" fontSize="20" fontWeight="700">{total}</text>}
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((s,i)=>(
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor:s.color}}/>
            <span className="text-slate-600">{s.label}</span>
            <span className="text-slate-900 font-semibold ml-auto pl-3">{s.value}</span>
            <span className="text-slate-400 text-xs">({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
