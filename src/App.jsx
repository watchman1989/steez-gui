import { useState } from 'react'
import './App.css'

function App() {
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>账户转账关系查询系统</h1>
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
            ) : (
              <p>未找到相关转账记录</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
