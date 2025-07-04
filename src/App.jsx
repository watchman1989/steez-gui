import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'

// 简单的SVG关系图组件
function SimpleTransferGraph({ data, account }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] })

  useEffect(() => {
    if (!data || !data.records) return

    // 构建图数据
    const nodesMap = new Map()
    const edges = []
    const processedEdges = new Set()

    // 添加起始节点
    if (account) {
      nodesMap.set(account, {
        id: account,
        label: account.substring(0, 8) + '...',
        fullLabel: account,
        level: 0,
        type: 'root'
      })
    }

    // 处理所有记录
    data.records.forEach((record) => {
      const fromAccount = record.FromAccountNo
      const toAccount = record.ToAccountNo
      const level = record.Level

      // 添加节点
      if (!nodesMap.has(fromAccount)) {
        nodesMap.set(fromAccount, {
          id: fromAccount,
          label: fromAccount.substring(0, 8) + '...',
          fullLabel: fromAccount,
          level: level - 1,
          type: level === 1 ? 'first' : 'normal'
        })
      }

      if (!nodesMap.has(toAccount)) {
        nodesMap.set(toAccount, {
          id: toAccount,
          label: toAccount.substring(0, 8) + '...',
          fullLabel: toAccount,
          level: level,
          type: level === 1 ? 'first' : 'normal'
        })
      }

      // 添加边
      const edgeKey = `${fromAccount}-${toAccount}`
      if (!processedEdges.has(edgeKey)) {
        edges.push({
          source: fromAccount,
          target: toAccount,
          level: level
        })
        processedEdges.add(edgeKey)
      }
    })

    setGraphData({
      nodes: Array.from(nodesMap.values()),
      edges: edges
    })
  }, [data, account])

  if (graphData.nodes.length === 0) {
    return <div>正在生成关系图...</div>
  }

  // 简单的布局计算
  const nodeRadius = 25
  const nodeSpacing = 80
  const levelSpacing = 120
  const svgWidth = 800
  const svgHeight = 600

  // 按层级分组节点
  const nodesByLevel = {}
  graphData.nodes.forEach(node => {
    if (!nodesByLevel[node.level]) {
      nodesByLevel[node.level] = []
    }
    nodesByLevel[node.level].push(node)
  })

  // 计算节点位置
  const nodePositions = {}
  Object.keys(nodesByLevel).forEach(level => {
    const nodes = nodesByLevel[level]
    const levelNum = parseInt(level)
    const y = 100 + levelNum * levelSpacing
    
    nodes.forEach((node, index) => {
      const x = 100 + index * nodeSpacing
      nodePositions[node.id] = { x, y }
    })
  })

  // 获取节点颜色
  const getNodeColor = (node) => {
    if (node.type === 'root') return '#ff4d4f'
    if (node.type === 'first') return '#ffd666'
    if (node.level === 2) return '#b7eb8f'
    if (node.level === 3) return '#d3adf7'
    return '#C6E5FF'
  }

  // 获取边颜色
  const getEdgeColor = (level) => {
    if (level === 1) return '#ff7a45'
    if (level === 2) return '#52c41a'
    if (level === 3) return '#722ed1'
    return '#91d5ff'
  }

  return (
    <div className="simple-graph-container">
      <h3>转账关系图</h3>
      <div className="graph-legend">
        <div className="legend-item">
          <span className="legend-color root"></span>
          <span>查询账户</span>
        </div>
        <div className="legend-item">
          <span className="legend-color first"></span>
          <span>一级关系</span>
        </div>
        <div className="legend-item">
          <span className="legend-color second"></span>
          <span>二级关系</span>
        </div>
        <div className="legend-item">
          <span className="legend-color third"></span>
          <span>三级关系</span>
        </div>
      </div>
      
      <div className="svg-container">
        <svg width={svgWidth} height={svgHeight} className="transfer-graph-svg">
          {/* 绘制边 */}
          {graphData.edges.map((edge, index) => {
            const sourcePos = nodePositions[edge.source]
            const targetPos = nodePositions[edge.target]
            
            if (!sourcePos || !targetPos) return null
            
            return (
              <g key={`edge-${index}`}>
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={getEdgeColor(edge.level)}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(sourcePos.x + targetPos.x) / 2}
                  y={(sourcePos.y + targetPos.y) / 2 - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={getEdgeColor(edge.level)}
                  fontWeight="bold"
                >
                  L{edge.level}
                </text>
              </g>
            )
          })}
          
          {/* 绘制节点 */}
          {graphData.nodes.map((node) => {
            const pos = nodePositions[node.id]
            if (!pos) return null
            
            return (
              <g key={node.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={getNodeColor(node)}
                  stroke="#333"
                  strokeWidth="2"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#333"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
                <title>{node.fullLabel}</title>
              </g>
            )
          })}
          
          {/* 箭头标记 */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#666"
              />
            </marker>
          </defs>
        </svg>
      </div>
      
      <div className="graph-info">
        <p>总节点数: {graphData.nodes.length}</p>
        <p>总边数: {graphData.edges.length}</p>
      </div>
    </div>
  )
}

// 主页组件 - 数据列表展示
function HomePage() {
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!account.trim()) {
      alert('请输入账户号')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(`/api/query_account?account=${account.trim()}&level=3`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API返回数据:', result)
      setData(result)
    } catch (err) {
      console.error('查询失败:', err)
      setError(err.message || '查询失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleViewGraph = () => {
    if (data && data.records) {
      // 将数据存储到 localStorage，供关系图页面使用
      localStorage.setItem('transferData', JSON.stringify(data))
      localStorage.setItem('queryAccount', account)
      navigate('/graph')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>steez search system</h1>
      </header>
      
      <main className="app-main">
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入要查询的账户号"
              className="search-input"
              disabled={loading}
            />
            <button 
              onClick={handleSearch}
              className="search-button"
              disabled={loading}
            >
              {loading ? '查询中...' : '查询'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>错误: {error}</p>
          </div>
        )}

        {data && (
          <div className="result-container">
            <h2>查询结果</h2>
            <div className="result-summary">
              <p>查询账户: <strong>{account}</strong></p>
              <p>总记录数: <strong>{data.records?.length || 0}</strong></p>
            </div>
            
            {data.records && data.records.length > 0 ? (
              <>
                {/* 跳转按钮 */}
                <div className="action-buttons">
                  <button 
                    onClick={handleViewGraph}
                    className="view-graph-btn"
                  >
                    📊 查看转账关系图
                  </button>
                </div>
                
                <div className="records-list">
                  <h3>转账记录详情:</h3>
                  <div className="records-table">
                    <table>
                      <thead>
                        <tr>
                          <th>层级</th>
                          <th>转出账户</th>
                          <th>转入账户</th>
                          <th>转账流水号</th>
                          <th>转账路径</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.records.map((record, index) => (
                          <tr key={index}>
                            <td>{record.Level}</td>
                            <td>{record.FromAccountNo}</td>
                            <td>{record.ToAccountNo}</td>
                            <td className="transfer-no">{record.TransferNo}</td>
                            <td className="path">{record.Path}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p>未找到相关转账记录</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// 关系图页面组件
function GraphPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [account, setAccount] = useState('')

  // 从 localStorage 获取数据
  useEffect(() => {
    const savedData = localStorage.getItem('transferData')
    const savedAccount = localStorage.getItem('queryAccount')
    
    if (savedData && savedAccount) {
      setData(JSON.parse(savedData))
      setAccount(savedAccount)
    } else {
      // 如果没有数据，跳转回主页
      navigate('/')
    }
  }, [navigate])

  const handleBackToList = () => {
    navigate('/')
  }

  if (!data || !account) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>转账关系图</h1>
        <button onClick={handleBackToList} className="back-btn">
          ← 返回列表
        </button>
      </header>
      
      <main className="app-main">
        <div className="graph-page-container">
          <div className="graph-summary">
            <p>查询账户: <strong>{account}</strong></p>
            <p>总记录数: <strong>{data.records?.length || 0}</strong></p>
          </div>
          
          {/* 简单SVG关系图组件 */}
          <SimpleTransferGraph data={data} account={account} />
        </div>
      </main>
    </div>
  )
}

// 主应用组件
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/graph" element={<GraphPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
