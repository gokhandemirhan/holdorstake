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

  return (
    <div>
      {isLoading ? (
        <h1>loading</h1>
      ) : (
        <div>
          <hr />
          <div>
            {`All ${COIN.label} spent in exchanges: ${totalCoinAmount}, value: `}
            {numberFormat(totalCoinAmount * coinPriceUSD)}
          </div>
          <hr />
          <div>
            STAKED TOKENS: {numberFormat(totalStaked)}
            {staking.map((token: any) => {
              return (
                <div key={token.symbol}>
                  {token.label} : {numberFormat(token.balanceUSD)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
