import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#07080f",card:"#0f1220",card2:"#141828",border:"#1e2440",
  text:"#dde4f0",muted:"#5a6280",accent:"#f0a500",
  iu:"#e63946",lq:"#4ade80",qg:"#a855f7",pz:"#facc15",
  hhk:"#be123c",rwp:"#f97316",ms:"#16a34a",kk:"#38bdf8"
};
const TC={"Islamabad United":C.iu,"Lahore Qalandars":C.lq,"Quetta Gladiators":C.qg,"Peshawar Zalmi":C.pz,"Hyderabad Kingsmen":C.hhk,"Rawalpindi Pindiz":C.rwp,"Multan Sultans":C.ms,"Karachi Kings":C.kk};
const tc=n=>TC[n]||C.text;
const pad=n=>String(n).padStart(2,"0");
const toUTC=(ds,h,m)=>{const p=ds.split("-").map(Number);return Date.UTC(p[0],p[1]-1,p[2],h-5,m);};
const fmtDate=ms=>new Date(ms).toLocaleDateString("en",{weekday:"short",day:"numeric",month:"short"});
const fmtPKT=(h,m)=>`${h%12||12}:${pad(m)} ${h>=12?"PM":"AM"} PKT`;
const getSt=(m,now)=>now<m.s?"upcoming":now<=m.e?"live":"past";
const DUR=3.5*3600*1000;

const RAW=[[1,"2026-03-26",19,0,"Lahore Qalandars","Hyderabad Kingsmen","Lahore"],[2,"2026-03-27",19,0,"Quetta Gladiators","Karachi Kings","Lahore"],[3,"2026-03-28",14,30,"Peshawar Zalmi","Rawalpindi Pindiz","Lahore"],[4,"2026-03-28",19,0,"Multan Sultans","Islamabad United","Lahore"],[5,"2026-03-29",14,30,"Quetta Gladiators","Hyderabad Kingsmen","Lahore"],[6,"2026-03-29",19,0,"Lahore Qalandars","Karachi Kings","Lahore"],[7,"2026-03-31",19,0,"Islamabad United","Peshawar Zalmi","Karachi"],[8,"2026-04-01",19,0,"Multan Sultans","Hyderabad Kingsmen","Karachi"],[9,"2026-04-02",14,30,"Quetta Gladiators","Islamabad United","Karachi"],[10,"2026-04-02",19,0,"Rawalpindi Pindiz","Karachi Kings","Karachi"],[11,"2026-04-03",19,0,"Lahore Qalandars","Multan Sultans","Karachi"],[12,"2026-04-04",19,0,"Rawalpindi Pindiz","Islamabad United","Karachi"],[13,"2026-04-05",19,0,"Quetta Gladiators","Multan Sultans","Karachi"],[14,"2026-04-06",19,0,"Multan Sultans","Rawalpindi Pindiz","Karachi"],[15,"2026-04-08",19,0,"Hyderabad Kingsmen","Peshawar Zalmi","Lahore"],[16,"2026-04-09",14,30,"Lahore Qalandars","Islamabad United","Karachi"],[17,"2026-04-09",19,0,"Karachi Kings","Peshawar Zalmi","Karachi"],[18,"2026-04-10",19,0,"Quetta Gladiators","Rawalpindi Pindiz","Lahore"],[19,"2026-04-11",14,30,"Peshawar Zalmi","Lahore Qalandars","Lahore"],[20,"2026-04-11",19,0,"Karachi Kings","Hyderabad Kingsmen","Lahore"],[21,"2026-04-12",19,0,"Hyderabad Kingsmen","Islamabad United","Lahore"],[22,"2026-04-13",19,0,"Peshawar Zalmi","Multan Sultans","Lahore"],[23,"2026-04-15",19,0,"Peshawar Zalmi","Quetta Gladiators","Karachi"],[24,"2026-04-16",14,30,"Hyderabad Kingsmen","Rawalpindi Pindiz","Karachi"],[25,"2026-04-16",19,0,"Karachi Kings","Islamabad United","Karachi"],[26,"2026-04-17",19,0,"Lahore Qalandars","Quetta Gladiators","Karachi"],[27,"2026-04-18",19,0,"Lahore Qalandars","Rawalpindi Pindiz","Karachi"],[28,"2026-04-19",14,30,"Karachi Kings","Multan Sultans","Lahore"],[29,"2026-04-19",19,0,"Peshawar Zalmi","Quetta Gladiators","Lahore"],[30,"2026-04-21",14,30,"Lahore Qalandars","Quetta Gladiators","Lahore"],[31,"2026-04-21",19,0,"Rawalpindi Pindiz","Multan Sultans","Lahore"],[32,"2026-04-22",14,30,"Karachi Kings","Peshawar Zalmi","Lahore"],[33,"2026-04-22",19,0,"Hyderabad Kingsmen","Multan Sultans","Lahore"],[34,"2026-04-23",14,30,"Rawalpindi Pindiz","Islamabad United","Karachi"],[35,"2026-04-23",19,0,"Lahore Qalandars","Karachi Kings","Karachi"],[36,"2026-04-24",19,0,"Hyderabad Kingsmen","Islamabad United","Karachi"],[37,"2026-04-25",14,30,"Quetta Gladiators","Karachi Kings","Karachi"],[38,"2026-04-25",19,0,"Lahore Qalandars","Peshawar Zalmi","Karachi"],[39,"2026-04-26",14,30,"Hyderabad Kingsmen","Rawalpindi Pindiz","Lahore"],[40,"2026-04-26",19,0,"Islamabad United","Multan Sultans","Lahore"],[41,"2026-04-28",19,0,"TBD","TBD","Karachi","qualifier"],[42,"2026-04-29",19,0,"TBD","TBD","Lahore","eliminator"],[43,"2026-05-01",19,0,"TBD","TBD","Lahore","eliminator"],[44,"2026-05-03",19,0,"TBD","TBD","Lahore","final"]];
const MATCHES=RAW.map(r=>{const s=toUTC(r[1],r[2],r[3]);return{id:r[0],h:r[2],m:r[3],a:r[4],b:r[5],venue:r[6],type:r[7]||"group",s,e:s+DUR,isMS:r[4]==="Multan Sultans"||r[5]==="Multan Sultans"};});

