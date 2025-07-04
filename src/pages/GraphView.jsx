import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import G6 from '@antv/g6';

// 示例数据，可替换为接口请求
const exampleData = {
  "records": [
    // ... 你的示例数据 ...
  ]
};


const fetchData = async (account) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/query_account?account=${account}&level=3`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return exampleData; // 降级到示例数据
    }
  };

function buildGraphData(records) {
  const nodes = {};
  const edges = [];
  records.forEach(r => {
    nodes[r.FromAccountNo] = { id: r.FromAccountNo, label: r.FromAccountNo };
    nodes[r.ToAccountNo] = { id: r.ToAccountNo, label: r.ToAccountNo };
    edges.push({
      source: r.FromAccountNo,
      target: r.ToAccountNo,
      label: r.Level + '级',
      transferNo: r.TransferNo,
      path: r.Path
    });
  });
  return {
    nodes: Object.values(nodes),
    edges
  };
}

export default function GraphView() {
  const ref = useRef();
  const { account } = useParams();

  useEffect(() => {
    if (!ref.current) return;
    // TODO: fetch data from backend with account
    const data = buildGraphData(exampleData.records);

    const graph = new G6.Graph({
      container: ref.current,
      width: 900,
      height: 600,
      layout: { type: 'force' },
      modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
      defaultNode: { size: 40, style: { fill: '#C6E5FF', stroke: '#5B8FF9' } },
      defaultEdge: { style: { endArrow: true, lineWidth: 2 }, labelCfg: { autoRotate: true } }
    });
    graph.data(data);
    graph.render();

    return () => graph.destroy();
  }, [account]);

  return (
    <div style={{ padding: 40 }}>
      <h2>账户 {account} 的转账关系图</h2>
      <div ref={ref}></div>
    </div>
  );
}