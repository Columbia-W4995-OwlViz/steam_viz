import React, { Component } from "react";
import * as d3 from "d3";
class Main extends Component {
  state = {
    data: []
  };
  async componentDidMount() {
    let dataCollection = [];
    await d3.csv("steam_game_features.csv", data => {
      // console.log(data)
      dataCollection.push(data);
    });
    this.setState({
      data: dataCollection
    });
    console.log("hi");
    console.log(dataCollection);
  }
  render() {
    return (
      <div>
        {this.state.data && this.state.data.length
          ? this.state.data.toString()
          : []}
      </div>
    );
  }
}

export default Main;
