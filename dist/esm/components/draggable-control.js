import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _get from "@babel/runtime/helpers/esm/get";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
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
import PropTypes from 'prop-types';
import BaseControl from './base-control';
var propTypes = Object.assign({}, BaseControl.propTypes, {
  draggable: PropTypes.bool,
  onDrag: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragStart: PropTypes.func
});
var defaultProps = Object.assign({}, BaseControl.defaultProps, {
  draggable: false
});

var DraggableControl =
/*#__PURE__*/
function (_BaseControl) {
  _inherits(DraggableControl, _BaseControl);

  function DraggableControl(props) {
    var _this;

    _classCallCheck(this, DraggableControl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DraggableControl).call(this, props));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_onDragStart", function (event) {
      var _this$props = _this.props,
          draggable = _this$props.draggable,
          captureDrag = _this$props.captureDrag;

      if (draggable || captureDrag) {
        event.stopPropagation();
      }

      if (!draggable) {
        return;
      }

      var dragPos = _this._getDragEventPosition(event);

      var dragOffset = _this._getDragEventOffset(event);

      _this.setState({
        dragPos: dragPos,
        dragOffset: dragOffset
      });

      _this._setupDragEvents();

      if (_this.props.onDragStart) {
        event.lngLat = _this._getDragLngLat(dragPos, dragOffset);

        _this.props.onDragStart(event);
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_onDrag", function (event) {
      event.stopPropagation();

      var dragPos = _this._getDragEventPosition(event);

      _this.setState({
        dragPos: dragPos
      });

      if (_this.props.onDrag) {
        event.lngLat = _this._getDragLngLat(dragPos, _this.state.dragOffset);

        _this.props.onDrag(event);
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_onDragEnd", function (event) {
      var _this$state = _this.state,
          dragPos = _this$state.dragPos,
          dragOffset = _this$state.dragOffset;
      event.stopPropagation();

      _this.setState({
        dragPos: null,
        dragOffset: null
      });

      _this._removeDragEvents();

      if (_this.props.onDragEnd) {
        event.lngLat = _this._getDragLngLat(dragPos, dragOffset);

        _this.props.onDragEnd(event);
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_onDragCancel", function (event) {
      event.stopPropagation();

      _this.setState({
        dragPos: null,
        dragOffset: null
      });

      _this._removeDragEvents();
    });

    _this.state = {
      dragPos: null,
      dragOffset: null
    };
    return _this;
  }

  _createClass(DraggableControl, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      _get(_getPrototypeOf(DraggableControl.prototype), "componentWillUnmount", this).call(this);

      this._removeDragEvents();
    }
  }, {
    key: "_setupDragEvents",
    value: function _setupDragEvents() {
      var eventManager = this._context.eventManager;

      if (!eventManager) {
        return;
      } // panstart is already attached by parent class BaseControl,
      // here we just add listeners for subsequent drag events


      this._dragEvents = {
        panmove: this._onDrag,
        panend: this._onDragEnd,
        pancancel: this._onDragCancel
      };
      eventManager.on(this._dragEvents);
    }
  }, {
    key: "_removeDragEvents",
    value: function _removeDragEvents() {
      var eventManager = this._context.eventManager;

      if (!eventManager || !this._dragEvents) {
        return;
      }

      eventManager.off(this._dragEvents);
      this._dragEvents = null;
    }
  }, {
    key: "_getDragEventPosition",
    value: function _getDragEventPosition(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;
      return [x, y];
    }
    /**
     * Returns offset of top-left of marker from drag start event
     * (used for positioning marker relative to next mouse coordinates)
     */

  }, {
    key: "_getDragEventOffset",
    value: function _getDragEventOffset(event) {
      var _event$center = event.center,
          x = _event$center.x,
          y = _event$center.y;

      var rect = this._containerRef.current.getBoundingClientRect();

      return [rect.left - x, rect.top - y];
    }
  }, {
    key: "_getDraggedPosition",
    value: function _getDraggedPosition(dragPos, dragOffset) {
      return [dragPos[0] + dragOffset[0], dragPos[1] + dragOffset[1]];
    }
  }, {
    key: "_getDragLngLat",
    value: function _getDragLngLat(dragPos, dragOffset) {
      return this._context.viewport.unproject(this._getDraggedPosition(dragPos, dragOffset));
    }
  }]);

  return DraggableControl;
}(BaseControl);

export { DraggableControl as default };
DraggableControl.propTypes = propTypes;
DraggableControl.defaultProps = defaultProps;
//# sourceMappingURL=draggable-control.js.map