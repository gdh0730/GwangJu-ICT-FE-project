
type TabKey = 'github' | 'weather' | 'news';
export default function Tabs({ active, onChange }:{
  active: TabKey; onChange: (k: TabKey)=>void
}) {
  return (
    <div className="container">
      <div className="tabbar">
        <div className={`tab ${active==='github'?'active':''}`} onClick={()=>onChange('github')}>GitHub</div>
        <div className={`tab ${active==='weather'?'active':''}`} onClick={()=>onChange('weather')}>Weather</div>
        <div className={`tab ${active==='news'?'active':''}`} onClick={()=>onChange('news')}>News</div>
      </div>
    </div>
  );
}
