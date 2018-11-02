import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _inherits from "@babel/runtime/helpers/esm/inherits";
// Copyright (c) 2015 Uber Technologies, Inc.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import { createElement } from 'react';
import PropTypes from 'prop-types';
import DraggableControl from './draggable-control';
var propTypes = Object.assign({}, DraggableControl.propTypes, {
  // Custom className
  className: PropTypes.string,
  // Longitude of the anchor point
  longitude: PropTypes.number.isRequired,
  // Latitude of the anchor point
  latitude: PropTypes.number.isRequired,
  // Offset from the left
  offsetLeft: PropTypes.number,
  // Offset from the top
  offsetTop: PropTypes.number,
  // Drag and Drop props
  draggable: PropTypes.bool,
  onDrag: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragStart: PropTypes.func
});
var defaultProps = Object.assign({}, DraggableControl.defaultProps, {
  className: '',
  offsetLeft: 0,
  offsetTop: 0
});
/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

var Marker =
/*#__PURE__*/
function (_DraggableControl) {
  _inherits(Marker, _DraggableControl);

  function Marker() {
    _classCallCheck(this, Marker);

    return _possibleConstructorReturn(this, _getPrototypeOf(Marker).apply(this, arguments));
  }

  _createClass(Marker, [{
    key: "_render",
    value: function _render() {
      var _this$props = this.props,
          className = _this$props.className,
          longitude = _this$props.longitude,
          latitude = _this$props.latitude,
          offsetLeft = _this$props.offsetLeft,
          offsetTop = _this$props.offsetTop;
      var _this$state = this.state,
          dragPos = _this$state.dragPos,
          dragOffset = _this$state.dragOffset;

      var _ref = dragPos ? this._getDraggedPosition(dragPos, dragOffset) : this._context.viewport.project([longitude, latitude]),
          _ref2 = _slicedToArray(_ref, 2),
          x = _ref2[0],
          y = _ref2[1];

      var containerStyle = {
        position: 'absolute',
        left: x + offsetLeft,
        top: y + offsetTop
      };
      return createElement('div', {
        className: "mapboxgl-marker ".concat(className),
        ref: this._containerRef,
        style: containerStyle,
        children: this.props.children
      });
    }
  }]);

  return Marker;
}(DraggableControl);

export { Marker as default };
Marker.displayName = 'Marker';
Marker.propTypes = propTypes;
Marker.defaultProps = defaultProps;
//# sourceMappingURL=marker.js.map