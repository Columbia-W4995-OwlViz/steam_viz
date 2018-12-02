import React, { Component } from "react";

import { Layout, Select } from "antd";
import * as d3 from "d3";
import Main from "./components/main";
import Timeline from "./components/timeline";
import "./App.css";
const { Content } = Layout;

class App extends Component {
  state = {
    data: [],
    dataMap: {},
    loading: true,
    prelude: true
  };
  componentDidMount() {
    d3.csv("steam_game_features.csv", newData => {
      return newData;
    }).then(data => {
      // console.log(data);
      let dataMap = {};
      data.forEach(e => {
        dataMap[e.QueryID] = e;
      });
      let uniqueIDs = new Set();
      data.forEach(d => {
        uniqueIDs.add(d.QueryID);
      });
      const refinedData = Array.from(uniqueIDs).map(uid => dataMap[uid]);
      // const filteredData = refinedData.filter();
      // console.log(refinedData);
      this.setState({
        data: refinedData,
        dataMap,
        // uniqueIDs,
        loading: false
      });
    });
  }
  render() {
    return (
      <div className="App">
        <Layout>
          {/* <Sider
            style={{
              overflow: "auto",
              height: "100vh",
              position: "fixed",
              left: 0
            }}
          >
            <div className="logo" />
          </Sider> */}
          <Layout style={{ marginLeft: 0 }}>
            <Content style={{ margin: "0", overflow: "initial" }}>
              <div
                style={{ padding: 24, background: "#000", textAlign: "center" }}
              >
                {this.state.prelude ? (
                  <Timeline
                    data={this.state.data}
                    dataMap={this.state.dataMap}
                    loading={this.state.loading}
                  />
                ) : (
                  <Main
                    data={this.state.data}
                    dataMap={this.state.dataMap}
                    loading={this.state.loading}
                    // uniqueIDs={this.state.uniqueIDs}
                  />
                )}
              </div>
            </Content>
            {/* <Footer style={{ textAlign: "center" }} /> */}
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default App;
