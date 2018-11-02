"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.StaticContext = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = require("react");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styleUtils = require("../utils/style-utils");

var _viewportMercatorProject = _interopRequireDefault(require("viewport-mercator-project"));

var _reactVirtualizedAutoSizer = _interopRequireDefault(require("react-virtualized-auto-sizer"));

var _mapbox = _interopRequireDefault(require("../mapbox/mapbox"));

var _mapboxgl = _interopRequireDefault(require("../utils/mapboxgl"));

var _mapConstraints = require("../utils/map-constraints");

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

/* eslint-disable max-len */
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

var StaticContext = (0, _react.createContext)({
  viewport: null,
  map: null
});
exports.StaticContext = StaticContext;

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;
var CONTAINER_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden'
};
var propTypes = Object.assign({}, _mapbox.default.propTypes, {
  /** The dimensions of the map **/
  width: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  height: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),

  /** Callback when map size changes **/
  onResize: _propTypes.default.func,

  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object]),

  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: _propTypes.default.bool,

  /** Hide invalid token warning even if request fails */
  disableTokenWarning: _propTypes.default.bool,

  /** Whether the map is visible */
  visible: _propTypes.default.bool,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: _propTypes.default.object
});
var defaultProps = Object.assign({}, _mapbox.default.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: undefined,
  onResize: noop
});

var StaticMap =
/*#__PURE__*/
function (_PureComponent) {
  (0, _inherits2.default)(StaticMap, _PureComponent);
  (0, _createClass2.default)(StaticMap, null, [{
    key: "supported",
    value: function supported() {
      return _mapboxgl.default && _mapboxgl.default.supported();
    }
  }]);

  function StaticMap(props) {
    var _this;

    (0, _classCallCheck2.default)(this, StaticMap);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(StaticMap).call(this, props));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "getMap", function () {
      return _this._map;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "queryRenderedFeatures", function (geometry) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _this._map.queryRenderedFeatures(geometry, options);
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_mapboxMapError", function (evt) {
      var statusCode = evt.error && evt.error.status || evt.status;

      if (statusCode === UNAUTHORIZED_ERROR_CODE && !_this.state.accessTokenInvalid) {
        // Mapbox throws unauthorized error - invalid token
        console.error(NO_TOKEN_WARNING); // eslint-disable-line

        _this.setState({
          accessTokenInvalid: true
        });
      }
    });
    _this._queryParams = {};

    if (!StaticMap.supported()) {
      _this.componentDidMount = noop;
      _this.componentWillReceiveProps = noop;
      _this.componentDidUpdate = noop;
      _this.componentWillUnmount = noop;
    }

    _this.state = {
      accessTokenInvalid: false
    };
    _this._width = 0;
    _this._height = 0;
    _this._mapboxMapRef = (0, _react.createRef)();
    return _this;
  }

  (0, _createClass2.default)(StaticMap, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;
      this._mapbox = new _mapbox.default(Object.assign({}, this.props, {
        mapboxgl: _mapboxgl.default,
        // Handle to mapbox-gl library
        width: this._width,
        height: this._height,
        container: this._mapboxMapRef.current,
        onError: this._mapboxMapError,
        mapStyle: (0, _styleUtils.normalizeStyle)(mapStyle)
      }));
      this._map = this._mapbox.getMap();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      this._updateMapStyle(prevProps, this.props);

      this._updateMapProps(this.props);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this._mapbox.finalize();

      this._mapbox = null;
      this._map = null;
    } // External apps can access map this way

  }, {
    key: "_updateMapSize",
    // Note: needs to be called after render (e.g. in componentDidUpdate)
    value: function _updateMapSize(width, height) {
      if (this._width !== width || this._height !== height) {
        this._width = width;
        this._height = height;

        this._updateMapProps(this.props);
      }
    }
  }, {
    key: "_updateMapStyle",
    value: function _updateMapStyle(oldProps, newProps) {
      var mapStyle = newProps.mapStyle;
      var oldMapStyle = oldProps.mapStyle;

      if (mapStyle !== oldMapStyle) {
        this._map.setStyle((0, _styleUtils.normalizeStyle)(mapStyle), {
          diff: !this.props.preventStyleDiffing
        });
      }
    }
  }, {
    key: "_updateMapProps",
    value: function _updateMapProps(props) {
      if (!this._mapbox) {
        return;
      }

      this._mapbox.setProps(Object.assign({}, props, {
        width: this._width,
        height: this._height
      }));
    } // Handle map error

  }, {
    key: "_renderNoTokenWarning",
    value: function _renderNoTokenWarning() {
      if (this.state.accessTokenInvalid && !this.props.disableTokenWarning) {
        var style = {
          position: 'absolute',
          left: 0,
          top: 0
        };
        return (0, _react.createElement)('div', {
          key: 'warning',
          id: 'no-token-warning',
          style: style
        }, [(0, _react.createElement)('h3', {
          key: 'header'
        }, NO_TOKEN_WARNING), (0, _react.createElement)('div', {
          key: 'text'
        }, 'For information on setting up your basemap, read'), (0, _react.createElement)('a', {
          key: 'link',
          href: TOKEN_DOC_URL
        }, 'Note on Map Tokens')]);
      }

      return null;
    }
  }, {
    key: "_renderOverlays",
    value: function _renderOverlays(dimensions) {
      var _dimensions$width = dimensions.width,
          width = _dimensions$width === void 0 ? this.props.width : _dimensions$width,
          _dimensions$height = dimensions.height,
          height = _dimensions$height === void 0 ? this.props.height : _dimensions$height;

      this._updateMapSize(width, height);

      var staticContext = {
        viewport: new _viewportMercatorProject.default(Object.assign({}, this.props, this.props.viewState, {
          width: width,
          height: height
        })),
        map: this._map
      };
      return (0, _react.createElement)(StaticContext.Provider, {
        value: staticContext
      }, (0, _react.createElement)('div', {
        key: 'map-overlays',
        className: 'overlays',
        style: CONTAINER_STYLE,
        children: this.props.children
      }));
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          className = _this$props.className,
          width = _this$props.width,
          height = _this$props.height,
          style = _this$props.style,
          visibilityConstraints = _this$props.visibilityConstraints;
      var mapContainerStyle = Object.assign({
        position: 'relative'
      }, style, {
        width: width,
        height: height
      });
      var visible = this.props.visible && (0, _mapConstraints.checkVisibilityConstraints)(this.props.viewState || this.props, visibilityConstraints);
      var mapStyle = Object.assign({}, CONTAINER_STYLE, visible ? {
        visibility: visible ? 'visible' : 'hidden'
      } : {});
      return (0, _react.createElement)('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [(0, _react.createElement)('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapRef,
          style: mapStyle,
          className: className
        }), // AutoSizer is a pure component and does not rerender when map props change
        // rebind the callback so that it's triggered every render pass
        (0, _react.createElement)(_reactVirtualizedAutoSizer.default, {
          key: 'autosizer',
          disableWidth: Number.isFinite(width),
          disableHeight: Number.isFinite(height),
          onResize: this.props.onResize
        }, this._renderOverlays.bind(this)), this._renderNoTokenWarning()]
      });
    }
  }]);
  return StaticMap;
}(_react.PureComponent);

exports.default = StaticMap;
StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
//# sourceMappingURL=static-map.js.map