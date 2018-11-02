"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = require("react");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _baseControl = _interopRequireDefault(require("./base-control"));

var _dynamicPosition = require("../utils/dynamic-position");

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
var propTypes = Object.assign({}, _baseControl.default.propTypes, {
  // Custom className
  className: _propTypes.default.string,
  // Longitude of the anchor point
  longitude: _propTypes.default.number.isRequired,
  // Latitude of the anchor point
  latitude: _propTypes.default.number.isRequired,
  // Altitude of the anchor point
  altitude: _propTypes.default.number,
  // Offset from the left
  offsetLeft: _propTypes.default.number,
  // Offset from the top
  offsetTop: _propTypes.default.number,
  // Size of the tip
  tipSize: _propTypes.default.number,
  // Whether to show close button
  closeButton: _propTypes.default.bool,
  // Whether to close on click
  closeOnClick: _propTypes.default.bool,
  // The popup's location relative to the coordinate
  anchor: _propTypes.default.oneOf(Object.keys(_dynamicPosition.ANCHOR_POSITION)),
  // Whether the popup anchor should be auto-adjusted to fit within the container
  dynamicPosition: _propTypes.default.bool,
  // Whether popups should be sorted by depth. Useful when using multiple popups with tilted map.
  sortByDepth: _propTypes.default.bool,
  // Callback when component is closed
  onClose: _propTypes.default.func
});
var defaultProps = Object.assign({}, _baseControl.default.defaultProps, {
  className: '',
  altitude: 0,
  offsetLeft: 0,
  offsetTop: 0,
  tipSize: 10,
  anchor: 'bottom',
  dynamicPosition: true,
  sortByDepth: false,
  closeButton: true,
  closeOnClick: true,
  onClose: function onClose() {}
});
/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the popup's position when the parent re-renders.
 */

var Popup =
/*#__PURE__*/
function (_BaseControl) {
  (0, _inherits2.default)(Popup, _BaseControl);

  function Popup(props) {
    var _this;

    (0, _classCallCheck2.default)(this, Popup);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Popup).call(this, props));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onClick", function (evt) {
      if (_this.props.captureClick) {
        evt.stopPropagation();
      }

      if (_this.props.closeOnClick || _this._closeOnClick) {
        _this.props.onClose();
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onClose", function () {
      _this._closeOnClick = true;
    });
    _this._closeOnClick = false;
    _this._contentRef = (0, _react.createRef)();
    return _this;
  }

  (0, _createClass2.default)(Popup, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      (0, _get2.default)((0, _getPrototypeOf2.default)(Popup.prototype), "componentDidMount", this).call(this); // Container just got a size, re-calculate position

      this.forceUpdate();
    }
  }, {
    key: "_getPosition",
    value: function _getPosition(x, y) {
      var viewport = this._context.viewport;
      var _this$props = this.props,
          anchor = _this$props.anchor,
          dynamicPosition = _this$props.dynamicPosition,
          tipSize = _this$props.tipSize;
      var content = this._contentRef.current;

      if (content) {
        return dynamicPosition ? (0, _dynamicPosition.getDynamicPosition)({
          x: x,
          y: y,
          anchor: anchor,
          padding: tipSize,
          width: viewport.width,
          height: viewport.height,
          selfWidth: content.clientWidth,
          selfHeight: content.clientHeight
        }) : anchor;
      }

      return anchor;
    }
  }, {
    key: "_getContainerStyle",
    value: function _getContainerStyle(x, y, z, positionType) {
      var viewport = this._context.viewport;
      var _this$props2 = this.props,
          offsetLeft = _this$props2.offsetLeft,
          offsetTop = _this$props2.offsetTop,
          sortByDepth = _this$props2.sortByDepth;
      var anchorPosition = _dynamicPosition.ANCHOR_POSITION[positionType];
      var style = {
        position: 'absolute',
        left: x + offsetLeft,
        top: y + offsetTop,
        transform: "translate(".concat(-anchorPosition.x * 100, "%, ").concat(-anchorPosition.y * 100, "%)")
      };

      if (!sortByDepth) {
        return style;
      }

      if (z > 1 || z < -1 || x < 0 || x > viewport.width || y < 0 || y > viewport.height) {
        // clipped
        style.display = 'none';
      } else {
        // use z-index to rearrange components
        style.zIndex = Math.floor((1 - z) / 2 * 100000);
      }

      return style;
    }
    /*
     * Hack -
     * React's `onClick` is called before mjolnir.js' `click` event (aka `tap` from hammer.js)
     * which has a configurable delay.
     * If we close the popup on the React event, by the time `click` fires, this component will
     * have been unmounted, thus `captureClick` will not work.
     * Instead, we flag the popup as closed on the React event, and actually close it on the hammer.js
     * event.
     */

  }, {
    key: "_renderTip",
    value: function _renderTip(positionType) {
      var tipSize = this.props.tipSize;
      return (0, _react.createElement)('div', {
        key: 'tip',
        className: 'mapboxgl-popup-tip',
        style: {
          borderWidth: tipSize
        }
      });
    }
  }, {
    key: "_renderContent",
    value: function _renderContent() {
      var _this$props3 = this.props,
          closeButton = _this$props3.closeButton,
          children = _this$props3.children;
      return (0, _react.createElement)('div', {
        key: 'content',
        ref: this._contentRef,
        className: 'mapboxgl-popup-content'
      }, [closeButton && (0, _react.createElement)('button', {
        key: 'close-button',
        className: 'mapboxgl-popup-close-button',
        type: 'button',
        onClick: this._onClose
      }, '×'), children]);
    }
  }, {
    key: "_render",
    value: function _render() {
      var _this$props4 = this.props,
          className = _this$props4.className,
          longitude = _this$props4.longitude,
          latitude = _this$props4.latitude,
          altitude = _this$props4.altitude;

      var _this$_context$viewpo = this._context.viewport.project([longitude, latitude, altitude]),
          _this$_context$viewpo2 = (0, _slicedToArray2.default)(_this$_context$viewpo, 3),
          x = _this$_context$viewpo2[0],
          y = _this$_context$viewpo2[1],
          z = _this$_context$viewpo2[2];

      var positionType = this._getPosition(x, y);

      var containerStyle = this._getContainerStyle(x, y, z, positionType);

      return (0, _react.createElement)('div', {
        className: "mapboxgl-popup mapboxgl-popup-anchor-".concat(positionType, " ").concat(className),
        style: containerStyle,
        ref: this._containerRef
      }, [this._renderTip(positionType), this._renderContent()]);
    }
  }]);
  return Popup;
}(_baseControl.default);

exports.default = Popup;
Popup.displayName = 'Popup';
Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;
//# sourceMappingURL=popup.js.map