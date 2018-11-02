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

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _viewportMercatorProject = _interopRequireDefault(require("viewport-mercator-project"));

var _assert = _interopRequireDefault(require("../assert"));

var _transitionInterpolator = _interopRequireDefault(require("./transition-interpolator"));

var _transitionUtils = require("./transition-utils");

var VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
/**
 * Performs linear interpolation of two viewports.
*/

var LinearInterpolator =
/*#__PURE__*/
function (_TransitionInterpolat) {
  (0, _inherits2.default)(LinearInterpolator, _TransitionInterpolat);

  /**
   * @param opts {Object}
   *  - opts.transitionProps {Array}] - list of props to apply linear transition to.
   *  - opts.around {Array} - a screen point to zoom/rotate around
   */
  function LinearInterpolator() {
    var _this;

    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2.default)(this, LinearInterpolator);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LinearInterpolator).call(this));

    if (Array.isArray(opts)) {
      // backward compatibility
      opts = {
        transitionProps: opts
      };
    }

    _this.propNames = opts.transitionProps || VIEWPORT_TRANSITION_PROPS;
    _this.around = opts.around;
    return _this;
  }

  (0, _createClass2.default)(LinearInterpolator, [{
    key: "initializeProps",
    value: function initializeProps(startProps, endProps) {
      var startViewportProps = {};
      var endViewportProps = {};

      if (this.around) {
        Object.assign(endViewportProps, endProps, {
          around: this.around,
          aroundLngLat: new _viewportMercatorProject.default(endProps).unproject(this.around)
        });
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.propNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;
          var startValue = startProps[key];
          var endValue = endProps[key];
          (0, _assert.default)((0, _transitionUtils.isValid)(startValue) && (0, _transitionUtils.isValid)(endValue), "".concat(key, " must be supplied for transition"));
          startViewportProps[key] = startValue;
          endViewportProps[key] = (0, _transitionUtils.getEndValueByShortestPath)(key, startValue, endValue);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return {
        start: startViewportProps,
        end: endViewportProps
      };
    }
  }, {
    key: "interpolateProps",
    value: function interpolateProps(startProps, endProps, t) {
      var viewport = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.propNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var key = _step2.value;
          viewport[key] = (0, _transitionUtils.lerp)(startProps[key], endProps[key], t);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (endProps.around) {
        // zoom around provided point
        var _getMapCenterByLngLat = new _viewportMercatorProject.default(Object.assign({}, endProps, viewport)).getMapCenterByLngLatPosition({
          lngLat: endProps.aroundLngLat,
          pos: endProps.around
        }),
            _getMapCenterByLngLat2 = (0, _slicedToArray2.default)(_getMapCenterByLngLat, 2),
            longitude = _getMapCenterByLngLat2[0],
            latitude = _getMapCenterByLngLat2[1];

        viewport.longitude = longitude;
        viewport.latitude = latitude;
      }

      return viewport;
    }
  }]);
  return LinearInterpolator;
}(_transitionInterpolator.default);

exports.default = LinearInterpolator;
//# sourceMappingURL=linear-interpolator.js.map