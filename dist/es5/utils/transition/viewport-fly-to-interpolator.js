"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assert = _interopRequireDefault(require("../assert"));

var _transitionInterpolator = _interopRequireDefault(require("./transition-interpolator"));

var _viewportMercatorProject = require("viewport-mercator-project");

var _transitionUtils = require("./transition-utils");

var VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
var REQUIRED_PROPS = ['latitude', 'longitude', 'zoom', 'width', 'height'];
var LINEARLY_INTERPOLATED_PROPS = ['bearing', 'pitch'];
/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
*/

var ViewportFlyToInterpolator =
/*#__PURE__*/
function (_TransitionInterpolat) {
  (0, _inherits2.default)(ViewportFlyToInterpolator, _TransitionInterpolat);

  function ViewportFlyToInterpolator() {
    var _this;

    (0, _classCallCheck2.default)(this, ViewportFlyToInterpolator);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ViewportFlyToInterpolator).call(this));
    _this.propNames = VIEWPORT_TRANSITION_PROPS;
    return _this;
  }

  (0, _createClass2.default)(ViewportFlyToInterpolator, [{
    key: "initializeProps",
    value: function initializeProps(startProps, endProps) {
      var startViewportProps = {};
      var endViewportProps = {}; // Check minimum required props

      for (var _i = 0; _i < REQUIRED_PROPS.length; _i++) {
        var key = REQUIRED_PROPS[_i];
        var startValue = startProps[key];
        var endValue = endProps[key];
        (0, _assert.default)((0, _transitionUtils.isValid)(startValue) && (0, _transitionUtils.isValid)(endValue), "".concat(key, " must be supplied for transition"));
        startViewportProps[key] = startValue;
        endViewportProps[key] = (0, _transitionUtils.getEndValueByShortestPath)(key, startValue, endValue);
      }

      for (var _i2 = 0; _i2 < LINEARLY_INTERPOLATED_PROPS.length; _i2++) {
        var _key = LINEARLY_INTERPOLATED_PROPS[_i2];

        var _startValue = startProps[_key] || 0;

        var _endValue = endProps[_key] || 0;

        startViewportProps[_key] = _startValue;
        endViewportProps[_key] = (0, _transitionUtils.getEndValueByShortestPath)(_key, _startValue, _endValue);
      }

      return {
        start: startViewportProps,
        end: endViewportProps
      };
    }
  }, {
    key: "interpolateProps",
    value: function interpolateProps(startProps, endProps, t) {
      var viewport = (0, _viewportMercatorProject.flyToViewport)(startProps, endProps, t); // Linearly interpolate 'bearing' and 'pitch' if exist.

      for (var _i3 = 0; _i3 < LINEARLY_INTERPOLATED_PROPS.length; _i3++) {
        var key = LINEARLY_INTERPOLATED_PROPS[_i3];
        viewport[key] = (0, _transitionUtils.lerp)(startProps[key], endProps[key], t);
      }

      return viewport;
    }
  }]);
  return ViewportFlyToInterpolator;
}(_transitionInterpolator.default);

exports.default = ViewportFlyToInterpolator;
//# sourceMappingURL=viewport-fly-to-interpolator.js.map