import React, { Component } from "react";
import { Button } from "antd";

import { Layout, Menu, Icon } from "antd";
import * as d3 from "d3";
import Main from "./components/main";
import logo from "./logo.svg";
import "./App.css";
const { Header, Content, Footer, Sider } = Layout;

class App extends Component {
  state = {
    data: [],
    loading: true
  };
  async componentDidMount() {
    let dataCollection = [];
    await d3.csv("steam_game_features.csv", data => {
      dataCollection.push(data);
    });

    this.setState({
      data: dataCollection,
      loading: false
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
                <Main data={this.state.data} loading={this.state.loading} />
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
