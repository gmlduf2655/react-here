import { useEffect, useRef } from "react";
import MindElixir from "mind-elixir";
//import "mind-elixir/dist/MindElixir.css";

export default function MindMap({ data }) {
  const ref = useRef(null);
  const mindRef = useRef(null);
    console.log("data =", data);
    console.log("data.nodeData =", data?.nodeData);
    console.log("typeof data =", typeof data);
  useEffect(() => {
    if (!ref.current || !data || mindRef.current) return;

    mindRef.current = new MindElixir({
      el: ref.current,
      direction: MindElixir.RIGHT,
      draggable: true,
      contextMenu: true,
      toolBar: true,
      nodeMenu: true,
      keypress: true,
    });
    console.log("데이터 :", data);
    console.log("MindElixir 인스턴스:", mindRef.current);
    mindRef.current.init(data);

    // 노드 클릭 이벤트
    mindRef.current.bus.addListener("selectNode", (node) => {
      console.log("선택한 노드:", node);
    });

    //return () => mind.destroy();
  }, [data]);

  return <div ref={ref} style={{ height: "600px" }} />;
}