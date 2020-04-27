import React from "react";
import "./styles.css";
import SplitPane from "./SplitPane/SplitPane.js";

export default function App() {
  return (
    <SplitPane
      sizes={["33%", "33%", "33%"]}
      resizeMode="two"
      updateMode="onEnd"
    >
      <h1>Это верхняя панель</h1>
      <h2>Это средняя панель</h2>
      <h3>Это нижняя панель</h3>
    </SplitPane>
  );
}
