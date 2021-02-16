import React, { useEffect, useState } from "react";
import data from "../mock";
import { numberFormat } from ".././formatNumber";
import axios from "axios";

interface Coin {
  label: string;
  symbol: string;
}

interface CoinGecko {
  [key: string]: any;
}

interface Transaction {
  hash: string;
  blockNumber: string;
  name: string;
  direction: string;
  timeStamp: string;
  symbol: string;
  amount: string;
  from: string;
  destination: string;
  contract: string;
  subTransactions: { type: string; symbol: string; amount: number }[];
  nonce: string;
  gasPrice: number;
  gasLimit: number;
  input: string;
  gas: number;
}

interface DashboardProps {
  wallet: string;
}

const API_KEY = "5d1237c2-3840-4733-8e92-c5a58fe81b88";
const COIN: Coin = { label: "ethereum", symbol: "ETH" };

export const Dashboard = (props: DashboardProps) => {
  const wallet = props.wallet.toLowerCase();
  const [isLoading, setIsLoading] = useState(false);
  const [staking, setStaking] = useState([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [totalCoinAmount, setTotalCoinAmount] = useState(0);
  const [coinPriceUSD, setCoinPriceUSD] = useState(1);
  let isBetterOff = false;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const stakedData = await axios(
        `https://api.zapper.fi/v1/staked-balance/single-staking?addresses%5B%5D=${wallet}&api_key=${API_KEY}`
      );
      const transactionsData = await axios(
        `https://api.zapper.fi/v1/transactions/${wallet}?api_key=${API_KEY}`
      );

      setStaking(stakedData.data[wallet]);
      setTotalStaked(sumStakings(stakedData.data[wallet]));
      setTotalCoinAmount(sumTotalCoinAmount(transactionsData.data));
      calculateCoinValue();
    };

    fetchData();
  }, []);

  function sumStakings(response: any) {
    let t = 0;
    const total = response.forEach((el: any) => (t += el.balanceUSD));
    return t;
  }

  function sumTotalCoinAmount(response: any) {
    let t = 0;
    response.map((trx: Transaction) => {
      if (trx.name === "Exchange") {
        trx.subTransactions.map((subTrx) => {
          if (subTrx.type === "outgoing" && subTrx.symbol === COIN.symbol) {
            t += subTrx.amount;
          }
        });
      }
    });
    return t;
  }

  function calculateCoinValue() {
    axios
      .get(
        "  https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      )
      .then((resp: { data: CoinGecko }) => {
        setCoinPriceUSD(resp.data[COIN.label]["usd"]);
        setIsLoading(false);
      });
  }

  isBetterOff = totalStaked > totalCoinAmount * coinPriceUSD;

  return (
    <div>
      {isLoading ? (
        <svg className="loader" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <rect x="19" y="19" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0s" calcMode="discrete"></animate>
        </rect><rect x="40" y="19" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.125s" calcMode="discrete"></animate>
        </rect><rect x="61" y="19" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.25s" calcMode="discrete"></animate>
        </rect><rect x="19" y="40" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.875s" calcMode="discrete"></animate>
        </rect><rect x="61" y="40" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.375s" calcMode="discrete"></animate>
        </rect><rect x="19" y="61" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.75s" calcMode="discrete"></animate>
        </rect><rect x="40" y="61" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.625s" calcMode="discrete"></animate>
        </rect><rect x="61" y="61" width="20" height="20" fill="#1d3f72">
          <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s" repeatCount="indefinite" begin="0.5s" calcMode="discrete"></animate>
        </rect>
        </svg>
      ) : (
        <div>
          <div>
            <section className="info-tiles">
              <div className="tile is-ancestor has-text-centered">
                <div className="tile is-parent">
                  <article className="tile is-child box has-background-primary">
                    <p className="title has-text-white">{totalCoinAmount}</p>
                    <p className="subtitle has-text-white">{`Exchanged total ${COIN.label} amount`}</p>
                  </article>
                </div>
                <div className="tile is-parent">
                  <article className="tile is-child box has-background-info">
                    <p className="title has-text-white">
                      {numberFormat(totalCoinAmount * coinPriceUSD)}
                    </p>
                    <p className="subtitle has-text-white">{`Exchanged total USD ${COIN.symbol} value`}</p>
                  </article>
                </div>

                <div className="tile is-parent">
                  <article className="tile is-child box has-background-warning">
                    <p className="title has-text-white">{numberFormat(totalStaked)}</p>
                    <p className="subtitle has-text-white">Staked total USD value</p>
                  </article>
                </div>
              </div>
            </section>
          </div>
          <hr />
          <div>
            <p className="is-size-3 has-text-centered">{isBetterOff ? "Congrats! You better off by staking":"Damn! You should have hodled :("}</p>
          </div>
          <hr />
          <div>
          <div>
            <p className="is-size-4">Your staked coins:</p>
          </div>
            <section className="info-tiles">
              <div className="tile is-ancestor has-text-centered">
                {staking.map((token: any) => {
                  return (
                    <div className="tile is-parent" key={token.symbol}>
                      <article className="tile is-child box">
                        <p className="title">
                          {numberFormat(token.balanceUSD)}
                        </p>
                        <p className="subtitle">{token.label}</p>
                      </article>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
