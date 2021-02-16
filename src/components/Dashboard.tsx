import React, { useEffect, useState } from "react";
import { numberFormat } from ".././formatNumber";
import axios from "axios";
import LoadingDiv from "./Loading";
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

const COIN: Coin = { label: "ethereum", symbol: "ETH" };

export const Dashboard = (props: DashboardProps) => {
  const wallet = props.wallet.toLowerCase();
  const [isLoading, setIsLoading] = useState(false);
  const [staking, setStaking] = useState([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewardStaked, setTotalRewardStaked] = useState(0);
  // const [transactions, setTransactions] = useState([]);
  const [totalCoinAmount, setTotalCoinAmount] = useState(0);
  const [coinPriceUSD, setCoinPriceUSD] = useState(1);
  const [error, setError] = useState("");
  let isBetterOff = false;
  const API_KEY = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      const stakedData = await axios(
        `https://api.zapper.fi/v1/staked-balance/single-staking?addresses%5B%5D=${wallet}&api_key=${API_KEY}`
      );
      const transactionsData = await axios(
        `https://api.zapper.fi/v1/transactions/${wallet}?api_key=${API_KEY}`
      );

      setStaking(stakedData.data[wallet]);
      const sums = sumStakings(stakedData.data[wallet]);
      setTotalStaked(sums.total);
      setTotalRewardStaked(sums.rewardTotal);
      setTotalCoinAmount(sumTotalCoinAmount(transactionsData.data));
      calculateCoinValue();
    };

    fetchData().catch((error) => {
      setIsLoading(false);
      setError(error.message);
    });
  }, [wallet, API_KEY]);

  function sumStakings(response: any) {
    let t = 0;
    let rT = 0;
    response.forEach((el: any) => {
      t += el.balanceUSD;
      rT += el.rewardBalanceUSD;
    });
    return { total: t, rewardTotal: rT };
  }

  function sumTotalCoinAmount(response: any) {
    let t = 0;
    response.forEach((trx: Transaction) => {
      if (trx.name === "Exchange") {
        trx.subTransactions.forEach((subTrx) => {
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
        setError("");
      });
  }

  isBetterOff =
    totalStaked + totalRewardStaked > totalCoinAmount * coinPriceUSD;

  return (
    <div>
      {error ? (
        <div className="is-error has-text-danger is-size-3">{error}</div>
      ) : (
        <div>
          {!isLoading ? (
            <div>
              <p className="is-size-6">
                {"Date: "} {new Date().toLocaleString()}{" "}
              </p>
              <div>
                <section className="info-tiles">
                  <div className="tile is-ancestor has-text-centered">
                    <div className="tile is-parent">
                      <article className="tile is-child box has-background-primary">
                        <p className="title has-text-white">
                          {totalCoinAmount}
                        </p>
                        <p className="subtitle has-text-white">{`Exchanged total ${COIN.label} amount`}</p>
                        (gas fee not included)
                      </article>
                    </div>
                    <div className="tile is-parent">
                      <article className="tile is-child box has-background-info">
                        <p className="title has-text-white">
                          {numberFormat(totalCoinAmount * coinPriceUSD)}
                        </p>
                        <p className="subtitle has-text-white">{`Exchanged total USD ${COIN.symbol} value`}</p>
                        {`1 ${COIN.symbol} = `}
                        {numberFormat(coinPriceUSD)}
                      </article>
                    </div>

                    <div className="tile is-parent">
                      <article className="tile is-child box has-background-warning">
                        <p className="title has-text-white">
                          {numberFormat(totalStaked)}
                        </p>
                        <p className="subtitle has-text-white">
                          Staked total USD value
                        </p>
                      </article>
                    </div>
                    <div className="tile is-parent">
                      <article className="tile is-child box has-background-success">
                        <p className="title has-text-white">
                          {numberFormat(totalStaked + totalRewardStaked)}
                        </p>
                        <p className="subtitle has-text-white">
                          Staked total USD value (including rewards)
                        </p>
                      </article>
                    </div>
                  </div>
                </section>
              </div>
              <hr />
              <div>
                <p className="is-size-3 has-text-centered">
                  {isBetterOff
                    ? "Congrats! You better off by staking"
                    : "Damn! You should have hodled :("}
                </p>
              </div>
              <hr />
              <div>
             
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
                            <p>
                              {token.rewardTokenSymbol} :{" "}
                              {numberFormat(token.rewardBalanceUSD)}
                            </p>
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <LoadingDiv />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
