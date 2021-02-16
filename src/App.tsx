import "./App.css";
// import { useState } from "react";

import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import Dashboard from "./components/Dashboard";

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
  // const [externalWallet, setExternalWallet] = useState("");
  const {
    chainId,
    account,
    activate,
    active,
    deactivate,
  } = useWeb3React<Web3Provider>();

  const onClick = () => {
    activate(injectedConnector);
  };

  // const onChange = (e: any) => {
  //   setExternalWallet(e.target.value);
  // };

  // const setWallet = () => {};

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

              {/* <div className="field is-grouped mt-4">
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
              </div> */}
            </div>
          )}
        </div>
        <div className="pt-4 is-size-4">
          Uses Zapper.fi API. Haven't tried it? Go to{" "}
          <a target="new" href="http://zapper.fi/">
            zapper.fi
          </a>{" "}
          to try now!
        </div>
      </section>
      <hr />

      <section className="section">
        {account && <Dashboard wallet={account} />}
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
