import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
//import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

//hybrid backend
//override via REACT_APP_BACKEND_URL when deploying.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'
const SUPPORTED_CHAIN_IDS = Object.keys(config).map((id) => parseInt(id, 10))

function App() {
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)
  const [chainId, setChainId] = useState(null)

  const [account, setAccount] = useState(null)
  const [role, setRole] = useState('Visitor')

  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const url = query.trim()
          ? `${BACKEND_URL}/api/properties/search?q=${encodeURIComponent(query.trim())}`
          : `${BACKEND_URL}/api/properties`
        const response = await fetch(url)
        if (!response.ok) {
          const detail = await response.json().catch(() => ({}))
          throw new Error(detail.error || `Backend returned HTTP ${response.status}`)
        }
        const data = await response.json()
        if (cancelled) return
        //search endpoint returns { query, count, results }, list returns array
        setHomes(Array.isArray(data) ? data : data.results)
        setError(null)
      } catch (err) {
        if (cancelled) return
        console.error('Property fetch failed:', err)
        setError(err.message || 'Failed to load properties')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 200) //debounce for better UX and to avoid spamming the backend with every keystroke
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query])
  //one-shot wallet + escrow setup, needed for write actions at home modal adn verify chain support, properties fetched separately, handled by search
  const loadBlockchainData = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        const network = await provider.getNetwork()
        setChainId(network.chainId)

        const deployment = config[network.chainId]
        if (!deployment) {
          return
        }

        const escrow = new ethers.Contract(
          deployment.escrow.address,
          Escrow,
          provider,
        )
        setEscrow(escrow)

       window.ethereum.on('accountsChanged', async () => {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(ethers.utils.getAddress(accounts[0]))
      })
      
      window.ethereum.on('chainChanged', () => window.location.reload())
    } catch (err) {
      console.error('Wallet setup failed:', err)
    }
  }
  

  useEffect(() => {
    loadBlockchainData()
  }, [])

  useEffect(() => {
    if (!escrow || !account) {
      setRole('Visitor')
      return
    }
    let cancelled = false
    ;(async ()=>{
      try {
        const [seller, inspector, lender] = await Promise.all([
          escrow.seller(),
          escrow.inspector(),
          escrow.lender(),
        ])
        if (cancelled) return
        if (account === seller) setRole('Seller')
        else if (account === inspector) setRole('Inspector')
        else if (account === lender) setRole('Lender')
        else setRole('Visitor')
      } catch (err) {
        if (!cancelled) setRole('Visitor')
      }
    })()
    return () => { cancelled = true }
  }, [escrow, account])


  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }
  const wrongNetwork = chainId !== null && !SUPPORTED_CHAIN_IDS.includes(chainId)

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} role={role} />

      {wrongNetwork && (
        <div role="alert" style={{ background: '#ffefc1', padding: '0.75em 2em' }}>
          <strong>Wrong network.</strong> This DApp is deployed on chain id{' '}
          {SUPPORTED_CHAIN_IDS.join(', ')}. You are on chain id {chainId}.
          Switch network in MetaMask.
        </div>
      )}

      <Search query={query} onQueryChange={setQuery} />

      <div className='cards__section'>

        <h3>Homes For You</h3>

        <hr />

        {loading && <p>Loading properties&hellip;</p>}

        {error && (
          <div role="alert" style={{ color: '#b00020', padding: '1em 0' }}>
            <strong>Could not load properties.</strong>
            <br />
            {error}
            <br />
            <small>
              Is the backend running? <code>cd backend &amp;&amp; npm run dev</code>
            </small>
          </div>
        )}

        {!loading && !error && homes.length === 0 && (
          <p>{query ? `No properties match "${query}".` : 'No properties listed yet. Run the deploy script.'}</p>
        )}

        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={home.onChainId ?? index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home" />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;