const SQUADS=[
  {name:"Lahore Qalandars",abbr:"LQ",color:C.lq,captain:"Shaheen Shah Afridi",
   players:[{n:"Shaheen Shah Afridi",r:"Bowler",cap:true},{n:"Fakhar Zaman",r:"Batter"},{n:"Abdullah Shafique",r:"Batter"},{n:"Haris Rauf",r:"Bowler"},{n:"Sikandar Raza",r:"All-rounder",ov:true},{n:"Usama Mir",r:"Bowler"},{n:"Mohammad Naeem",r:"Batter"},{n:"Asif Ali",r:"Batter"},{n:"Hussain Talat",r:"All-rounder"},{n:"Tayyab Tahir",r:"Batter"},{n:"Haseebullah Khan",r:"WK-Batter"},{n:"Mustafizur Rahman",r:"Bowler",ov:true},{n:"Daniel Sams",r:"All-rounder",ov:true},{n:"Parvez Hussain Emon",r:"Batter",ov:true},{n:"Dunith Wellalage",r:"All-rounder",ov:true},{n:"Gudakesh Motie",r:"Bowler",ov:true}]},
  {name:"Islamabad United",abbr:"IU",color:C.iu,captain:"Shadab Khan",
   players:[{n:"Shadab Khan",r:"All-rounder",cap:true},{n:"Faheem Ashraf",r:"All-rounder"},{n:"Imad Wasim",r:"All-rounder"},{n:"Haider Ali",r:"Batter"},{n:"Mohammad Hasnain",r:"Bowler"},{n:"Salman Irshad",r:"Bowler"},{n:"Nisar Ahmed",r:"Bowler"},{n:"Mehran Mumtaz",r:"Batter"},{n:"Devon Conway",r:"WK-Batter",ov:true},{n:"Andries Gous",r:"WK-Batter",ov:true},{n:"Chris Green",r:"All-rounder",ov:true},{n:"Mark Chapman",r:"Batter",ov:true},{n:"Richard Gleeson",r:"Bowler",ov:true},{n:"Dipendra Singh Airee",r:"All-rounder",ov:true}]},
  {name:"Quetta Gladiators",abbr:"QG",color:C.qg,captain:"Saud Shakeel",
   players:[{n:"Saud Shakeel",r:"Batter",cap:true},{n:"Abrar Ahmed",r:"Bowler"},{n:"Ahmed Daniyal",r:"Bowler"},{n:"Hasan Nawaz",r:"All-rounder"},{n:"Jahandad Khan",r:"Bowler"},{n:"Wasim Akram Jnr",r:"Bowler"},{n:"Bismillah Khan",r:"WK-Batter"},{n:"Ahsan Ali",r:"Batter"},{n:"Khalil Ahmed",r:"Bowler"},{n:"Alzarri Joseph",r:"Bowler",ov:true},{n:"Rilee Rossouw",r:"Batter",ov:true},{n:"Sam Harper",r:"WK-Batter",ov:true},{n:"Ben McDermott",r:"Batter",ov:true},{n:"Tom Curran",r:"All-rounder",ov:true},{n:"Bevon Jacobs",r:"All-rounder",ov:true}]},
  {name:"Peshawar Zalmi",abbr:"PZ",color:C.pz,captain:"Babar Azam",
   players:[{n:"Babar Azam",r:"Batter",cap:true},{n:"Aamir Jamal",r:"All-rounder"},{n:"Shahnawaz Dahani",r:"Bowler"},{n:"Iftikhar Ahmed",r:"All-rounder"},{n:"Mohammad Haris",r:"WK-Batter"},{n:"Sufyan Moqim",r:"Bowler"},{n:"Abdul Samad",r:"All-rounder"},{n:"Khalid Usman",r:"Bowler"},{n:"Mirza Tahir Baig",r:"WK-Batter"},{n:"Khurram Shahzad",r:"Bowler"},{n:"James Vince",r:"Batter",ov:true},{n:"Michael Bracewell",r:"All-rounder",ov:true},{n:"Kusal Mendis",r:"WK-Batter",ov:true},{n:"Aaron Hardie",r:"All-rounder",ov:true},{n:"Nahid Rana",r:"Bowler",ov:true}]},
  {name:"Multan Sultans",abbr:"MS",color:C.ms,captain:"Ashton Turner",
   players:[{n:"Ashton Turner",r:"Batter",cap:true,ov:true},{n:"Sahibzada Farhan",r:"Batter"},{n:"Shan Masood",r:"Batter"},{n:"Mohammad Nawaz",r:"All-rounder"},{n:"Arshad Iqbal",r:"Bowler"},{n:"Shehzad Gul",r:"Bowler"},{n:"Faisal Akram",r:"All-rounder"},{n:"Imran Randhawa",r:"Bowler"},{n:"Momin Qamar",r:"WK-Batter"},{n:"Mohammad Wasim Jnr",r:"Bowler"},{n:"Steve Smith",r:"Batter",ov:true},{n:"Peter Siddle",r:"Bowler",ov:true},{n:"Tabraiz Shamsi",r:"Bowler",ov:true},{n:"Josh Philippe",r:"WK-Batter",ov:true},{n:"Delano Potgieter",r:"Batter",ov:true},{n:"Lachlan Shaw",r:"All-rounder",ov:true}]},
  {name:"Karachi Kings",abbr:"KK",color:C.kk,captain:"David Warner",
   players:[{n:"David Warner",r:"Batter",cap:true,ov:true},{n:"Hasan Ali",r:"Bowler"},{n:"Khushdil Shah",r:"All-rounder"},{n:"Azam Khan",r:"WK-Batter"},{n:"Salman Ali Agha",r:"All-rounder"},{n:"Shahid Aziz",r:"Bowler"},{n:"Mir Hamza",r:"Bowler"},{n:"Mohammad Abbas Afridi",r:"Bowler"},{n:"Haroon Arshad",r:"Batter"},{n:"Ihsanullah",r:"Bowler"},{n:"Moeen Ali",r:"All-rounder",ov:true},{n:"Adam Zampa",r:"Bowler",ov:true},{n:"Reeza Hendricks",r:"Batter",ov:true},{n:"Muhammad Waseem",r:"Batter",ov:true}]},
  {name:"Hyderabad Kingsmen",abbr:"HK",color:C.hhk,captain:"Marnus Labuschagne",
   players:[{n:"Marnus Labuschagne",r:"Batter",cap:true,ov:true},{n:"Saim Ayub",r:"Batter"},{n:"Sharjeel Khan",r:"Batter"},{n:"Mohammad Ali",r:"Bowler"},{n:"Hammad Azam",r:"All-rounder"},{n:"Usman Khan",r:"Batter"},{n:"Akif Javed",r:"Bowler"},{n:"Hunain Shah",r:"Bowler"},{n:"Asif Mehmood",r:"Bowler"},{n:"Muhammad Irfan Khan",r:"Batter"},{n:"Glenn Maxwell",r:"All-rounder",ov:true},{n:"Kusal Perera",r:"WK-Batter",ov:true},{n:"Riley Meredith",r:"Bowler",ov:true},{n:"Maheesh Theekshana",r:"Bowler",ov:true}]},
  {name:"Rawalpindi Pindiz",abbr:"RP",color:C.rwp,captain:"Mohammad Rizwan",
   players:[{n:"Mohammad Rizwan",r:"WK-Batter",cap:true},{n:"Naseem Shah",r:"Bowler"},{n:"Mohammad Amir",r:"Bowler"},{n:"Amad Butt",r:"All-rounder"},{n:"Kamran Ghulam",r:"Batter"},{n:"Asif Afridi",r:"Bowler"},{n:"Jalat Khan",r:"Bowler"},{n:"Yasir Khan",r:"Bowler"},{n:"Abdullah Fazal",r:"Batter"},{n:"Fawad Ali",r:"Batter"},{n:"Saad Masood",r:"All-rounder"},{n:"Sam Billings",r:"WK-Batter",ov:true},{n:"Daryl Mitchell",r:"All-rounder",ov:true},{n:"Rishad Hossain",r:"Bowler",ov:true},{n:"Cole McConchie",r:"All-rounder",ov:true},{n:"Laurie Evans",r:"Batter",ov:true}]},
];

