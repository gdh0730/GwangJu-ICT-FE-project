import React from 'react';

export default function SearchBar(props: {
  placeholder: string;
  value: string;
  onChange: (v: string)=>void;
  onSubmit: ()=>void;
  rightSlot?: React.ReactNode;
}) {
  const { placeholder, value, onChange, onSubmit, rightSlot } = props;
  return (
    <div className="row">
      <div className="card" style={{flex: '1 1 420px'}}>
        <input
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==='Enter') onSubmit(); }}
        />
      </div>
      {rightSlot}
    </div>
  );
}
