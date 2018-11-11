import React, { Component } from "react";
import * as d3 from "d3";
class Main extends Component {
  state = {
    data: [],
    loading: true
  };
  async componentDidMount() {
    let dataCollection = [];
    await d3.csv("steam_game_features.csv", data => {
      // console.log(data)
      dataCollection.push(data);
    });
    this.setState({
      data: dataCollection,
      loading: false
    });
    console.log("hi");
    console.log(dataCollection);
  }
  render() {
    let names = "";
    if (!this.state.loading) {
      if (this.state.data && this.state.data.length) {
        for (let row in this.state.data) {
          names += this.state.data[row]["ResponseName"] + ", ";
        }
      }
    }

    return <div>{names}</div>;
  }
}

export default Main;
