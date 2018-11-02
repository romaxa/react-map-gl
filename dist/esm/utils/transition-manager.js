import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";

/* global requestAnimationFrame, cancelAnimationFrame */
import assert from './assert';
import { LinearInterpolator } from './transition';
import MapState from './map-state';

var noop = function noop() {};

export var TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};
var DEFAULT_PROPS = {
  transitionDuration: 0,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  onTransitionStart: noop,
  onTransitionInterrupt: noop,
  onTransitionEnd: noop,
  onViewportChange: noop,
  onStateChange: noop
};
var DEFAULT_STATE = {
  animation: null,
  propsInTransition: null,
  startProps: null,
  endProps: null
};

var TransitionManager =
/*#__PURE__*/
function () {
  function TransitionManager(props) {
    _classCallCheck(this, TransitionManager);

    this.props = props;
    this.state = DEFAULT_STATE;
    this._onTransitionFrame = this._onTransitionFrame.bind(this);
  } // Returns current transitioned viewport.


  _createClass(TransitionManager, [{
    key: "getViewportInTransition",
    value: function getViewportInTransition() {
      return this.state.propsInTransition;
    } // Process the viewport change, either ignore or trigger a new transiton.
    // Return true if a new transition is triggered, false otherwise.

  }, {
    key: "processViewportChange",
    value: function processViewportChange(nextProps) {
      var transitionTriggered = false;
      var currentProps = this.props; // Set this.props here as '_triggerTransition' calls '_updateViewport' that uses this.props.

      this.props = nextProps;

      if (!currentProps) {
        return false;
      } // NOTE: Be cautious re-ordering statements in this function.


      if (this._shouldIgnoreViewportChange(currentProps, nextProps)) {
        return transitionTriggered;
      }

      var isTransitionInProgress = this._isTransitionInProgress();

      if (this._isTransitionEnabled(nextProps)) {
        var startProps = Object.assign({}, currentProps, this.state.interruption === TRANSITION_EVENTS.SNAP_TO_END ? this.state.endProps : this.state.propsInTransition);

        if (isTransitionInProgress) {
          currentProps.onTransitionInterrupt();
        }

        nextProps.onTransitionStart();

        this._triggerTransition(startProps, nextProps);

        transitionTriggered = true;
      } else if (isTransitionInProgress) {
        currentProps.onTransitionInterrupt();

        this._endTransition();
      }

      return transitionTriggered;
    } // Helper methods

  }, {
    key: "_isTransitionInProgress",
    value: function _isTransitionInProgress() {
      return Boolean(this.state.propsInTransition);
    }
  }, {
    key: "_isTransitionEnabled",
    value: function _isTransitionEnabled(props) {
      return props.transitionDuration > 0 && Boolean(props.transitionInterpolator);
    }
  }, {
    key: "_isUpdateDueToCurrentTransition",
    value: function _isUpdateDueToCurrentTransition(props) {
      if (this.state.propsInTransition) {
        return this.state.interpolator.arePropsEqual(props, this.state.propsInTransition);
      }

      return false;
    }
  }, {
    key: "_shouldIgnoreViewportChange",
    value: function _shouldIgnoreViewportChange(currentProps, nextProps) {
      if (this._isTransitionInProgress()) {
        // Ignore update if it is requested to be ignored
        return this.state.interruption === TRANSITION_EVENTS.IGNORE || // Ignore update if it is due to current active transition.
        this._isUpdateDueToCurrentTransition(nextProps);
      } else if (this._isTransitionEnabled(nextProps)) {
        // Ignore if none of the viewport props changed.
        return nextProps.transitionInterpolator.arePropsEqual(currentProps, nextProps);
      }

      return true;
    }
  }, {
    key: "_triggerTransition",
    value: function _triggerTransition(startProps, endProps) {
      assert(this._isTransitionEnabled(endProps), 'Transition is not enabled');
      cancelAnimationFrame(this.state.animation);
      var initialProps = endProps.transitionInterpolator.initializeProps(startProps, endProps);
      var interactionState = {
        inTransition: true,
        isZooming: startProps.zoom !== endProps.zoom,
        isPanning: startProps.longitude !== endProps.longitude || startProps.latitude !== endProps.latitude,
        isRotating: startProps.bearing !== endProps.bearing || startProps.pitch !== endProps.pitch
      };
      this.state = {
        // Save current transition props
        duration: endProps.transitionDuration,
        easing: endProps.transitionEasing,
        interpolator: endProps.transitionInterpolator,
        interruption: endProps.transitionInterruption,
        startTime: Date.now(),
        startProps: initialProps.start,
        endProps: initialProps.end,
        animation: null,
        propsInTransition: {},
        interactionState: interactionState
      };

      this._onTransitionFrame();

      this.props.onStateChange(interactionState);
    }
  }, {
    key: "_onTransitionFrame",
    value: function _onTransitionFrame() {
      // _updateViewport() may cancel the animation
      this.state.animation = requestAnimationFrame(this._onTransitionFrame);

      this._updateViewport();
    }
  }, {
    key: "_endTransition",
    value: function _endTransition() {
      cancelAnimationFrame(this.state.animation);
      this.state = DEFAULT_STATE;
      this.props.onStateChange({
        inTransition: false,
        isZooming: false,
        isPanning: false,
        isRotating: false
      });
    }
  }, {
    key: "_updateViewport",
    value: function _updateViewport() {
      // NOTE: Be cautious re-ordering statements in this function.
      var currentTime = Date.now();
      var _this$state = this.state,
          startTime = _this$state.startTime,
          duration = _this$state.duration,
          easing = _this$state.easing,
          interpolator = _this$state.interpolator,
          startProps = _this$state.startProps,
          endProps = _this$state.endProps;
      var shouldEnd = false;
      var t = (currentTime - startTime) / duration;

      if (t >= 1) {
        t = 1;
        shouldEnd = true;
      }

      t = easing(t);
      var viewport = interpolator.interpolateProps(startProps, endProps, t); // Normalize viewport props

      var mapState = new MapState(Object.assign({}, this.props, viewport));
      this.state.propsInTransition = mapState.getViewportProps();
      this.props.onViewportChange(this.state.propsInTransition, this.state.interactionState, this.props);

      if (shouldEnd) {
        this._endTransition();

        this.props.onTransitionEnd();
      }
    }
  }]);

  return TransitionManager;
}();

export { TransitionManager as default };
TransitionManager.defaultProps = DEFAULT_PROPS;
//# sourceMappingURL=transition-manager.js.map