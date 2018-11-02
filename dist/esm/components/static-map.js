import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _createClass from "@babel/runtime/helpers/esm/createClass";
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
import { PureComponent, createElement, createContext, createRef } from 'react';
import PropTypes from 'prop-types';
import { normalizeStyle } from '../utils/style-utils';
import WebMercatorViewport from 'viewport-mercator-project';
import AutoSizer from 'react-virtualized-auto-sizer';
import Mapbox from '../mapbox/mapbox';
import mapboxgl from '../utils/mapboxgl';
import { checkVisibilityConstraints } from '../utils/map-constraints';
/* eslint-disable max-len */

var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

export var StaticContext = createContext({
  viewport: null,
  map: null
});

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;
var CONTAINER_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden'
};
var propTypes = Object.assign({}, Mapbox.propTypes, {
  /** The dimensions of the map **/
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /** Callback when map size changes **/
  onResize: PropTypes.func,

  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: PropTypes.bool,

  /** Hide invalid token warning even if request fails */
  disableTokenWarning: PropTypes.bool,

  /** Whether the map is visible */
  visible: PropTypes.bool,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: PropTypes.object
});
var defaultProps = Object.assign({}, Mapbox.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: undefined,
  onResize: noop
});

var StaticMap =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(StaticMap, _PureComponent);

  _createClass(StaticMap, null, [{
    key: "supported",
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function StaticMap(props) {
    var _this;

    _classCallCheck(this, StaticMap);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(StaticMap).call(this, props));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "getMap", function () {
      return _this._map;
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "queryRenderedFeatures", function (geometry) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _this._map.queryRenderedFeatures(geometry, options);
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_mapboxMapError", function (evt) {
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
    _this._mapboxMapRef = createRef();
    return _this;
  }

  _createClass(StaticMap, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;
      this._mapbox = new Mapbox(Object.assign({}, this.props, {
        mapboxgl: mapboxgl,
        // Handle to mapbox-gl library
        width: this._width,
        height: this._height,
        container: this._mapboxMapRef.current,
        onError: this._mapboxMapError,
        mapStyle: normalizeStyle(mapStyle)
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
        this._map.setStyle(normalizeStyle(mapStyle), {
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
        return createElement('div', {
          key: 'warning',
          id: 'no-token-warning',
          style: style
        }, [createElement('h3', {
          key: 'header'
        }, NO_TOKEN_WARNING), createElement('div', {
          key: 'text'
        }, 'For information on setting up your basemap, read'), createElement('a', {
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
        viewport: new WebMercatorViewport(Object.assign({}, this.props, this.props.viewState, {
          width: width,
          height: height
        })),
        map: this._map
      };
      return createElement(StaticContext.Provider, {
        value: staticContext
      }, createElement('div', {
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
      var visible = this.props.visible && checkVisibilityConstraints(this.props.viewState || this.props, visibilityConstraints);
      var mapStyle = Object.assign({}, CONTAINER_STYLE, visible ? {
        visibility: visible ? 'visible' : 'hidden'
      } : {});
      return createElement('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [createElement('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapRef,
          style: mapStyle,
          className: className
        }), // AutoSizer is a pure component and does not rerender when map props change
        // rebind the callback so that it's triggered every render pass
        createElement(AutoSizer, {
          key: 'autosizer',
          disableWidth: Number.isFinite(width),
          disableHeight: Number.isFinite(height),
          onResize: this.props.onResize
        }, this._renderOverlays.bind(this)), this._renderNoTokenWarning()]
      });
    }
  }]);

  return StaticMap;
}(PureComponent);

export { StaticMap as default };
StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
//# sourceMappingURL=static-map.js.map