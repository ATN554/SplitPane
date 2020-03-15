import React from "react";

export default class Draggable extends React.Component {
  constructor(props) {
    super(props);

    this.ref = null;

    let axis = this.props.axis === undefined ? "both" : this.props.axis;
    let enabled = this.props.enabled === undefined ? true : this.props.enabled;
    let showClone = this.props.showClone !== undefined ? this.props.showClone : true;
    let cloneOpacity = this.props.cloneOpacity !== undefined ? this.props.cloneOpacity : 0.8;

    this.state = {
      elements: this.props.children,
      isReadyForDrag: false,
      isDraging: false,
      showClone: showClone,
      cloneOpacity: cloneOpacity,
      evtX: 0,
      evtY: 0,
      position: [0, 0],
      size: [0, 0],
      innerShift: [0, 0],
      xAxisMove: axis === "horizontal" || axis === "both",
      yAxisMove: axis === "vertical" || axis === "both",
      enabled: enabled
    };

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.move = this.move.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mouseleave", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("touchend", this.onTouchEnd);
    document.addEventListener("touchleave", this.onTouchEnd);
    document.addEventListener("touchmove", this.onTouchMove);
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mouseleave", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("touchend", this.onTouchEnd);
    document.removeEventListener("touchleave", this.onTouchEnd);
    document.removeEventListener("touchmove", this.onTouchMove);
  }

  start(x, y) {
    if (this.state.enabled) {
      if (!this.state.isReadyForDrag && !this.state.isDraging) {
        let box = this.refs.refdnd.getBoundingClientRect();
        let cs = getComputedStyle(this.refs.refdnd);
        let pos = [
          box.x + window.pageXOffset - parseFloat(cs.marginLeft),
          box.y + window.pageYOffset - parseFloat(cs.marginTop)
        ];
        let size = [
          box.width -
            parseFloat(cs.paddingLeft) -
            parseFloat(cs.paddingRight) -
            parseFloat(cs.borderLeftWidth) -
            parseFloat(cs.borderRightWidth),
          box.height -
            parseFloat(cs.paddingTop) -
            parseFloat(cs.paddingBottom) -
            parseFloat(cs.borderTopWidth) -
            parseFloat(cs.borderBottomWidth)
        ];
        let _x = this.state.xAxisMove ? x : pos[0];
        let _y = this.state.yAxisMove ? y : pos[1];
        this.setState({
          isReadyForDrag: true,
          isDraging: false,
          evtX: _x,
          evtY: _y,
          position: pos,
          size: size,
          innerShift: [
            this.state.xAxisMove ? _x - pos[0] : 0,
            this.state.yAxisMove ? _y - pos[1] : 0
          ]
        });
      }
    }
  }

  stop() {
    if (this.state.isReadyForDrag) {
      this.setState({
        isReadyForDrag: false
      });
    } else if (this.state.isDraging) {
      this.setState(
        {
          isDraging: false
        },
        function() {
          let target = document.elementFromPoint(
            this.state.evtX,
            this.state.evtY
          );
          let idFrom = this.props.id;
          if (target) {
            let droppable = target.closest(".droppable");
            if (droppable) {
              let idTo = droppable.id;
              if (this.props.onDragEnd !== undefined) {
                this.props.onDragEnd(
                  idFrom,
                  idTo,
                  this.state.evtX,
                  this.state.evtY
                );
              }
            } else {
              if (this.props.onDragCancel !== undefined) {
                this.props.onDragCancel(
                  idFrom,
                  this.state.evtX,
                  this.state.evtY
                );
              }
            }
          } else {
            if (this.props.onDragCancel !== undefined) {
              this.props.onDragCancel(idFrom, this.state.evtX, this.state.evtY);
            }
          }
        }
      );
    }
  }

  move(x, y) {
    let _x = this.state.xAxisMove ? x : this.state.position[0];
    let _y = this.state.yAxisMove ? y : this.state.position[1];
    if (this.state.isReadyForDrag) {
      this.setState(
        {
          isReadyForDrag: false,
          isDraging: true
        },
        function() {
          if (this.props.onDragStart !== undefined) {
            this.props.onDragStart(
              this.props.id,
              this.state.evtX,
              this.state.evtY
            );
          }
        }
      );
    } else if (this.state.isDraging) {
      let allowMove = true;
      if (this.props.allowMove !== undefined) {
        allowMove = this.props.allowMove(this.props.id, this.state.evtX, this.state.evtY, _x, _y);
      }
      if (allowMove) {
        this.setState(
          {
            evtX: _x,
            evtY: _y
          },
          function() {
            if (this.props.onDragMove !== undefined) {
              this.props.onDragMove(
                this.props.id,
                this.state.evtX,
                this.state.evtY
              );
            }
          }
        );
      }
    }
  }

  onMouseDown(event) {
    event.persist();
    event.preventDefault();
    this.start(event.pageX, event.pageY);
  }

  onMouseUp(event) {
    event.preventDefault();
    this.stop();
  }

  onMouseMove(event) {
    event.preventDefault();
    this.move(event.pageX, event.pageY);
  }

  onTouchStart(event) {
    event.preventDefault();
    if (event.changedTouches.length > 0) {
      let touch = event.changedTouches[0];
      this.start(touch.pageX, touch.pageY);
    }
  }

  onTouchEnd(event) {
    event.preventDefault();
    this.stop();
  }

  onTouchMove(event) {
    event.preventDefault();
    if (event.changedTouches.length > 0) {
      let touch = event.changedTouches[0];
      this.move(touch.pageX, touch.pageY);
    }
  }

  render() {
    return React.createElement(
      this.props.type,
      {
        ref: "refdnd",
        id: this.props.id,
        className: this.props.className,
        style: {cursor: 'move', ...this.props.style},
        onMouseDown: event => this.onMouseDown(event),
        onTouchStart: event => this.onTouchStart(event)
      },
      [
        this.props.children,
        this.state.showClone && 
        this.state.isDraging &&
          React.createElement(
            "div",
            {
              id: "dnd",
              key: "dnd",
              className: this.props.className,
              style: {
                ...this.props.style,
                position: "absolute",
                zIndex: 1000,
                left: this.state.evtX - this.state.innerShift[0],
                top: this.state.evtY - this.state.innerShift[1],
                width: this.state.size[0] + "px",
                height: this.state.size[1] + "px",
                opacity: this.state.cloneOpacity
              }
            },
            this.state.elements
          )
      ]
    );
  }
}
