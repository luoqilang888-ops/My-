/* 罗辑AI案例库 · 纯静态、无需服务器、无需API密钥。 */
(()=>{'use strict';
const DATA=Array.isArray(window.CASE_LIBRARY)?window.CASE_LIBRARY:[];
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const stat=(k,p)=>DATA.filter(x=>p(x)).length;
const evidenceShort=e=>e.startsWith('一线')?'FDE访谈':e.startsWith('政府')?'政府摘要':e.startsWith('行业协会')?'协会入选':e.startsWith('部委')?'部委名单':'参考设计';
const evidenceClass=e=>e.startsWith('一线')?'interview':e.startsWith('未交付')?'idea':'list';
const depthClass=d=>d==='深度'?'deep':d==='轻量'?'light':'';
const state={mode:'all',industry:null,q:'',depth:'all',evidence:'all',sort:'recommended',page:1,pageSize:18,savedOnly:false};
let saved=new Set();try{saved=new Set(JSON.parse(localStorage.getItem('luoji.saved.ids.v1')||'[]'))}catch{}
let toastId;
const showToast=t=>{const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastId);toastId=setTimeout(()=>el.classList.remove('show'),2600)};
function persist(){try{localStorage.setItem('luoji.saved.ids.v1',JSON.stringify([...saved]))}catch{showToast('此浏览器未启用本地保存，收藏仅在当前页面有效')}}
const iconForIndustry=i=>({"制造业":"▥","零售电商":"◫","金融财务":"▣","餐饮本地生活":"◉","政务公共服务":"▤","物流供应链":"↔","能源与矿业":"◈","医疗医药":"✚","教育培训":"□","建筑与工程":"⌗","传统服务业":"◇","跨境外贸":"↗","知识办公":"▦","软件与研发":"⌘","通信与IT":"✦","人力资源":"◌","法律专业服务":"§","内容营销":"✳","物业服务":"⌂"}[i]||'•');
function init(){
 $('case-number').textContent=stat('case',x=>x.kind==='case');
 $('solo-number').textContent=stat('solo',x=>x.kind==='case'&&x.solo);
 $('idea-number').textContent=stat('ideas',x=>x.kind==='blueprint');
 $('fde-number').textContent=stat('fde',x=>x.evidence.startsWith('一线'));
 $('stat-cases').textContent=stat('case',x=>x.kind==='case');
 $('stat-blueprints').textContent=stat('bp',x=>x.kind==='blueprint');
 $('stat-industries').textContent=new Set(DATA.map(x=>x.industry)).size;
 $('stat-interviews').textContent=stat('fde',x=>x.evidence.startsWith('一线'));
 const counts={};DATA.filter(x=>x.kind==='case').forEach(x=>{counts[x.industry]=(counts[x.industry]||0)+1});
 $('industry-nav').innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([ind,n])=>`<button class="industry-item" data-industry="${escapeHTML(ind)}"><span>${escapeHTML(iconForIndustry(ind))}&nbsp;&nbsp; ${escapeHTML(ind)}</span><b>${n}</b></button>`).join('');
 document.querySelector('.quick-category').addEventListener('click',e=>{const el=e.target.closest('[data-quick-industry]');if(!el)return;state.mode='industry';state.industry=el.dataset.quickIndustry;state.page=1;clearTextFilters();render();$('browse').scrollIntoView({behavior:'smooth'})});
 $('primary-nav').addEventListener('click',e=>{const el=e.target.closest('[data-mode]');if(!el)return;state.mode=el.dataset.mode;state.industry=null;state.page=1;clearTextFilters();render();if(innerWidth<760)hideMobile();$('browse').scrollIntoView({behavior:'smooth'})});
 $('industry-nav').addEventListener('click',e=>{const el=e.target.closest('[data-industry]');if(!el)return;state.mode='industry';state.industry=el.dataset.industry;state.page=1;clearTextFilters();render();if(innerWidth<760)hideMobile();$('browse').scrollIntoView({behavior:'smooth'})});
 $('search').addEventListener('input',e=>{state.q=e.target.value.trim();state.page=1;render()});
 $('depth-filter').addEventListener('change',e=>{state.depth=e.target.value;state.page=1;render()});
 $('evidence-filter').addEventListener('change',e=>{state.evidence=e.target.value;if(state.evidence==='未交付'){state.mode='blueprint';state.industry=null}else if(state.mode==='blueprint'&&state.evidence!=='all'){state.mode='all';state.industry=null}state.page=1;render()});
 $('sort').addEventListener('change',e=>{state.sort=e.target.value;state.page=1;render()});
 $('clear-filters').onclick=()=>{clearTextFilters();state.page=1;render()};
 $('empty-reset').onclick=()=>{state.mode='all';state.industry=null;state.savedOnly=false;clearTextFilters();render()};
 $('explore-button').onclick=()=>{$('browse').scrollIntoView({behavior:'smooth'})};
 $('starter-button').onclick=()=>{state.mode='blueprint';state.industry=null;clearTextFilters();state.page=1;render();$('browse').scrollIntoView({behavior:'smooth'})};
 $('saved-only').onclick=()=>{state.savedOnly=!state.savedOnly;state.page=1;render()};
 $('about-nav').onclick=()=>{$('method').scrollIntoView({behavior:'smooth'});hideMobile()};
 $('export-btn').onclick=downloadCSV;
 $('case-grid').addEventListener('click',e=>{const el=e.target.closest('[data-open-case]');if(el)openCase(el.dataset.openCase)});
 $('overlay-bg').onclick=closeCase;
 $('mobile-menu').onclick=()=>{const open=!$('sidebar').classList.contains('open');$('sidebar').classList.toggle('open',open);$('mobile-backdrop').hidden=!open};
 $('mobile-backdrop').onclick=hideMobile;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCase();hideMobile()}if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'&&!$('overlay').hidden){return}if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'){e.preventDefault();$('search').focus()}});
 window.addEventListener('hashchange',()=>{const match=location.hash.match(/^#case=(.+)$/);if(match){openCase(decodeURIComponent(match[1]),true)}else if(!$('overlay').hidden){closeCase(true)}});
 const match=location.hash.match(/^#case=(.+)$/);if(match){openCase(decodeURIComponent(match[1]),true)}
 render();
}
function hideMobile(){$('sidebar').classList.remove('open');$('mobile-backdrop').hidden=true}
function clearTextFilters(){state.q='';state.depth='all';state.evidence='all';$('search').value='';$('depth-filter').value='all';$('evidence-filter').value='all'}
function getFiltered(){
 let a=DATA.filter(c=>state.mode==='all'?c.kind==='case':state.mode==='solo'?c.kind==='case'&&c.solo:state.mode==='blueprint'?c.kind==='blueprint':state.mode==='fde'?c.evidence.startsWith('一线'):c.kind==='case'&&c.industry===state.industry);
 if(state.depth!=='all')a=a.filter(c=>c.depth===state.depth);
 if(state.evidence!=='all')a=a.filter(c=>c.evidence.startsWith(state.evidence));
 if(state.savedOnly)a=a.filter(c=>saved.has(c.id));
 if(state.q){const query=state.q.toLocaleLowerCase('zh-CN');const words=query.split(/\s+/).filter(Boolean);a=a.filter(c=>words.every(w=>c.searchText.toLocaleLowerCase('zh-CN').includes(w)))}
 const r={深度:3,标准:2,轻量:1};
 if(state.sort==='industry')a.sort((x,y)=>x.industry.localeCompare(y.industry,'zh-CN'));
 else if(state.sort==='depth')a.sort((x,y)=>r[y.depth]-r[x.depth]);
 else {const weight=e=>e.startsWith('一线')?5:e.startsWith('政府')?4:e.startsWith('行业协会')?2:e.startsWith('部委')?1:3;a.sort((x,y)=>weight(y.evidence)-weight(x.evidence)||Number(y.solo)-Number(x.solo))}
 return a;
}
function render(){
 const heads={all:['探索案例库','涵盖大型企业和中小商家，附行业分类、交付拆解与原始资料。'],solo:['个人开发者可借鉴','从公开项目中筛出的部分可借鉴案例，建议先做低风险的子流程。'],blueprint:['普通人接单方案','60种小项目的试点交付方案、技术组合与客户价值，尚非真实成交案例。'],fde:['FDE 现场拆解','来自一线项目的业务问题、实施过程和技术方向，可按原文进一步研究。'],industry:[state.industry+' · 行业案例','按真实企业项目整理，详情包含可借鉴的工作流和组件。']};
 $('library-heading').textContent=heads[state.mode][0];$('library-subheading').textContent=heads[state.mode][1];
 document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('is-active',x.dataset.mode===state.mode));
 document.querySelectorAll('.industry-item').forEach(x=>x.classList.toggle('active',state.mode==='industry'&&x.dataset.industry===state.industry));
 $('saved-only').classList.toggle('active',state.savedOnly);$('saved-only').setAttribute('aria-pressed',String(state.savedOnly));$('saved-only').textContent=state.savedOnly?'★ 已收藏':'☆ 仅看收藏';
 const rows=getFiltered();const pages=Math.ceil(rows.length/state.pageSize)||1;state.page=Math.min(state.page,pages);
 const chunk=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
 $('result-count').textContent=`找到 ${rows.length} 条${state.mode==='blueprint'?'参考方案':'案例'} · 当前第 ${state.page} / ${pages} 页`;
 $('empty-state').hidden=rows.length!==0;
 $('case-grid').innerHTML=chunk.map(cardHTML).join('');
 $('pagination').innerHTML=pages<=1?'':`<button data-page="prev" ${state.page===1?'disabled':''}>← 上一页</button><span>${state.page} / ${pages}</span><button data-page="next" ${state.page===pages?'disabled':''}>下一页 →</button>`;
 $('pagination').onclick=e=>{const button=e.target.closest('[data-page]');if(!button)return;state.page+=button.dataset.page==='next'?1:-1;render();$('browse').scrollIntoView({behavior:'smooth'})};
}
function cardHTML(c){
 const isIdea=c.kind==='blueprint';
 const listOnly=c.evidence.startsWith('部委')||c.evidence.startsWith('行业协会');
 const summary=isIdea?(c.deliverable||c.action):listOnly?('主要方向：'+(c.sourceSection||c.industry)+'。查看业务场景、参考实施路径及可用技术组合。'):c.action;
 const showTags=(c.techObserved||[]).length?c.techObserved:(c.techSuggested||[]);
 const tagPrefix=(c.techObserved||[]).length?'':'建议：';
 const label=isIdea?'技术参考':(c.evidence.startsWith('一线')?'原始访谈':'原始来源');
 return `<article class="case-card ${isIdea?'idea-card':''}"><button class="card-click" data-open-case="${escapeHTML(c.id)}" aria-label="查看${escapeHTML(c.title)}详细拆解"><div class="card-top"><span class="industry-label">${escapeHTML(c.industry)}</span><span class="card-id">${escapeHTML(c.id.replace(/^IDEA/, 'LAB'))}</span></div><h3 class="card-title">${escapeHTML(c.title)}</h3><div class="card-company">${escapeHTML(c.company)}</div><p class="card-summary">${escapeHTML(summary)}</p><div class="tag-row">${showTags.slice(0,3).map((t,i)=>`<span class="tag">${i===0?escapeHTML(tagPrefix):''}${escapeHTML(t)}</span>`).join('')}</div></button><div class="card-bottom"><div class="badges"><span class="depth-pill ${depthClass(c.depth)}">${escapeHTML(c.depth)}项目</span><span class="evidence-pill ${evidenceClass(c.evidence)}">${escapeHTML(evidenceShort(c.evidence))}</span></div><div class="card-actions"><a href="${escapeHTML(c.source)}" target="_blank" rel="noopener noreferrer" aria-label="查看${escapeHTML(c.title)}的${label}" title="${label}">来源 ↗</a><button class="card-open" data-open-case="${escapeHTML(c.id)}">查看拆解 →</button></div></div></article>`;
}
function openCase(id,skipHistory=false){const c=DATA.find(c=>c.id===id);if(!c)return;const verified=c.kind==='case';const isIdea=c.kind==='blueprint';const isFDE=c.evidence.startsWith('一线');const lists=c.evidence.startsWith('行业协会')||c.evidence.startsWith('部委');
 const srcLabel=c.kind==='blueprint'?'阅读方案方法论参考':c.sourceName;
 const showObSteps=c.workflowObserved.length>0;
 $('detail-body').innerHTML=`<div class="detail-head"><div class="detail-toprow"><span>FIELD NOTE / ${escapeHTML(c.id)} ${c.solo?'· 可供个人借鉴':''}</span><button class="close-btn" id="close-detail" aria-label="关闭详情">×</button></div><h2 id="detail-title">${escapeHTML(c.title)}</h2><div class="detail-client">${escapeHTML(c.company)}</div><div class="detail-chips"><span>${escapeHTML(c.industry)}</span><span>${escapeHTML(c.depth)}项目</span><span>${escapeHTML(evidenceShort(c.evidence))}</span><span>${escapeHTML(c.year)}</span></div></div>
 <div class="detail-body"><div class="detail-intro ${!isFDE?'uncertain':''}"><strong>证据边界 · </strong>${escapeHTML(c.kind==='blueprint'?'这是一份针对中国市场的参考实施蓝图，尚无对应客户合同、上线与验收材料。':isFDE?'依据一线FDE项目访谈归纳。实施数据来自受访者自述，并非独立第三方审计；实际技术版本请查看原文。':lists?'目前仅有官方或行业协会入选名单，未披露完整项目交付记录。不能把下方推演路径当成企业实际方案。':'依据政府案例展示中企业申报的摘要；部分指标为申报单位提供，未见独立审计。')}</div>
 ${sectionTitle('01','业务问题')}<div class="detail-fact"><strong>改造前的卡点</strong><p>${escapeHTML(c.pain)}</p></div>
 ${sectionTitle('02','公开做法 / 项目设计')}<p>${escapeHTML(c.action)}</p>
 ${sectionTitle('03','效果与证据')}<div class="detail-fact"><strong>${verified?'来源披露情况':'项目状态'}</strong><p>${escapeHTML(c.result)}</p></div>
 ${showObSteps?`${sectionTitle('04',c.kind==='blueprint'?'轻量试点步骤 · 参考设计':'FDE实施步骤 · 访谈还原')}<div class="subhint">${escapeHTML(c.workflowDisclosure)}</div><ol class="workflow">${c.workflowObserved.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol>`:''}
 ${sectionTitle(showObSteps?'05':'04',showObSteps?'你可以怎样复用':'FDE实施路径 · 编辑推演')}<div class="subhint">${escapeHTML(showObSteps?'下面是为学习者整理的通用复用路径，并非本案例所有现场细节。':c.workflowDisclosure)}</div><ol class="workflow">${c.workflowSuggested.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol>
 ${sectionTitle(showObSteps?'06':'05',c.kind==='blueprint'?'候选技术与工具':'公开技术方向')}<p class="subhint">${escapeHTML(c.techDisclosure)}</p><div class="tech-wrap">${c.techObserved.map(x=>`<span>${escapeHTML(x)}</span>`).join('')||'公开资料没有披露具体技术栈'}</div>
 ${sectionTitle(showObSteps?'07':'06','个人开发者可参考的技术组合')}<div class="subhint">推荐选项，不代表客户实际使用这些工具。</div><div class="tech-wrap reference">${c.techSuggested.map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div>
 ${isIdea?`${sectionTitle('◆','适合怎样接单')}<div class="detail-fact"><strong>建议客户与交付内容</strong><p>${escapeHTML(c.clientProfile||c.company)} · ${escapeHTML(c.deliverable||c.action)}</p></div><div class="detail-fact" style="margin-top:8px"><strong>最小试点 / 商业建议</strong><p>${escapeHTML(c.trialScope||'一个业务环节')}。${escapeHTML(c.commercialApproach||'先做低成本试点，再按真实交付工作量报价。')}</p></div>`:''}
 ${sectionTitle(showObSteps?'08':'07','如何验收与避坑')}<div class="detail-two"><div class="detail-fact"><strong>应该记录的指标</strong><p>${escapeHTML(c.target)}</p></div><div class="detail-fact"><strong>主要风险 / 人工边界</strong><p>${escapeHTML(c.risk)}</p></div></div>
 </div><div class="detail-bottom">${sectionTitle('↗','原始材料与出处')}<p style="font-size:11px;color:#83939b;margin:0 0 12px;line-height:1.85">${escapeHTML(c.sourceGeography)}。${c.kind==='blueprint'?'以下是方法论参考，不是此方案的成交报道。':'如来源是集合名单，打开后请在页面内搜索案例名称。'}</p><a class="source-link" href="${escapeHTML(c.source)}" target="_blank" rel="noopener noreferrer">${escapeHTML(srcLabel)}<span>↗</span></a>${c.secondarySource?`<a class="source-link" style="margin-top:9px" href="${escapeHTML(c.secondarySource)}" target="_blank" rel="noopener noreferrer">${c.kind==='blueprint'?'了解Datawhale的FDE案例计划':'查看延伸解读 / 名单整理'} <span>↗</span></a>`:''}<div class="detail-link-actions"><button id="copy-case">复制案例链接</button><button id="save-case">${saved.has(c.id)?'★ 取消收藏':'☆ 收藏案例'}</button><button id="copy-summary">复制案例摘要</button></div><p class="detail-disclaimer">公开资料用于学习交流，参考技术及推演流程不代表项目实际选型。</p></div>`;
 $('overlay').hidden=false;document.body.style.overflow='hidden';$('detail-panel').scrollTop=0;$('detail-panel').focus();
 $('close-detail').onclick=()=>closeCase();
 $('copy-case').onclick=()=>copyText(location.origin+location.pathname+'#case='+encodeURIComponent(c.id),'链接已复制');
 $('copy-summary').onclick=()=>copyText(`${c.title}\n行业：${c.industry}\n业务痛点：${c.pain}\n做法：${c.action}\n公开结果：${c.result}\n原文：${c.source}\n资料属性：${c.evidence}`,'摘要已复制');
 $('save-case').onclick=()=>{if(saved.has(c.id))saved.delete(c.id);else saved.add(c.id);persist();$('save-case').textContent=saved.has(c.id)?'★ 取消收藏':'☆ 收藏案例';if(state.savedOnly)render();showToast(saved.has(c.id)?'已收藏到此浏览器':'已取消收藏')};
 if(!skipHistory&&location.hash!=='#case='+c.id)history.pushState(null,'','#case='+encodeURIComponent(c.id));
}
function closeCase(skipHistory=false){if($('overlay').hidden)return;$('overlay').hidden=true;document.body.style.overflow='';if(!skipHistory&&location.hash.startsWith('#case=')){try{history.replaceState(null,'',location.pathname+location.search||'#')}catch{location.hash=''}}}
function sectionTitle(k,t){return `<h3 class="detail-title"><span>${k}</span> ${escapeHTML(t)}</h3>`}
async function copyText(txt,message){try{await navigator.clipboard.writeText(txt);showToast(message)}catch{const el=document.createElement('textarea');el.value=txt;document.body.appendChild(el);el.select();try{document.execCommand('copy');showToast(message)}catch{showToast('复制失败，请手动选择文本')}el.remove()}}
function downloadCSV(){const rows=getFiltered();if(!rows.length){showToast('没有可导出的记录');return}const fields=[['案例ID','id'],['案例名称','title'],['企业或主体','company'],['行业','industry'],['规模','depth'],['类型','kind'],['证据类型','evidence'],['问题','pain'],['做法','action'],['公开结果','result'],['公开技术方向','techObserved'],['原始材料','source']];const format=v=>'"'+String(Array.isArray(v)?v.join('；'):v??'').replace(/"/g,'""')+'"';const csv='\ufeff'+fields.map(f=>format(f[0])).join(',')+'\n'+rows.map(c=>fields.map(f=>format(c[f[1]])).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`luoji-ai-case-library-${state.mode}-20261117.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);showToast(`已导出 ${rows.length} 条记录`)}
if(DATA.length)init();else document.querySelector('#case-grid').textContent='数据文件未加载，请确认 data.js 与 index.html 位于同一目录。';
})();

