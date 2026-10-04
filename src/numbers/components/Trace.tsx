
import { useEffect, useRef } from "react";
import { fmt } from "../lib/arabic";
// لوحة تتبع الرقم: تعمل بالماوس واللمس (Pointer Events)
export default function Trace({ n }: { n: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const draw = () => { const c = ref.current!, x = c.getContext("2d")!; x.clearRect(0, 0, c.width, c.height);
    x.font = "bold 220px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.setLineDash([8, 8]); x.strokeStyle = "#bbb"; x.lineWidth = 3; x.strokeText(fmt(n), c.width / 2, c.height / 2); x.setLineDash([]); };
  useEffect(draw, [n]);
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (e.buttons !== 1) return; const c = ref.current!, b = c.getBoundingClientRect(), x = c.getContext("2d")!;
    x.fillStyle = "#9b8cff"; x.beginPath(); x.arc((e.clientX - b.left) * (c.width / b.width), (e.clientY - b.top) * (c.height / b.height), 9, 0, 7); x.fill(); };
  return (<div className="text-center"><canvas ref={ref} width={300} height={300} onPointerMove={move} style={{ touchAction: "none" }} className="mx-auto rounded-2xl bg-white shadow" />
    <button className="btn mt-2 bg-candy text-white" onClick={draw}>🔄 حاول مرة أخرى</button></div>);
}
