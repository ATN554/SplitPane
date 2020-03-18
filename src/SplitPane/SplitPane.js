import React from "react";
import "./default.css";
import Draggable from "../DND/Draggable.js";
import UnfoldMore from "@material-ui/icons/UnfoldMore";

export default class SplitPane extends React.Component {
  constructor(props) {
    super(props);

    let resizer = this.props.resizer
      ? this.props.resizer
      : React.createElement(
          "div",
          { className: "resizer" },
          React.createElement(UnfoldMore, {
            className: "resizer-icon",
            color: "secondary"
          })
        );
    let elements = this.props.children;
    let length = elements.length * 2 - 1;
    let modElements = [];
    for (let i = 0; i < length; i++) {
      if (i % 2 === 0) {
        let idx = i / 2;
        let child = elements[idx];
        let style = {};
        if (
          this.props.heights !== undefined &&
          this.props.heights[idx] !== undefined
        ) {
          style.height = this.props.heights[idx];
        }
        modElements.push(
          React.createElement(
            "div",
            {
              id: "splitpane-container-" + idx,
              key: "splitpane-container-" + idx,
              className: "splitpane-container",
              style: style
            },
            child
          )
        );
      } else {
        let idx = (i - 1) / 2;
        modElements.push(
          React.createElement(
            Draggable,
            {
              id: "splitpane-resizer-" + idx,
              key: "splitpane-resizer-" + idx,
              type: "div",
              showClone: false,
              className: "splitpane-resizer",
              axis: "vertical",
              onDragStart: (idFrom, x, y) => {
                this.onDragStart(idFrom, x, y);
              },
              onDragMove: (idFrom, x, y) => {
                this.onDragMove(idFrom, x, y);
              },
              onDragEnd: (idFrom, idTo, x, y) => {
                this.onDragStop(idFrom, x, y);
              },
              onDragCancel: (idFrom, x, y) => {
                this.onDragStop(idFrom, x, y);
              },
              allowMove: (idFrom, xs, ys, xe, ye) => {
                return this.allowMove(idFrom, xs, ys, xe, ye);
              }
            },
            resizer
          )
        );
      }
    }

    let resizeMode = "one";
    if (this.props.resizeMode === "two") {
      resizeMode = "two";
    }

    this.state = {
      elements: modElements,
      resizeMode: resizeMode,
      pageY: undefined,
      curDiv: undefined,
      curDivHeight: undefined,
      nextDiv: undefined,
      nextDivHeight: undefined
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.allowMove = this.allowMove.bind(this);
  }

  onDragStart(idFrom, x, y) {
    let elem = document.getElementById(idFrom);
    let curDiv = elem.previousElementSibling;
    let cs1 = getComputedStyle(curDiv);
    let curDivHeight =
      curDiv.offsetHeight -
      parseFloat(cs1.paddingTop) -
      parseFloat(cs1.paddingBottom) -
      parseFloat(cs1.borderTopWidth) -
      parseFloat(cs1.borderBottomWidth);
    let nextDiv =
      this.state.resizeMode === "two" ? elem.nextElementSibling : undefined;
    let nextDivHeight = undefined;
    if (nextDiv) {
      let cs2 = getComputedStyle(nextDiv);
      nextDivHeight =
        nextDiv.offsetHeight -
        parseFloat(cs2.paddingTop) -
        parseFloat(cs2.paddingBottom) -
        parseFloat(cs2.borderTopWidth) -
        parseFloat(cs2.borderBottomWidth);
    }
    this.setState({
      pageY: y,
      curDiv: curDiv,
      curDivHeight: curDivHeight,
      nextDiv: nextDiv,
      nextDivHeight: nextDivHeight
    });
  }

  onDragMove(idFrom, x, y) {
    let curDiv = this.state.curDiv;
    if (curDiv) {
      let diffY = y - this.state.pageY;
      curDiv.style.height = this.state.curDivHeight + diffY + "px";
      let nextDiv = this.state.nextDiv;
      if (nextDiv) {
        nextDiv.style.height = this.state.nextDivHeight - diffY + "px";
      }
    }
  }

  onDragStop(idFrom, x, y) {
    this.setState({
      pageY: undefined,
      curDiv: undefined,
      curDivHeight: undefined,
      nextDiv: undefined,
      nextDivHeight: undefined
    });
  }

  allowMove(idFrom, xs, ys, xe, ye) {
    let curDiv = this.state.curDiv;
    if (curDiv) {
      let diffY = ye - this.state.pageY;
      let newHeight = this.state.curDivHeight + diffY;
      if (newHeight > 0) {
        let nextDiv = this.state.nextDiv;
        if (nextDiv) {
          newHeight = this.state.nextDivHeight - diffY;
          return newHeight > 0;
        } else {
          return true;
        }
      }
    }
    return false;
  }

  render() {
    return React.createElement(
      "div",
      {
        id: this.props.id,
        className: "splitpane",
        style: this.props.style
      },
      this.state.elements
    );
  }
}
