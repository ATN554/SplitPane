import React from "react";
import "./styles.css";
import SplitPane from "./SplitPane/SplitPane.js";

export default function App() {
  return (
    <SplitPane resizer={<hr />}>
      <h1>Это верхняя панель</h1>
      <div style={{height: '33%'}}>
        <h2>Это средняя панель</h2>
      </div>
      <div style={{height: '33%'}}>
        <h3>Это нижняя панель</h3>
      </div>
    </SplitPane>
  );
}
