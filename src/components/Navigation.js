import { ethers } from 'ethers';
import logo from '../assets/logo.svg';

const Navigation = ({ account, setAccount, role }) => {
    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
    }

    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="#">Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Millow</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                {account && role && (
                    <span
                        title={`Connected wallet role: ${role}`}
                        style={{
                            padding: '0.2em 0.6em',
                            borderRadius: '999px',
                            background: '#eef',
                            fontSize: '0.85em',
                        }}
                    >
                        {role}
                    </span>
                )}
                {account ? (
                    <button type="button" className='nav__connect'>
                        {account.slice(0, 6) + '...' + account.slice(38, 42)}
                    </button>
                ) : (
                    <button type="button" className='nav__connect' onClick={connectHandler}>
                        Connect
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navigation;