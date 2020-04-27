import React from "react";
import "./default.css";
import getUID from "../UID/uid.js";
import Draggable from "../DND/Draggable.js";

const defaultResizer = orientation => {
  return React.createElement("div", {
    className: "splitpane-resizer-line " + orientation
  });
};

/**
 * Сплит-панель
 *
 * Параметры:
 * orientation - Один из "vertical" или "horizontal". По умолчанию "vertical".
 * Расположение компонентов в виде колонки или строки.
 *
 * resizeMode - Один из "one" или "two". По умолчанию "one".
 * Способ растяжения: one - только текущий элемент, two - текущий и следующий (если текущий увеличивает размер, то следующий уменьшает и наоборот)
 *
 * updateMode - Один из "onMove" или "onEnd". По умолчанию "onMove".
 * Способ изменения размеров: onMove - в процессе перемещения разделителя, onEnd - после окончания перемещения разделителя.
 *
 * sizes - Массив [] с начальными линейными размерами элементов. По умолчанию undefined.
 * Размер присваивается к высоте, если orientation = "vertical".
 * Размер присваивается к ширине, если orientation = "horizontal".
 * Может содрежать значение любого вида, поддерживаемого для css width и css height.
 * Например для 3-х элементов: ["200px", "30%", "calc(40% - 2px)"]
 * Все значения пересчитываются в % от размеров панели.
 * Значение переданное в % не пересчитывается.
 *
 * resizer - Элемент выступающий в роли разделителя панели. По умолчанию defaultResizer(orientation).
 *
 * id - Уникальный идентификатор DOM. По умолчанию undefined.
 *
 * style - css стиль. По умолчанию undefined.
 *
 * React.children - список элементов панели
 *
 */
