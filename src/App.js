import React from "react";
import "./styles.css";
import SplitPane from "./SplitPane/SplitPane.js";

export default function App() {
  return (
    <SplitPane>
      <h1>Это верхняя панель</h1>
      <h2 style={{height: '100px'}}>Это средняя панель</h2>
      <h3 style={{height: '30px'}}>Это нижняя панель</h3>
    </SplitPane>
  );
}
