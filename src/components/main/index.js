import React, { Component } from "react";
import * as d3 from "d3";
import "./index.css";

class Main extends Component {
  state = {
    data: [],
    loading: true,
    names: ""
  };
  async componentDidMount() {
    let dataCollection = [];
    await d3.csv("steam_game_features.csv", data => {
      // console.log(data)
      dataCollection.push(data);
    });

    let names = "";
    for (let row in dataCollection) {
      names += dataCollection[row]["ResponseName"] + ", ";
    }

    this.setState({
      data: dataCollection,
      loading: false,
      names
    });

    console.log("hi");
    console.log(dataCollection);
  }
  render() {
    return <div>{this.state.loading ? [] : this.state.names}</div>;
  }
}

export default Main;