export default class SplitPane extends React.Component {
  constructor(props) {
    super(props);

    let saltId = getUID();
    let orientation = ["vertical", "horizontal"].some(
      el => el === this.props.orientation
    )
      ? this.props.orientation
      : "vertical";
    let resizeMode = ["one", "two"].some(el => el === this.props.resizeMode)
      ? this.props.resizeMode
      : "one";
    let updateMode = ["onMove", "onEnd"].some(
      el => el === this.props.updateMode
    )
      ? this.props.updateMode
      : "onMove";

    let resizer = this.props.resizer
      ? this.props.resizer
      : defaultResizer(orientation);
    let elements = this.props.children;
    let length = elements.length;
    let modElements = [];
    let containerIds = [];
    let resizerIds = [];
    for (let idx = 0; idx < length; idx++) {
      let child = elements[idx];
      let style = {};
      if (
        this.props.sizes !== undefined &&
        this.props.sizes[idx] !== undefined
      ) {
        if (orientation === "horizontal") {
          style.width = this.props.sizes[idx];
        } else {
          style.height = this.props.sizes[idx];
        }
      }
      let elementId = "splitpane-container-" + saltId + "-" + idx;
      containerIds.push(elementId);
      let resizerElement;
      if (idx < length - 1) {
        let resizerId = "splitpane-resizer-" + saltId + "-" + idx;
        resizerIds.push(resizerId);
        resizerElement = React.createElement(
          Draggable,
          {
            id: resizerId,
            key: resizerId,
            type: "div",
            showClone: updateMode === "onEnd",
            className: "splitpane-resizer " + orientation,
            axis: orientation,
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
        );
      } else {
        resizerElement = undefined;
      }

      let contentElement = [
        React.createElement(
          "div",
          {
            className: "splitpane-content " + orientation
          },
          child
        )
      ];
      if (resizerElement) {
        contentElement.push(resizerElement);
      }

      modElements.push(
        React.createElement(
          "div",
          {
            id: elementId,
            key: elementId,
            className: "splitpane-container " + orientation,
            style: style
          },
          ...contentElement
        )
      );
    }

    this.state = {
      saltId: saltId,
      paneElement: undefined,
      elements: modElements,
      containerIds: containerIds,
      resizerIds: resizerIds,
      orientation: orientation,
      resizeMode: resizeMode,
      updateMode: updateMode,
      pagePos: undefined,
      curDiv: undefined,
      curDivSize: undefined,
      nextDiv: undefined,
      nextDivSize: undefined
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.allowMove = this.allowMove.bind(this);
  }

  onDragStart(idFrom, x, y) {
    let resizerIdx = this.state.resizerIds.findIndex(id => id === idFrom);
    let curDiv = document.getElementById(this.state.containerIds[resizerIdx]);
    let curDivSize = [
      parseFloat(curDiv.style.width),
      parseFloat(curDiv.style.height)
    ];
    let nextDiv =
      this.state.resizeMode === "two" ? curDiv.nextElementSibling : undefined;
    let nextDivSize = undefined;
    if (nextDiv) {
      nextDivSize = [
        parseFloat(nextDiv.style.width),
        parseFloat(nextDiv.style.height)
      ];
    }
    this.setState({
      pagePos: [x, y],
      curDiv: curDiv,
      curDivSize: curDivSize,
      nextDiv: nextDiv,
      nextDivSize: nextDivSize
    });
  }

  onDragMove(idFrom, x, y) {
    if (this.state.updateMode === "onMove") {
      let curDiv = this.state.curDiv;
      if (curDiv) {
        let paneSize = [
          this.state.paneElement.clientWidth,
          this.state.paneElement.clientHeight
        ];
        if (this.state.orientation === "horizontal") {
          let diffX = x - this.state.pagePos[0];
          let diffProc = (diffX * 100) / paneSize[0];
          curDiv.style.width = this.state.curDivSize[0] + diffProc + "%";
          let nextDiv = this.state.nextDiv;
          if (nextDiv) {
            nextDiv.style.width = this.state.nextDivSize[0] - diffProc + "%";
          }
        } else {
          let diffY = y - this.state.pagePos[1];
          let diffProc = (diffY * 100) / paneSize[1];
          curDiv.style.height = this.state.curDivSize[1] + diffProc + "%";
          let nextDiv = this.state.nextDiv;
          if (nextDiv) {
            nextDiv.style.height = this.state.nextDivSize[1] - diffProc + "%";
          }
        }
      }
    }
  }

  onDragStop(idFrom, x, y) {
    if (this.state.updateMode === "onEnd") {
      let curDiv = this.state.curDiv;
      if (curDiv) {
        let paneSize = [
          this.state.paneElement.clientWidth,
          this.state.paneElement.clientHeight
        ];
        if (this.state.orientation === "horizontal") {
          let diffX = x - this.state.pagePos[0];
          let diffProc = (diffX * 100) / paneSize[0];
          curDiv.style.width = this.state.curDivSize[0] + diffProc + "%";
          let nextDiv = this.state.nextDiv;
          if (nextDiv) {
            nextDiv.style.width = this.state.nextDivSize[0] - diffProc + "%";
          }
        } else {
          let diffY = y - this.state.pagePos[1];
          let diffProc = (diffY * 100) / paneSize[1];
          curDiv.style.height = this.state.curDivSize[1] + diffProc + "%";
          let nextDiv = this.state.nextDiv;
          if (nextDiv) {
            nextDiv.style.height = this.state.nextDivSize[1] - diffProc + "%";
          }
        }
      }
    }

    this.setState({
      pagePos: undefined,
      curDiv: undefined,
      curDivSize: undefined,
      nextDiv: undefined,
      nextDivSize: undefined
    });
  }

  allowMove(idFrom, xs, ys, xe, ye) {
    let curDiv = this.state.curDiv;
    if (curDiv) {
      let paneSize = [
        this.state.paneElement.clientWidth,
        this.state.paneElement.clientHeight
      ];
      if (this.state.orientation === "horizontal") {
        let diffX = xe - this.state.pagePos[0];
        let diffProc = (diffX * 100) / paneSize[0];
        let newWidth = this.state.curDivSize[0] + diffProc;
        if (newWidth > 1) {
          let nextDiv = this.state.nextDiv;
          if (nextDiv) {
            newWidth = this.state.nextDivSize[0] - diffProc;
            return newWidth > 1;
          } else {
            return true;
          }
        }
      } else {
        let diffY = ye - this.state.pagePos[1];
        let diffProc = (diffY * 100) / paneSize[1];
        let newHeight = this.state.curDivSize[1] + diffProc;
        if (newHeight > 1) {
          let nextDiv = this.state.nextDiv;
          if (nextDiv) {
            newHeight = this.state.nextDivSize[1] - diffProc;
            return newHeight > 1;
          } else {
            return true;
          }
        }
      }
    }
    return false;
  }

  componentDidMount() {
    let pane = document.getElementById(this.props.id || this.state.saltId);
    this.setState({ paneElement: pane });
    this.state.containerIds.forEach((elId, elIdx) => {
      let el = document.getElementById(elId);
      if (this.state.orientation === "horizontal") {
        if (!el.style.width.endsWith("%")) {
          el.style.width = (el.clientWidth * 100) / pane.clientWidth + "%";
        }
      } else {
        if (!el.style.height.endsWith("%")) {
          el.style.height = (el.clientHeight * 100) / pane.clientHeight + "%";
        }
      }
    });
  }

  render() {
    return React.createElement(
      "div",
      {
        id: this.props.id || this.state.saltId,
        className: "splitpane " + this.state.orientation,
        style: this.props.style
      },
      this.state.elements
    );
  }
}