async function aiCall(system,userMsg){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,tools:[{type:"web_search_20250305",name:"web_search"}],system,messages:[{role:"user",content:userMsg}]})});
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  const d=await res.json();
  const txt=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  let json=null;
  try{const x=txt.match(/\{[\s\S]*\}/);if(x)json=JSON.parse(x[0]);}catch(e){}
  return{json,txt};
}

const S=`
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Rajdhani:wght@500;600;700&family=Exo+2:wght@400;600;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.r{background:${C.bg};min-height:100vh;font-family:'Exo 2',sans-serif;overflow-x:hidden;color:${C.text};}
@keyframes pu{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.65)}}
@keyframes bl{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes sp{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes dr{0%{transform:translate(0,0) scale(1)}100%{transform:translate(40px,-30px) scale(1.08)}}
.blob{position:absolute;border-radius:50%;filter:blur(100px);opacity:.09;animation:dr 20s ease-in-out infinite alternate;}
.sp-ico{animation:sp .65s linear infinite;display:inline-block;}
.fu{animation:fu .35s ease both;}
.tab{font-family:'Rajdhani',sans-serif;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:9px 14px;border-radius:9px;border:none;cursor:pointer;transition:all .22s;white-space:nowrap;font-size:.8rem;}
.mrow{display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:11px;margin-bottom:6px;transition:transform .18s;cursor:default;flex-wrap:nowrap;}
.mrow:hover{transform:translateX(3px);}
.bdg{font-family:'Rajdhani',sans-serif;font-size:.58rem;letter-spacing:2px;font-weight:700;text-transform:uppercase;padding:3px 7px;border-radius:5px;white-space:nowrap;flex-shrink:0;}
.aib{font-family:'Rajdhani',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:8px 18px;border-radius:20px;border:none;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .2s;}
.aib:disabled{opacity:.45;cursor:not-allowed;}
.aib:hover:not(:disabled){filter:brightness(1.15);transform:scale(1.03);}
.pt{width:100%;border-collapse:collapse;font-family:'Rajdhani',sans-serif;}
.pt th{font-size:.62rem;letter-spacing:2px;text-transform:uppercase;color:${C.muted};font-weight:700;padding:8px 8px;border-bottom:1px solid ${C.border};text-align:center;}
.pt td{padding:9px 8px;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);font-size:.85rem;}
.pt tr:last-child td{border-bottom:none;}
.pt tr:hover td{background:rgba(255,255,255,.025);}
.sc-r{display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);flex-wrap:wrap;gap:6px;}
.sc-r:last-child{border-bottom:none;}
.st-r{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);}
.st-r:last-child{border-bottom:none;}
.pl li{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-family:'Rajdhani',sans-serif;font-size:.82rem;gap:8px;list-style:none;}
.pl li:last-child{border-bottom:none;}
::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-track{background:${C.card};}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
`;

