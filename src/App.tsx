import "./App.css";
import { useState } from "react";

import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import Dashboard from "./components/Dashboard";
import ReactGA from 'react-ga';
ReactGA.initialize("UA-50602512-3");
ReactGA.pageview(window.location.pathname);

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
  ],
});

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export const Wallet = () => {
  const [externalWallet, setExternalWallet] = useState("");
  let extWallet = "";
  const {
    chainId,
    account,
    activate,
    active,
    deactivate,
  } = useWeb3React<Web3Provider>();

  const onClick = () => {
    activate(injectedConnector);
    ReactGA.event({
      category: "Query",
      action: "User connected metamask",
    });
  };

  const onChange = (e: any) => {
    extWallet+=e.target.value;
  };

  const setWallet = () => {
    setExternalWallet(extWallet)
    extWallet = "";
    ReactGA.event({
      category: "Query",
      action: "User checked for external wallet",
    });
  };

  return (
    <div>
      <section className="section">
        <div className="container">
          {active ? (
            <div>
              <h1 className="title">
                <div>
                  ✅ Metamask Connected : {chainId}
                  <button
                    className="button is-danger ml-4"
                    onClick={() => {
                      deactivate();
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </h1>
              <h2 className="subtitle">{account}</h2>
            </div>
          ) : (
            <div>
              <button
                className="button is-info"
                type="button"
                onClick={onClick}
              >
                Connect Metamask
              </button>

              <div className="field is-grouped mt-4">
                <p className="control is-expanded">
                  <input
                    className="input"
                    type="text"
                    placeholder="or enter a wallet address to check"
                    onChange={(e) => onChange(e)}
                  />
                </p>
                <p className="control">
                  <button className="button is-info" onClick={setWallet}>
                    Show me
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="pt-4 is-size-5">
          Uses Zapper.fi API. Haven't tried it? Go to{" "}
          <a target="new" href="http://zapper.fi/">
            zapper.fi
          </a>{" "}
          to try now!
        </div>
        <div className="pt-4 is-size-6 content">
         How it works: 
         <ol>
           <li>Checks your transactions history and sums all the ETH you spend on exchanging (ex: exchanging ETH for USDC) and its todays USD value</li>
           <li>Sums all your staked coins' USD values</li>
           <li>Compares these two values to see if you would be better of by hodling or staking.</li>
          </ol>
        </div>
      </section>
      <hr />

      <section className="section">
        {account && <Dashboard wallet={account} />}
        {externalWallet && <Dashboard wallet={externalWallet} />}
      </section>
    </div>
  );
};

export const App = () => {
  return (
    <div className="container">
      <Web3ReactProvider getLibrary={getLibrary}>
        <Wallet />
      </Web3ReactProvider>
    </div>
  );
};

export default App;
