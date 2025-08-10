
export default function Header({ onToggleTheme }: { onToggleTheme: () => void }) {
  return (
    <div className="header container">
      <div className="brand">Multi-API Dashboard</div>
      <div className="controls">
        <button className="btn ghost" onClick={onToggleTheme}>테마 전환</button>
        <a className="btn primary" href="https://github.com" target="_blank">Github</a>
      </div>
    </div>
  );
}
