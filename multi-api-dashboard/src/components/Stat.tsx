import React from 'react';
export default function Stat({k,v}:{k:string; v:React.ReactNode}) {
  return <div className="stat"><div className="k">{k}</div><div className="v">{v}</div></div>;
}
