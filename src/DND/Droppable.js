import React from "react";

export default function Droppable(props) {
  return React.createElement(
    props.type,
    { className: "droppable", ...props },
    props.children
  );
}
