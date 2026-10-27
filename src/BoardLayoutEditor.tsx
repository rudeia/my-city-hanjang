import {Fragment,useRef,useState,type PointerEvent as ReactPointerEvent,type KeyboardEvent} from 'react';
import type {CityPlan,BoardBlockId,BoardLayout} from './model';
import type {BoardDocument,BoardBlock} from './svg-text';

type Drag={id:string;pointerId:number;clientX:number;clientY:number;x:number;y:number;renderScale:number;blockScale:number;mode:"move"|"resize";before:BoardLayout;moved:boolean};
export default function BoardLayoutEditor({plan,document,onChange,disabled=false}:{plan:CityPlan;document:BoardDocument;onChange:(p:CityPlan)=>void;disabled?:boolean}){
 const [editing,setEditing]=useState(true),[snap,setSnap]=useState(true),[selected,setSelected]=useState<string|null>(null),[history,setHistory]=useState<BoardLayout[]>([]),[dragging,setDragging]=useState(false);
 const canvas=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null),latest=useRef(plan);latest.current=plan;
 const blocks=document.blocks??[],active=blocks.find(b=>b.id===selected);
 const remember=(layout:BoardLayout)=>setHistory(h=>[...h.slice(-19),structuredClone(layout)]);
 function move(block:BoardBlock,x:number,y:number){
  if(disabled)return;
  const nextX=Math.max(16,Math.min(document.width-block.width-16,x)),nextY=Math.max(16,Math.max(block.baseY-10000,Math.min(block.baseY+10000,y)));
  const current=latest.current;
  onChange({...current,boardLayout:{...current.boardLayout,[block.id as BoardBlockId]:{x:nextX-block.baseX,y:nextY-block.baseY,scale:block.scale}}});
 }
 function resize(block:BoardBlock,size:number){
  if(disabled)return;const current=latest.current,position=current.boardLayout?.[block.id as BoardBlockId];
  const scale=Math.max(.3,Math.min(2,(document.width-32)/block.baseWidth,size)),x=Math.max(16,Math.min(document.width-16-block.baseWidth*scale,block.baseX+(position?.x??0)));
  onChange({...current,boardLayout:{...current.boardLayout,[block.id as BoardBlockId]:{x:x-block.baseX,y:position?.y??0,scale}}});
 }
 function start(e:ReactPointerEvent<HTMLButtonElement>,b:BoardBlock,mode:"move"|"resize"="move"){
  if(disabled||e.button!==0||!canvas.current)return;
  e.preventDefault();e.currentTarget.focus({preventScroll:true});setSelected(b.id);
  const box=canvas.current.getBoundingClientRect();
  drag.current={id:b.id,pointerId:e.pointerId,clientX:e.clientX,clientY:e.clientY,x:b.x,y:b.y,renderScale:box.width/document.width,blockScale:b.scale,mode,before:structuredClone(latest.current.boardLayout??{}),moved:false};
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function moving(e:ReactPointerEvent<HTMLButtonElement>){
  const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;
  const b=blocks.find(b=>b.id===d.id);if(!b)return;
  const dx=(e.clientX-d.clientX)/d.renderScale,dy=(e.clientY-d.clientY)/d.renderScale;
  if(!d.moved&&Math.hypot(dx,dy)<3)return;
  if(!d.moved){remember(d.before);d.moved=true;setDragging(true);}
  if(d.mode==='resize'){
   let size=d.blockScale+(dx*b.baseWidth+dy*b.baseHeight)/(b.baseWidth*b.baseWidth+b.baseHeight*b.baseHeight);if(snap)size=Math.round(size*20)/20;resize(b,size);return;
  }
  let x=d.x+dx,y=d.y+dy;if(snap){x=Math.round(x/8)*8;y=Math.round(y/8)*8;}
  move(b,x,y);
 }
 function finish(){drag.current=null;setDragging(false);}
 function nudge(e:KeyboardEvent<HTMLButtonElement>,b:BoardBlock){
  const direction:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(e.key==='Escape'){setSelected(null);return;}
  const v=direction[e.key];if(!v||disabled)return;e.preventDefault();remember(latest.current.boardLayout??{});setSelected(b.id);const step=e.shiftKey?32:8;move(b,b.x+v[0]*step,b.y+v[1]*step);
 }
 function resizeKey(e:KeyboardEvent<HTMLButtonElement>,b:BoardBlock){
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||disabled)return;e.preventDefault();remember(latest.current.boardLayout??{});const sign=['ArrowRight','ArrowUp'].includes(e.key)?1:-1;resize(b,b.scale+sign*(e.shiftKey ? .1 : .05));
 }
 return <section className="board-layout-editor" aria-label="브랜드 보드 배치 작업판">
  <div className="board-layout-toolbar">
   <div className="board-layout-mode"><button type="button" aria-pressed={editing} onClick={()=>setEditing(true)}>배치 편집</button><button type="button" aria-pressed={!editing} onClick={()=>{setEditing(false);setSelected(null);}}>완성 모습</button></div>
   <button type="button" disabled={disabled||!history.length} onClick={()=>{const previous=history.at(-1);if(previous){onChange({...latest.current,boardLayout:previous});setHistory(h=>h.slice(0,-1));}}}>배치 되돌리기</button>
   <button type="button" disabled={disabled||!Object.keys(plan.boardLayout??{}).length} onClick={()=>{remember(plan.boardLayout??{});onChange({...latest.current,boardLayout:{}});}}>기본 배치</button>
   {editing&&<label className="board-snap"><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/>격자 맞춤</label>}
  </div>
  {editing&&<div className="board-layout-assist"><p>요소를 끌어 이동 · 모서리로 크기 조절 · 방향키로 미세 이동</p><label>이동할 요소<select aria-label="이동할 보드 요소" value={selected??''} onChange={e=>setSelected(e.target.value||null)}><option value="">요소 선택</option>{blocks.map(b=><option key={b.id} value={b.id}>{b.label}</option>)}</select></label>{active&&<span className="board-position" aria-live={dragging?'off':'polite'}>{active.label} · 가로 {Math.round(active.x)} / 세로 {Math.round(active.y)}</span>}</div>}
  {editing&&<div className="board-size-controls">{active?<><span>{active.label}</span><button type="button" aria-label="선택 요소 작게" onClick={()=>{remember(plan.boardLayout??{});resize(active,active.scale-.1);}}>−</button><label>요소 크기<input type="range" aria-label="선택 요소 크기" min="30" max={Math.round(Math.min(2,(document.width-32)/active.baseWidth)*100)} step="1" value={Math.round(active.scale*100)} onPointerDown={()=>remember(plan.boardLayout??{})} onKeyDown={e=>{if(e.key.startsWith('Arrow'))remember(plan.boardLayout??{});}} onChange={e=>resize(active,Number(e.target.value)/100)}/></label><output>{Math.round(active.scale*100)}%</output><button type="button" aria-label="선택 요소 크게" onClick={()=>{remember(plan.boardLayout??{});resize(active,active.scale+.1);}}>＋</button><span className="tiny">비율 유지</span></>:<span>요소를 선택하면 크기를 조절할 수 있습니다.</span>}</div>}
  <div className={'board-layout-canvas'+(editing?' is-editing':'')+(dragging?' is-dragging':'')} ref={canvas}>
   <div className="plan-board-image" aria-label="브랜드 보드 미리보기" dangerouslySetInnerHTML={{__html:document.svg}}/>
   {editing&&blocks.map(b=><Fragment key={b.id}><button type="button" className={'board-layout-handle'+(selected===b.id?' is-selected':'')} aria-label={b.label+' 위치 이동'} aria-pressed={selected===b.id} disabled={disabled} style={{left:b.x/document.width*100+'%',top:b.y/document.height*100+'%',width:b.width/document.width*100+'%',height:b.height/document.height*100+'%'}} onClick={()=>setSelected(b.id)} onPointerDown={e=>start(e,b)} onPointerMove={moving} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} onKeyDown={e=>nudge(e,b)}><span>{b.label}</span></button><button type="button" className="board-resize-handle" aria-label={b.label+' 크기 조절'} disabled={disabled} style={{left:(b.x+b.width)/document.width*100+'%',top:(b.y+b.height)/document.height*100+'%'}} onPointerDown={e=>start(e,b,'resize')} onPointerMove={moving} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} onKeyDown={e=>resizeKey(e,b)} onClick={()=>setSelected(b.id)}>↘</button></Fragment>)}
  </div>
  <p className="tiny">위치와 크기는 자동 저장되며 PNG·SVG에 동일하게 반영됩니다.</p>
 </section>;
}
