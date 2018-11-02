import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import assert from '../assert';
import TransitionInterpolator from './transition-interpolator';
import { flyToViewport } from 'viewport-mercator-project';
import { isValid, lerp, getEndValueByShortestPath } from './transition-utils';
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
  _inherits(ViewportFlyToInterpolator, _TransitionInterpolat);

  function ViewportFlyToInterpolator() {
    var _this;

    _classCallCheck(this, ViewportFlyToInterpolator);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ViewportFlyToInterpolator).call(this));
    _this.propNames = VIEWPORT_TRANSITION_PROPS;
    return _this;
  }

  _createClass(ViewportFlyToInterpolator, [{
    key: "initializeProps",
    value: function initializeProps(startProps, endProps) {
      var startViewportProps = {};
      var endViewportProps = {}; // Check minimum required props

      for (var _i = 0; _i < REQUIRED_PROPS.length; _i++) {
        var key = REQUIRED_PROPS[_i];
        var startValue = startProps[key];
        var endValue = endProps[key];
        assert(isValid(startValue) && isValid(endValue), "".concat(key, " must be supplied for transition"));
        startViewportProps[key] = startValue;
        endViewportProps[key] = getEndValueByShortestPath(key, startValue, endValue);
      }

      for (var _i2 = 0; _i2 < LINEARLY_INTERPOLATED_PROPS.length; _i2++) {
        var _key = LINEARLY_INTERPOLATED_PROPS[_i2];

        var _startValue = startProps[_key] || 0;

        var _endValue = endProps[_key] || 0;

        startViewportProps[_key] = _startValue;
        endViewportProps[_key] = getEndValueByShortestPath(_key, _startValue, _endValue);
      }

      return {
        start: startViewportProps,
        end: endViewportProps
      };
    }
  }, {
    key: "interpolateProps",
    value: function interpolateProps(startProps, endProps, t) {
      var viewport = flyToViewport(startProps, endProps, t); // Linearly interpolate 'bearing' and 'pitch' if exist.

      for (var _i3 = 0; _i3 < LINEARLY_INTERPOLATED_PROPS.length; _i3++) {
        var key = LINEARLY_INTERPOLATED_PROPS[_i3];
        viewport[key] = lerp(startProps[key], endProps[key], t);
      }

      return viewport;
    }
  }]);

  return ViewportFlyToInterpolator;
}(TransitionInterpolator);

export { ViewportFlyToInterpolator as default };
//# sourceMappingURL=viewport-fly-to-interpolator.js.map