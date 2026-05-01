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

function App() {
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)

  const [account, setAccount] = useState(null)

  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  const loadBlockchainData = async () => {
      setLoading(true)
      setError(null)

      try {
        //wallet provider for write transactions still function the same but go through the backend now
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        const network = await provider.getNetwork()

        //fetch properties from backend which reads totalSupplu and tokenURI from the chain and merges with off-chain metadata
        const response = await fetch(`${BACKEND_URL}/api/properties`)
        if (!response.ok) {
          const detail = await response.json().catch(() => ({}))
          throw new Error(
            detail.error || `Backend returned HTTP ${response.status}`,
          )
        }
        const properties = await response.json()
        setHomes(properties)

        //escrow contract is needed for write actions in the modal.
        const escrow = new ethers.Contract(
          config[network.chainId].escrow.address,
          Escrow,
          provider,
        )
        setEscrow(escrow)

        window.ethereum.on('accountsChanged', async () => {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          const account = ethers.utils.getAddress(accounts[0])
          setAccount(account);
        })
      } catch (err) {
        console.error('Failed to load DApp data:', err)
        setError(err.message || 'Failed to load DApp data')
      } finally {
        setLoading(false)
      }
    }


  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

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
          <p>No properties listed yet. Run the deploy script.</p>
        )}
        


        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
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