function Clock(){
  const [t,setT]=useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i);},[]);
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,margin:"0 0 18px",background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"10px 18px",flexWrap:"wrap",fontFamily:"'Rajdhani',sans-serif",fontSize:".8rem",color:C.muted,textAlign:"center"}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:C.ms,boxShadow:`0 0 7px ${C.ms}`,display:"inline-block",animation:"pu 1.6s ease-in-out infinite",flexShrink:0}}/>
      <span>{t.toLocaleDateString("en",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>
      <span style={{fontFamily:"'Anton',cursive",fontSize:"1.45rem",letterSpacing:4,color:C.ms}}>{pad(t.getHours())}:{pad(t.getMinutes())}:{pad(t.getSeconds())}</span>
      <span style={{fontSize:".72rem"}}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
    </div>
  );
}

function CD({target}){
  const [s,setS]=useState(Math.max(0,Math.floor((target-Date.now())/1000)));
  useEffect(()=>{const i=setInterval(()=>setS(Math.max(0,Math.floor((target-Date.now())/1000))),1000);return()=>clearInterval(i);},[target]);
  return(
    <div style={{marginTop:16}}>
      <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".65rem",letterSpacing:3,color:C.muted,textTransform:"uppercase",marginBottom:7}}>Starts In</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[["Days",Math.floor(s/86400)],["Hrs",Math.floor((s%86400)/3600)],["Min",Math.floor((s%3600)/60)],["Sec",s%60]].map(([l,v],i)=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:8}}>
            {i>0&&<span style={{fontFamily:"'Anton',cursive",fontSize:"1.7rem",color:C.border}}>:</span>}
            <div style={{textAlign:"center"}}>
              <span style={{fontFamily:"'Anton',cursive",fontSize:"2rem",letterSpacing:2,color:C.accent,display:"block",lineHeight:1}}>{pad(v)}</span>
              <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".6rem",color:C.muted,letterSpacing:2,textTransform:"uppercase"}}>{l}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spotlight({now}){
  let lm=null,nm=null;
  for(const m of MATCHES){const st=getSt(m,now);if(st==="live"&&!lm)lm=m;if(st==="upcoming"&&!nm)nm=m;}
  const match=lm||nm,state=lm?"live":nm?"upcoming":"ended";
  const bdr=state==="live"?C.ms:state==="upcoming"?C.accent:C.border;
  const bg=state==="live"?"linear-gradient(135deg,#041008,#071510)":state==="upcoming"?"linear-gradient(135deg,#181107,#130e06)":C.card;
  if(!match)return<div style={{borderRadius:14,padding:22,marginBottom:20,border:`1px solid ${C.border}`,background:C.card,textAlign:"center",fontFamily:"'Anton',cursive",letterSpacing:4,color:C.muted}}>🏆 PSL 2026 CONCLUDED</div>;
  return(
    <div className="fu" style={{borderRadius:14,padding:"22px 20px",marginBottom:20,border:`1.5px solid ${bdr}`,background:bg,boxShadow:`0 0 32px ${bdr}18`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at top left,${bdr}12 0%,transparent 65%)`,pointerEvents:"none"}}/>
      <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".65rem",letterSpacing:4,fontWeight:700,textTransform:"uppercase",marginBottom:12,color:bdr,position:"relative",display:"flex",alignItems:"center",gap:7}}>
        {state==="live"&&<span style={{width:7,height:7,borderRadius:"50%",background:C.ms,display:"inline-block",animation:"bl .9s ease-in-out infinite"}}/>}
        {state==="live"?"● LIVE NOW":"⏱ NEXT MATCH"}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,position:"relative",minWidth:0}}>
        <div style={{fontFamily:"'Anton',cursive",fontSize:"clamp(1.1rem,3vw,1.9rem)",letterSpacing:2,flex:"1 1 0",minWidth:0,color:tc(match.a),textShadow:`0 0 16px ${tc(match.a)}55`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.a}</div>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:".9rem",fontWeight:700,letterSpacing:3,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",padding:"4px 10px",borderRadius:7,color:C.muted,flexShrink:0}}>VS</div>
        <div style={{fontFamily:"'Anton',cursive",fontSize:"clamp(1.1rem,3vw,1.9rem)",letterSpacing:2,flex:"1 1 0",minWidth:0,textAlign:"right",color:tc(match.b),textShadow:`0 0 16px ${tc(match.b)}55`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.b}</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:13,fontFamily:"'Rajdhani',sans-serif",fontSize:".76rem",position:"relative"}}>
        {[`📅 ${fmtDate(match.s)}`,`🕐 ${fmtPKT(match.h,match.m)}`,`📍 ${match.venue}`,match.type!=="group"?`🏆 ${match.type}`:`#${match.id}`].map((t,i)=>(
          <span key={i} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:18,padding:"3px 11px"}}>{t}</span>
        ))}
      </div>
      {state==="live"
        ?<div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(22,163,74,.15)",border:"1px solid rgba(22,163,74,.35)",borderRadius:18,padding:"6px 15px",fontFamily:"'Rajdhani',sans-serif",fontSize:".78rem",fontWeight:700,color:C.ms,marginTop:14,letterSpacing:2,animation:"bl .9s ease-in-out infinite"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:C.ms,display:"inline-block"}}/>Match In Progress</div>
        :<CD target={match.s}/>}
    </div>
  );
}

