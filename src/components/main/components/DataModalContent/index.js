import React, { Component } from "react";
import "../../index.css";

export default class DataModalContent extends Component {
  render() {
    const { dataID, dataMap } = this.props;
    const pieceData = dataMap[dataID];
    console.log(pieceData.PlatformLinux);
    return (
      <div className="DataModalContent__container">
        <p>Release Date: {pieceData.ReleaseDate}</p>
        <p>Recommendation Count: {pieceData.RecommendationCount}</p>
        <p>
          Metacritic Score:&nbsp;
          {pieceData.Metacritic === "0" ? "N/A" : pieceData.Metacritic}
        </p>
        <p>Price: {pieceData.PriceInitial}</p>
        <p>
          Platform: {pieceData.PlatformWindows === "True" ? "Windows" : ""}{" "}
          {pieceData.PlatformLinux === "True" ? "Linux" : ""}{" "}
          {pieceData.PlatformMac === "True" ? "Mac" : ""}
        </p>
        <img
          className="my-modal-header-img"
          src={pieceData.HeaderImage}
          alt={pieceData.ResponseName}
        />
      </div>
    );
  }
}
