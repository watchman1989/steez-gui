import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [account, setAccount] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (account.trim()) {
      navigate(`/graph/${account.trim()}`);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>账户关系查询</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={account}
          onChange={e => setAccount(e.target.value)}
          placeholder="请输入账户号"
          style={{ width: 300, fontSize: 16, padding: 8 }}
        />
        <button type="submit" style={{ marginLeft: 16, fontSize: 16 }}>查询</button>
      </form>
    </div>
  );
}