function LiveScore({now}){
  const [loading,setL]=useState(false);
  const [res,setR]=useState(null);
  const cur=useRef(null),last=useRef(0);
  const min=Math.floor(now/60000);
  useEffect(()=>{
    let lm=null;
    for(const m of MATCHES){if(getSt(m,now)==="live"){lm=m;break;}}
    if(lm){const fresh=!cur.current||cur.current.id!==lm.id;cur.current=lm;if(fresh){last.current=0;go(lm);}}
    else cur.current=null;
  },[min]);
  async function go(m,forced=false){
    if(!forced&&Date.now()-last.current<90000)return;
    setL(true);setR(null);
    try{const r=await aiCall('Cricket score assistant. Search for live PSL 2026 match score now. Return ONLY raw JSON no markdown: {"teamA":"","teamAScore":"or null","teamB":"","teamBScore":"or null","status":"","crr":null,"rrr":null,"batsmen":null,"bowler":null,"ts":""}',`Live score: ${m.a} vs ${m.b} PSL 2026. JSON only.`);last.current=Date.now();setR(r);}
    catch(e){setR({err:e.message});}
    setL(false);
  }
  if(!cur.current)return null;
  const s=res?.json;
  return(
    <div className="fu" style={{borderRadius:13,padding:"18px 18px 14px",marginBottom:20,background:"linear-gradient(135deg,#041008,#071410)",border:`1.5px solid ${C.ms}`,boxShadow:`0 0 24px ${C.ms}15`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Rajdhani',sans
