"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAccessToken = getAccessToken;
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _globals = require("../utils/globals");

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

/* global window, process, HTMLCanvasElement */
function noop() {}

var propTypes = {
  // Creation parameters
  container: _propTypes.default.object,

  /** The container to have the map. */
  mapboxApiAccessToken: _propTypes.default.string,

  /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: _propTypes.default.bool,

  /** Show attribution control or not. */
  preserveDrawingBuffer: _propTypes.default.bool,

  /** Useful when you want to export the canvas as a PNG. */
  onLoad: _propTypes.default.func,

  /** The onLoad callback for the map */
  onError: _propTypes.default.func,

  /** The onError callback for the map */
  reuseMaps: _propTypes.default.bool,
  reuseMap: _propTypes.default.bool,
  transformRequest: _propTypes.default.func,

  /** The transformRequest callback for the map */
  mapStyle: _propTypes.default.string,

  /** The Mapbox style. A string url to a MapboxGL style */
  visible: _propTypes.default.bool,

  /** Whether the map is visible */
  // Map view state
  width: _propTypes.default.number,

  /** The width of the map. */
  height: _propTypes.default.number,

  /** The height of the map. */
  viewState: _propTypes.default.object,

  /** object containing lng/lat/zoom/bearing/pitch */
  longitude: _propTypes.default.number,

  /** The longitude of the center of the map. */
  latitude: _propTypes.default.number,

  /** The latitude of the center of the map. */
  zoom: _propTypes.default.number,

  /** The tile zoom level of the map. */
  bearing: _propTypes.default.number,

  /** Specify the bearing of the viewport */
  pitch: _propTypes.default.number,

  /** Specify the pitch of the viewport */
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: _propTypes.default.number,

  /** Altitude of the viewport camera. Default 1.5 "screen heights" */
  mapOptions: _propTypes.default.object
  /** Extra options to pass to Mapbox constructor. See #545. **/

};
var defaultProps = {
  container: _globals.document.body,
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  preventStyleDiffing: false,
  onLoad: noop,
  onError: noop,
  reuseMaps: false,
  reuseMap: false,
  transformRequest: null,
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  visible: true,
  bearing: 0,
  pitch: 0,
  altitude: 1.5,
  width: 0,
  height: 0,
  mapOptions: {}
}; // Try to get access token from URL, env, local storage or config

function getAccessToken() {
  var accessToken = null;

  if (typeof window !== 'undefined' && window.location) {
    var match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken && typeof process !== 'undefined') {
    // Note: This depends on bundler plugins (e.g. webpack) importing environment correctly
    accessToken = accessToken || process.env.MapboxAccessToken || process.env.REACT_APP_MAPBOX_ACCESS_TOKEN; // eslint-disable-line
  }

  return accessToken || null;
} // Helper function to merge defaultProps and check prop types


function checkPropTypes(props) {
  var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'component';

  // TODO - check for production (unless done by prop types package?)
  if (props.debug) {
    _propTypes.default.checkPropTypes(propTypes, props, 'prop', component);
  }
} // A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development


