import React, { Component } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

class App extends Component {
  state = {
    rates: {},
    selectedCurrency: "USD",
    recentRates: [],
    connected: false,
    color: "green",
    
  };

  componentDidMount() {
    this.ws = new WebSocket(
      "wss://u3fen3k27a.execute-api.us-east-1.amazonaws.com/Final"
    );
    this.ws.onopen = () => {
      this.ws.send({ action: "$default" });
      console.log("connected");
    };

    this.ws.onmessage = (evt) => {
      const message = evt.data;
      const SocketData = JSON.parse(message);
      var rates = this.state.rates;
      var recentRates = this.state.recentRates;
      var color = "green";
      if (SocketData) {
        console.log(SocketData);
        SocketData.map((item) => {
          //Persisting the rates for graphing
          if (item.Currency === this.state.selectedCurrency) {
            recentRates = [...recentRates, { buy: item.Data.buy }];
            color =
              this.state.rates[item.Currency] &&
              this.state.rates[item.Currency].value < item.Data.buy
                ? "green"
                : "red";
          }
          rates[item.Currency] = {
            value: item.Data.buy,
            symbol: item.Data.symbol,
          };
        });
      }

      this.setState({
        rates: rates,
        connected: true,
        recentRates: recentRates,
        color: color,
      });
    };

    this.ws.onclose = () => {
      console.log("disconnected");
      this.setState({ connected: false });
    };
  }

  render() {
    return (
      <div className="App">
        {this.state.connected === true ? (
          <h2>
            Bitcoin v/s{" "}
            {
              <FormControl>
                <Select
                  labelId="select-currency-label"
                  id="demo-controlled-open-select"
                  value={this.state.selectedCurrency}
                  onChange={(e) => {
                    console.log(e);
                    this.setState({
                      selectedCurrency: e.target.value,
                      color:"green",
                      recentRates: [
                        { buy: this.state.rates[e.target.value].buy },
                      ],
                    });
                  }}
                >
                  {Object.keys(this.state.rates).map((currency) => (
                    <MenuItem value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          </h2>
        ) : (
          <p
            style={{
              fontWeight: "bold",
              fontSize: "25px",
              marginTop: "10%",
              color: "green",
            }}
          >
            Loading...
          </p>
        )}
        {!this.state.connected === false && (
          <div>
            <table id="customers">
              <tr>
                <th>CURRENCY</th>
                <th>EXCHANGE VALUE</th>
              </tr>
              <tr>
                <td>{this.state.selectedCurrency}</td>
                <td style={{ backgroundColor: this.state.color }}>
                  {this.state.rates[this.state.selectedCurrency].value}{" "}
                  {this.state.rates[this.state.selectedCurrency].symbol}
                </td>
              </tr>
            </table>
            {console.log(this.state.recentRates)}
            <LineChart data={this.state.recentRates} width={300} height={200}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis />
              <YAxis domain={["auto", "auto"]} />
              <Line type="monotone" dataKey="buy" stroke="#82ca9d" />
            </LineChart>
          </div>
        )}
      </div>
    );
  }
}

export default App;
