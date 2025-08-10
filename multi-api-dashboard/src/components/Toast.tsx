export default function Toast({message, type}:{message:string; type?:'error'}) {
  return <div className={`toast ${type?'error':''} show`}>{message}</div>;
}
