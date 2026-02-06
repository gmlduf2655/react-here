import { useEffect, useRef, forwardRef, useImperativeHandle  } from "react";
import MindElixir from "mind-elixir";
//import "mind-elixir/dist/MindElixir.css";

export default forwardRef(({ data }, ref) => {
  const containerRef = useRef(null);
  const mindRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || mindRef.current) return;

    mindRef.current = new MindElixir({
      el: containerRef.current,
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

    // 부모에게 노출할 메서드 정의
    useImperativeHandle(ref, () => ({
      setData: (newData) => {
        if (mindRef.current) {
          mindRef.current.init(newData);
          mindRef.current.refresh();
        }
      },
    }));    


  return <div ref={containerRef} style={{ height: "600px" }} />;
});