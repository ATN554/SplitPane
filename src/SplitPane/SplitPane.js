import React from "react";
import Draggable from "../DND/Draggable.js";

export default class SplitPane extends React.Component {
  constructor(props) {
    super(props);

    let resizer = this.props.resizer ? this.props.resizer : <hr />;
    let elements = this.props.children;
    let length = elements.length * 2 - 1;
    let modElements = [];
    for (let i = 0; i < length; i++) {
      if (i % 2 === 0) {
        let idx = i / 2;
        let child = elements[idx];
        modElements.push(
          <div 
            id={"splitpane-container-" + idx}
            key={"splitpane-container-" + idx}
            className="splitpane-container"
            style={{overflow: "auto"}}>
            {child}
          </div>
        );
      } else {
        let idx = (i-1) / 2;
        modElements.push(
          <Draggable
            id={"splitpane-resizer-" + idx}
            key={"splitpane-resizer-" + idx}
            type={"div"}
            showClone={false}
            className="splitpane-resizer"
            style={{cursor: 'row-resize', userSelect: 'none'}}
            axis="vertical"
            onDragStart={(idFrom, x, y) => {this.onDragStart(idFrom, x, y);}}
            onDragMove={(idFrom, x, y) => {this.onDragMove(idFrom, x, y);}}
            onDragEnd={(idFrom, idTo, x, y) => {this.onDragStop(idFrom, x, y);}}
            onDragCancel={(idFrom, x, y) => {this.onDragStop(idFrom, x, y);}}
            allowMove={(idFrom, xs, ys, xe, ye) => {return this.allowMove(idFrom, xs, ys, xe, ye);}}
          >
            {resizer}
          </Draggable>
        );
      }
    }

    this.state = {
      elements: modElements,
      pageY: undefined,
      curDiv: undefined,
      curDivHeight: undefined
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.allowMove = this.allowMove.bind(this);
  }

  onDragStart(idFrom, x, y) {
    let elem = document.getElementById(idFrom);
    let curDiv = elem.previousElementSibling;
    let cs = getComputedStyle(curDiv);
    let height =
      curDiv.offsetHeight -
      parseFloat(cs.paddingTop) -
      parseFloat(cs.paddingBottom) -
      parseFloat(cs.borderTopWidth) -
      parseFloat(cs.borderBottomWidth);
    this.setState({
      curDiv: curDiv,
      pageY: y,
      curDivHeight: height
    });
  }

  onDragMove(idFrom, x, y) {
    let curDiv = this.state.curDiv;
    if (curDiv) {
      let diffY = y - this.state.pageY;
      curDiv.style.height = this.state.curDivHeight + diffY + "px";
    }
  }

  onDragStop(idFrom, x, y) {
    this.setState({
      curDiv: undefined,
      pageY: undefined,
      curDivHeight: undefined
    });
  }

  allowMove(idFrom, xs, ys, xe, ye) {
    let curDiv = this.state.curDiv;
    if (curDiv) {
      let diffY = ye - this.state.pageY;
      let newHeight = this.state.curDivHeight + diffY;
      return newHeight > 0;
    }
    return false;
  }

  render() {
    return React.createElement(
      "div",
      {
        id: this.props.id,
        className: this.props.className,
        style: this.props.style
      },
      this.state.elements
    );
  }
}
