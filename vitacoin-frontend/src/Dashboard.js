import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config';
import './Dashboard.css';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rewardConfigs, setRewardConfigs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, transactionsRes, configsRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/users`),
        axios.get(`${config.API_BASE_URL}/api/transactions`),
        axios.get(`${config.API_BASE_URL}/api/reward-configs`)
      ]);
      
      setUsers(usersRes.data);
      setTransactions(transactionsRes.data);
      setRewardConfigs(configsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Vitacoin Admin Dashboard</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={activeTab === 'transactions' ? 'active' : ''} 
          onClick={() => setActiveTab('transactions')}
        >
          Transactions ({transactions.length})
        </button>
        <button 
          className={activeTab === 'config' ? 'active' : ''} 
          onClick={() => setActiveTab('config')}
        >
          Reward Config ({rewardConfigs.length})
        </button>
        <button 
          className={activeTab === 'demo' ? 'active' : ''} 
          onClick={() => setActiveTab('demo')}
        >
          Live Demo
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' && <UsersTab users={users} fetchData={fetchData} />}
        {activeTab === 'transactions' && <TransactionsTab transactions={transactions} fetchData={fetchData} />}
        {activeTab === 'config' && <ConfigTab configs={rewardConfigs} fetchData={fetchData} />}
        {activeTab === 'demo' && <DemoTab fetchData={fetchData} />}
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ users, fetchData }) {
  const [newUser, setNewUser] = useState({ username: '', email: '' });

  const createUser = async () => {
    try {
      if (!newUser.username || !newUser.email) {
        alert('Please enter both username and email');
        return;
      }

      await axios.post(`${config.API_BASE_URL}/api/users`, newUser);
      setNewUser({ username: '', email: '' });
      fetchData();
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>Users Management</h2>
      
      <div className="create-user">
        <h3>Add New User</h3>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
        />
        <button onClick={createUser}>Add User</button>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <p>No users found. Add some users to get started!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Coins</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.coins}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Transactions Tab Component
function TransactionsTab({ transactions, fetchData }) {
  const [users, setUsers] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    userId: '',
    type: 'reward',
    amount: '',
    description: ''
  });

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const createTransaction = async () => {
    try {
      console.log('Creating transaction with:', newTransaction);
      
      // Validation
      if (!newTransaction.userId || !newTransaction.amount) {
        alert('Please select a user and enter an amount');
        return;
      }

      await axios.post(`${config.API_BASE_URL}/api/transactions`, {
        userId: newTransaction.userId,
        type: newTransaction.type,
        amount: parseInt(newTransaction.amount),
        description: newTransaction.description || `${newTransaction.type} transaction`
      });
      
      setNewTransaction({ userId: '', type: 'reward', amount: '', description: '' });
      fetchData();
      alert('Transaction created successfully!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error creating transaction: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>Transaction Ledger</h2>
      
      <div className="create-transaction">
        <h3>Add New Transaction</h3>
        
        <select
          value={newTransaction.userId}
          onChange={(e) => setNewTransaction({...newTransaction, userId: e.target.value})}
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>
        
        <select
          value={newTransaction.type}
          onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
        >
          <option value="reward">Reward</option>
          <option value="penalty">Penalty</option>
        </select>
        
        <input
          type="number"
          placeholder="Amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="Description (optional)"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
        />
        
        <button onClick={createTransaction}>Add Transaction</button>
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction._id} className={transaction.type}>
                  <td>{transaction.userId?.username || 'Unknown User'}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.description}</td>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Config Tab Component
function ConfigTab({ configs, fetchData }) {
  const [newConfig, setNewConfig] = useState({
    activityType: '',
    rewardValue: '',
    penaltyValue: ''
  });

  const createOrUpdateConfig = async () => {
    try {
      if (!newConfig.activityType || !newConfig.rewardValue || !newConfig.penaltyValue) {
        alert('Please fill in all fields');
        return;
      }

      await axios.put(
        `${config.API_BASE_URL}/api/reward-configs/${newConfig.activityType}`,
        {
          rewardValue: parseInt(newConfig.rewardValue),
          penaltyValue: parseInt(newConfig.penaltyValue)
        }
      );
      setNewConfig({ activityType: '', rewardValue: '', penaltyValue: '' });
      fetchData();
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Error updating config: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>Reward & Penalty Configuration</h2>
      
      <div className="create-config">
        <h3>Add/Update Activity Config</h3>
        <input
          type="text"
          placeholder="Activity Type (e.g., login, quiz_complete)"
          value={newConfig.activityType}
          onChange={(e) => setNewConfig({...newConfig, activityType: e.target.value})}
        />
        <input
          type="number"
          placeholder="Reward Value"
          value={newConfig.rewardValue}
          onChange={(e) => setNewConfig({...newConfig, rewardValue: e.target.value})}
        />
        <input
          type="number"
          placeholder="Penalty Value"
          value={newConfig.penaltyValue}
          onChange={(e) => setNewConfig({...newConfig, penaltyValue: e.target.value})}
        />
        <button onClick={createOrUpdateConfig}>Save Config</button>
      </div>

      <div className="configs-list">
        {configs.length === 0 ? (
          <p>No reward configurations found. Add some activities!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Activity Type</th>
                <th>Reward Value</th>
                <th>Penalty Value</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(config => (
                <tr key={config._id}>
                  <td>{config.activityType}</td>
                  <td>{config.rewardValue}</td>
                  <td>{config.penaltyValue}</td>
                  <td>{new Date(config.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Demo Tab Component
function DemoTab({ fetchData }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoStats, setDemoStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [simulationInterval, setSimulationInterval] = useState(null);

  const initializeDemo = async () => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/demo/initialize`);
      alert('Demo data initialized! ' + response.data.message);
      fetchData();
      fetchDemoStats();
    } catch (error) {
      alert('Error initializing demo: ' + error.response?.data?.error);
    }
  };

  const fetchDemoStats = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/demo/stats`);
      setDemoStats(response.data);
      setRecentActivity(response.data.recentActivity || []);
    } catch (error) {
      console.error('Error fetching demo stats:', error);
    }
  };

  const simulateActivity = async () => {
    try {
      await axios.post(`${config.API_BASE_URL}/api/demo/simulate-activity`);
      fetchData();
      fetchDemoStats();
    } catch (error) {
      console.error('Error simulating activity:', error);
    }
  };

  const simulatePurchase = async () => {
    try {
      await axios.post(`${config.API_BASE_URL}/api/demo/simulate-purchase`);
      fetchData();
      fetchDemoStats();
    } catch (error) {
      console.error('Error simulating purchase:', error);
    }
  };

  const startAutoSimulation = () => {
    if (isSimulating) {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
      setIsSimulating(false);
    } else {
      const interval = setInterval(() => {
        if (Math.random() > 0.3) {
          simulateActivity();
        } else {
          simulatePurchase();
        }
      }, 2000); // Every 2 seconds
      
      setSimulationInterval(interval);
      setIsSimulating(true);
    }
  };

  useEffect(() => {
    fetchDemoStats();
    
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  return (
    <div>
      <h2>Live Demo Simulation</h2>
      
      <div className="demo-controls" style={{marginBottom: '30px'}}>
        <button onClick={initializeDemo} style={{marginRight: '10px'}}>
          Initialize Demo Data
        </button>
        <button onClick={simulateActivity} style={{marginRight: '10px'}}>
          Simulate Activity
        </button>
        <button onClick={simulatePurchase} style={{marginRight: '10px'}}>
          Simulate Purchase
        </button>
        <button 
          onClick={startAutoSimulation}
          style={{
            backgroundColor: isSimulating ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px'
          }}
        >
          {isSimulating ? 'Stop Auto-Simulation' : 'Start Auto-Simulation'}
        </button>
      </div>

      {demoStats && (
        <div className="demo-stats" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div>
            <h3>Real-Time Statistics</h3>
            <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '5px'}}>
              <p><strong>Active Users:</strong> {demoStats.totalUsers}</p>
              <p><strong>Total Transactions:</strong> {demoStats.totalTransactions}</p>
              <p><strong>Coins in Circulation:</strong> {demoStats.totalCoinsInCirculation}</p>
            </div>

            <h4>Top Users</h4>
            {demoStats.topUsers?.map((user, index) => (
              <div key={user._id} style={{padding: '5px', background: index === 0 ? '#fff3cd' : 'transparent'}}>
                {index + 1}. {user.username} - {user.coins} coins
              </div>
            ))}
          </div>

          <div>
            <h3>Recent Activity</h3>
            <div style={{maxHeight: '300px', overflowY: 'auto'}}>
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity._id} 
                  style={{
                    padding: '8px',
                    margin: '5px 0',
                    background: activity.type === 'reward' ? '#d4edda' : '#f8d7da',
                    borderRadius: '3px',
                    fontSize: '14px'
                  }}
                >
                  <strong>{activity.userId?.username}</strong> - {activity.description} 
                  <span style={{float: 'right'}}>
                    {activity.type === 'reward' ? '+' : '-'}{activity.amount} coins
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;