var Mapbox =
/*#__PURE__*/
function () {
  function Mapbox(props) {
    (0, _classCallCheck2.default)(this, Mapbox);

    if (!props.mapboxgl) {
      throw new Error('Mapbox not available');
    }

    if (!Mapbox.initialized && console.debug) {
      // eslint-disable-line
      Mapbox.initialized = true; // Version detection using babel plugin

      /* global __VERSION__ */

      var VERSION = typeof "4.0.0-beta.4" !== 'undefined' ? "4.0.0-beta.4" : 'untranspiled source';
      console.debug("react-map-gl: ".concat(VERSION, " using mapbox-gl v").concat(props.mapboxgl.version)); // eslint-disable-line

      this._checkStyleSheet(props.mapboxgl.version);
    }

    this.props = {};

    this._initialize(props);
  }

  (0, _createClass2.default)(Mapbox, [{
    key: "finalize",
    value: function finalize() {
      this._destroy();

      return this;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      this._update(this.props, props);

      return this;
    } // Mapbox's map.resize() reads size from DOM, so DOM element must already be resized
    // In a system like React we must wait to read size until after render
    // (e.g. until "componentDidUpdate")

  }, {
    key: "resize",
    value: function resize() {
      this._map.resize(); // map render will throw error if style is not loaded


      if (this._map.isStyleLoaded()) {
        this._map._render();
      }

      return this;
    } // External apps can access map this way

  }, {
    key: "getMap",
    value: function getMap() {
      return this._map;
    } // PRIVATE API

  }, {
    key: "_create",
    value: function _create(props) {
      // Reuse a saved map, if available
      if ((props.reuseMaps || props.reuseMap) && Mapbox.savedMap) {
        this._map = this.map = Mapbox.savedMap; // When reusing the saved map, we need to reparent the map(canvas) and other child nodes
        // intoto the new container from the props.
        // Step1: reparenting child nodes from old container to new container

        var oldContainer = this._map.getContainer();

        var newContainer = props.container;
        newContainer.classList.add('mapboxgl-map');

        while (oldContainer.childNodes.length > 0) {
          newContainer.appendChild(oldContainer.childNodes[0]);
        } // Step2: replace the internal container with new container from the react component


        this._map._container = newContainer;
        Mapbox.savedMap = null; // Update style

        if (props.mapStyle) {
          this._map.setStyle(props.mapStyle);
        } // TODO - need to call onload again, need to track with Promise?


        props.onLoad();
      } else {
        if (props.gl) {
          var getContext = HTMLCanvasElement.prototype.getContext; // Hijack canvas.getContext to return our own WebGLContext
          // This will be called inside the mapboxgl.Map constructor

          HTMLCanvasElement.prototype.getContext = function () {
            // Unhijack immediately
            HTMLCanvasElement.prototype.getContext = getContext;
            return props.gl;
          };
        }

        var mapOptions = {
          container: props.container,
          center: [0, 0],
          zoom: 8,
          pitch: 0,
          bearing: 0,
          style: props.mapStyle,
          interactive: false,
          trackResize: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer
        }; // We don't want to pass a null or no-op transformRequest function.

        if (props.transformRequest) {
          mapOptions.transformRequest = props.transformRequest;
        }

        this._map = this.map = new props.mapboxgl.Map(Object.assign({}, mapOptions, props.mapOptions)); // Attach optional onLoad function

        this.map.once('load', props.onLoad);
        this.map.on('error', props.onError);
      }

      return this;
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      if (!this._map) {
        return;
      }

      if (!Mapbox.savedMap) {
        Mapbox.savedMap = this._map;
      } else {
        this._map.remove();
      }

      this._map = null;
    }
  }, {
    key: "_initialize",
    value: function _initialize(props) {
      var _this = this;

      props = Object.assign({}, defaultProps, props);
      checkPropTypes(props, 'Mapbox'); // Make empty string pick up default prop

      this.accessToken = props.mapboxApiAccessToken || defaultProps.mapboxApiAccessToken; // Creation only props

      if (props.mapboxgl) {
        if (!this.accessToken) {
          props.mapboxgl.accessToken = 'no-token'; // Prevents mapbox from throwing
        } else {
          props.mapboxgl.accessToken = this.accessToken;
        }
      }

      this._create(props); // Hijack dimension properties
      // This eliminates the timing issue between calling resize() and DOM update

      /* eslint-disable accessor-pairs */


      var _props = props,
          container = _props.container;
      Object.defineProperty(container, 'offsetWidth', {
        get: function get() {
          return _this.width;
        }
      });
      Object.defineProperty(container, 'clientWidth', {
        get: function get() {
          return _this.width;
        }
      });
      Object.defineProperty(container, 'offsetHeight', {
        get: function get() {
          return _this.height;
        }
      });
      Object.defineProperty(container, 'clientHeight', {
        get: function get() {
          return _this.height;
        }
      }); // Disable outline style

      var canvas = this.map.getCanvas();

      if (canvas) {
        canvas.style.outline = 'none';
      }

      this._updateMapViewport({}, props);

      this._updateMapSize({}, props);

      this.props = props;
    }
  }, {
    key: "_update",
    value: function _update(oldProps, newProps) {
      if (!this._map) {
        return;
      }

      newProps = Object.assign({}, this.props, newProps);
      checkPropTypes(newProps, 'Mapbox');

      this._updateMapViewport(oldProps, newProps);

      this._updateMapSize(oldProps, newProps);

      this.props = newProps;
    } // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: "_updateMapSize",
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;

      if (sizeChanged) {
        this.width = newProps.width;
        this.height = newProps.height;
        this.resize();
      }
    }
  }, {
    key: "_updateMapViewport",
    value: function _updateMapViewport(oldProps, newProps) {
      var oldViewState = this._getViewState(oldProps);

      var newViewState = this._getViewState(newProps);

      var viewportChanged = newViewState.latitude !== oldViewState.latitude || newViewState.longitude !== oldViewState.longitude || newViewState.zoom !== oldViewState.zoom || newViewState.pitch !== oldViewState.pitch || newViewState.bearing !== oldViewState.bearing || newViewState.altitude !== oldViewState.altitude;

      if (viewportChanged) {
        this._map.jumpTo(this._getMapboxViewStateProps(newProps)); // TODO - jumpTo doesn't handle altitude


        if (newViewState.altitude !== oldViewState.altitude) {
          this._map.transform.altitude = newViewState.altitude;
        }
      }
    }
  }, {
    key: "_getViewState",
    value: function _getViewState(props) {
      var _ref = props.viewState || props,
          longitude = _ref.longitude,
          latitude = _ref.latitude,
          zoom = _ref.zoom,
          _ref$pitch = _ref.pitch,
          pitch = _ref$pitch === void 0 ? 0 : _ref$pitch,
          _ref$bearing = _ref.bearing,
          bearing = _ref$bearing === void 0 ? 0 : _ref$bearing,
          _ref$altitude = _ref.altitude,
          altitude = _ref$altitude === void 0 ? 1.5 : _ref$altitude;

      return {
        longitude: longitude,
        latitude: latitude,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        altitude: altitude
      };
    }
  }, {
    key: "_checkStyleSheet",
    value: function _checkStyleSheet() {
      var mapboxVersion = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '0.47.0';

      if (typeof _globals.document === 'undefined') {
        return;
      } // check mapbox styles


      try {
        var testElement = _globals.document.createElement('div');

        testElement.className = 'mapboxgl-map';
        testElement.style.display = 'none';

        _globals.document.body.append(testElement);

        var isCssLoaded = window.getComputedStyle(testElement).position !== 'static';

        if (!isCssLoaded) {
          // attempt to insert mapbox stylesheet
          var link = _globals.document.createElement('link');

          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('type', 'text/css');
          link.setAttribute('href', "https://api.tiles.mapbox.com/mapbox-gl-js/v".concat(mapboxVersion, "/mapbox-gl.css"));

          _globals.document.head.append(link);
        }
      } catch (error) {// do nothing
      }
    }
  }, {
    key: "_getMapboxViewStateProps",
    value: function _getMapboxViewStateProps(props) {
      var viewState = this._getViewState(props);

      return {
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch,
        width: props.width,
        height: props.height
      };
    }
  }]);
  return Mapbox;
}();

exports.default = Mapbox;
Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=mapbox.js.map