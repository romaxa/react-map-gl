"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.InteractiveContext = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = require("react");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _staticMap = _interopRequireDefault(require("./static-map"));

var _mapState = require("../utils/map-state");

var _viewportMercatorProject = _interopRequireDefault(require("viewport-mercator-project"));

var _transitionManager = _interopRequireDefault(require("../utils/transition-manager"));

var _mjolnir = require("mjolnir.js");

var _mapController = _interopRequireDefault(require("../utils/map-controller"));

var _config = _interopRequireDefault(require("../config"));

var _deprecateWarn = _interopRequireDefault(require("../utils/deprecate-warn"));

var InteractiveContext = (0, _react.createContext)({
  eventManager: null,
  isDragging: false
});
exports.InteractiveContext = InteractiveContext;
var propTypes = Object.assign({}, _staticMap.default.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: _propTypes.default.number,
  // Min zoom level
  minZoom: _propTypes.default.number,
  // Max pitch in degrees
  maxPitch: _propTypes.default.number,
  // Min pitch in degrees
  minPitch: _propTypes.default.number,
  // Callbacks fired when the user interacted with the map. The object passed to the callbacks
  // contains viewport properties such as `longitude`, `latitude`, `zoom` etc.
  onViewStateChange: _propTypes.default.func,
  onViewportChange: _propTypes.default.func,
  onInteractionStateChange: _propTypes.default.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: _propTypes.default.number,
  // TransitionInterpolator instance, can be used to perform custom transitions.
  transitionInterpolator: _propTypes.default.object,
  // type of interruption of current transition on update.
  transitionInterruption: _propTypes.default.number,
  // easing function
  transitionEasing: _propTypes.default.func,
  // transition status update functions
  onTransitionStart: _propTypes.default.func,
  onTransitionInterrupt: _propTypes.default.func,
  onTransitionEnd: _propTypes.default.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: _propTypes.default.bool,
  // Drag to pan
  dragPan: _propTypes.default.bool,
  // Drag to rotate
  dragRotate: _propTypes.default.bool,
  // Double click to zoom
  doubleClickZoom: _propTypes.default.bool,
  // Multitouch zoom
  touchZoom: _propTypes.default.bool,
  // Multitouch rotate
  touchRotate: _propTypes.default.bool,
  // Keyboard
  keyboard: _propTypes.default.bool,

  /** Event callbacks */
  onHover: _propTypes.default.func,
  onClick: _propTypes.default.func,
  onDblClick: _propTypes.default.func,
  onContextMenu: _propTypes.default.func,
  onMouseDown: _propTypes.default.func,
  onMouseMove: _propTypes.default.func,
  onMouseUp: _propTypes.default.func,
  onTouchStart: _propTypes.default.func,
  onTouchMove: _propTypes.default.func,
  onTouchEnd: _propTypes.default.func,
  onMouseEnter: _propTypes.default.func,
  onMouseLeave: _propTypes.default.func,
  onMouseOut: _propTypes.default.func,
  onWheel: _propTypes.default.func,

  /** Custom touch-action CSS for the event canvas. Defaults to 'none' */
  touchAction: _propTypes.default.string,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: _propTypes.default.number,

  /** List of layers that are interactive */
  interactiveLayerIds: _propTypes.default.array,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: _propTypes.default.func,
  // A map control instance to replace the default map controller
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  controller: _propTypes.default.shape({
    events: _propTypes.default.arrayOf(_propTypes.default.string),
    handleEvent: _propTypes.default.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? _config.default.CURSOR.GRABBING : isHovering ? _config.default.CURSOR.POINTER : _config.default.CURSOR.GRAB;
};

var defaultProps = Object.assign({}, _staticMap.default.defaultProps, _mapState.MAPBOX_LIMITS, _transitionManager.default.defaultProps, {
  onViewStateChange: null,
  onViewportChange: null,
  onClick: null,
  onHover: null,
  onContextMenu: function onContextMenu(event) {
    return event.preventDefault();
  },
  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchAction: 'none',
  clickRadius: 0,
  getCursor: getDefaultCursor
});

var InteractiveMap =
/*#__PURE__*/
function (_PureComponent) {
  (0, _inherits2.default)(InteractiveMap, _PureComponent);
  (0, _createClass2.default)(InteractiveMap, null, [{
    key: "supported",
    value: function supported() {
      return _staticMap.default.supported();
    }
  }]);

  function InteractiveMap(props) {
    var _this;

    (0, _classCallCheck2.default)(this, InteractiveMap);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(InteractiveMap).call(this, props)); // Check for deprecated props

    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "getMap", function () {
      return _this._staticMapRef.current ? _this._staticMapRef.current.getMap() : null;
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "queryRenderedFeatures", function (geometry, options) {
      return _this.getMap().queryRenderedFeatures(geometry, options);
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onInteractionStateChange", function (interactionState) {
      var _interactionState$isD = interactionState.isDragging,
          isDragging = _interactionState$isD === void 0 ? false : _interactionState$isD;

      if (isDragging !== _this.state.isDragging) {
        _this.setState({
          isDragging: isDragging
        });
      }

      var onInteractionStateChange = _this.props.onInteractionStateChange;

      if (onInteractionStateChange) {
        onInteractionStateChange(interactionState);
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onResize", function (_ref2) {
      var width = _ref2.width,
          height = _ref2.height;
      _this._width = width;
      _this._height = height;

      _this._setControllerProps(_this.props);

      _this.props.onResize({
        width: width,
        height: height
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onViewportChange", function (viewState, interactionState, oldViewState) {
      var _this$props = _this.props,
          onViewStateChange = _this$props.onViewStateChange,
          onViewportChange = _this$props.onViewportChange;

      if (onViewStateChange) {
        onViewStateChange({
          viewState: viewState,
          interactionState: interactionState,
          oldViewState: oldViewState
        });
      }

      if (onViewportChange) {
        onViewportChange(viewState, interactionState, oldViewState);
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onEvent", function (callbackName, event) {
      var func = _this.props[callbackName];

      if (func) {
        func(_this._normalizeEvent(event));
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onPointerDown", function (event) {
      switch (event.pointerType) {
        case 'touch':
          _this._onEvent('onTouchStart', event);

          break;

        default:
          _this._onEvent('onMouseDown', event);

      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onPointerUp", function (event) {
      switch (event.pointerType) {
        case 'touch':
          _this._onEvent('onTouchEnd', event);

          break;

        default:
          _this._onEvent('onMouseUp', event);

      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onPointerMove", function (event) {
      switch (event.pointerType) {
        case 'touch':
          _this._onEvent('onTouchMove', event);

          break;

        default:
          _this._onEvent('onMouseMove', event);

      }

      if (!_this.state.isDragging) {
        var _this$props2 = _this.props,
            onHover = _this$props2.onHover,
            interactiveLayerIds = _this$props2.interactiveLayerIds;
        var features;

        if (interactiveLayerIds || onHover) {
          event = _this._normalizeEvent(event);
          features = _this._getFeatures({
            pos: event.point,
            radius: _this.props.clickRadius
          });
        }

        if (onHover) {
          // backward compatibility: v3 `onHover` interface
          event.features = features;
          onHover(event);
        }

        var isHovering = interactiveLayerIds && features && features.length > 0;
        var isEntering = isHovering && !_this.state.isHovering;
        var isExiting = !isHovering && _this.state.isHovering;

        if (isEntering) {
          _this._onEvent('onMouseEnter', event);
        }

        if (isExiting) {
          _this._onEvent('onMouseLeave', event);
        }

        if (isEntering || isExiting) {
          _this.setState({
            isHovering: isHovering
          });
        }
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "_onClick", function (event) {
      if (_this.props.onClick) {
        event = _this._normalizeEvent(event); // backward compatibility: v3 `onClick` interface

        event.features = _this._getFeatures({
          pos: event.point,
          radius: _this.props.clickRadius
        });

        _this.props.onClick(event);
      }
    });
    (0, _deprecateWarn.default)(props);
    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false
    }; // If props.controller is not provided, fallback to default MapController instance
    // Cannot use defaultProps here because it needs to be per map instance

    _this._controller = props.controller || new _mapController.default();
    _this._eventManager = new _mjolnir.EventManager(null, {
      legacyBlockScroll: false,
      touchAction: props.touchAction
    });
    _this._width = 0;
    _this._height = 0;
    _this._eventCanvasRef = (0, _react.createRef)();
    _this._staticMapRef = (0, _react.createRef)();
    return _this;
  }

  (0, _createClass2.default)(InteractiveMap, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var eventManager = this._eventManager;
      eventManager.setElement(this._eventCanvasRef.current); // Register additional event handlers for click and hover

      eventManager.on({
        pointerdown: this._onPointerDown,
        pointermove: this._onPointerMove,
        pointerup: this._onPointerUp,
        pointerleave: this._onEvent.bind(this, 'onMouseOut'),
        click: this._onClick,
        dblclick: this._onEvent.bind(this, 'onDblClick'),
        wheel: this._onEvent.bind(this, 'onWheel'),
        contextmenu: this._onEvent.bind(this, 'onContextMenu')
      });

      this._setControllerProps(this.props);
    }
  }, {
    key: "componentWillUpdate",
    value: function componentWillUpdate(nextProps) {
      this._setControllerProps(nextProps);
    }
  }, {
    key: "_setControllerProps",
    value: function _setControllerProps(props) {
      props = Object.assign({}, props, props.viewState, {
        isInteractive: Boolean(props.onViewStateChange || props.onViewportChange),
        onViewportChange: this._onViewportChange,
        onStateChange: this._onInteractionStateChange,
        eventManager: this._eventManager,
        width: this._width,
        height: this._height
      });

      this._controller.setOptions(props);
    }
  }, {
    key: "_getFeatures",
    value: function _getFeatures(_ref3) {
      var pos = _ref3.pos,
          radius = _ref3.radius;
      var features;
      var queryParams = {};

      if (this.props.interactiveLayerIds) {
        queryParams.layers = this.props.interactiveLayerIds;
      }

      if (radius) {
        // Radius enables point features, like marker symbols, to be clicked.
        var size = radius;
        var bbox = [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]];
        features = this.getMap().queryRenderedFeatures(bbox, queryParams);
      } else {
        features = this.getMap().queryRenderedFeatures(pos, queryParams);
      }

      return features;
    }
  }, {
    key: "_normalizeEvent",

    /* Generic event handling */
    value: function _normalizeEvent(event) {
      if (event.lngLat) {
        // Already unprojected
        return event;
      }

      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;
      var pos = [x, y];
      var viewport = new _viewportMercatorProject.default(Object.assign({}, this.props, {
        width: this._width,
        height: this._height
      }));
      event.point = pos;
      event.lngLat = viewport.unproject(pos);
      return event;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          width = _this$props3.width,
          height = _this$props3.height,
          style = _this$props3.style,
          getCursor = _this$props3.getCursor;
      var eventCanvasStyle = Object.assign({
        position: 'relative'
      }, style, {
        width: width,
        height: height,
        cursor: getCursor(this.state)
      });
      var interactiveContext = {
        isDragging: this.state.isDragging,
        eventManager: this._eventManager
      };
      return (0, _react.createElement)(InteractiveContext.Provider, {
        value: interactiveContext
      }, (0, _react.createElement)('div', {
        key: 'event-canvas',
        ref: this._eventCanvasRef,
        style: eventCanvasStyle
      }, (0, _react.createElement)(_staticMap.default, Object.assign({}, this.props, {
        width: '100%',
        height: '100%',
        style: null,
        onResize: this._onResize,
        ref: this._staticMapRef,
        children: this.props.children
      }))));
    }
  }]);
  return InteractiveMap;
}(_react.PureComponent);

exports.default = InteractiveMap;
InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
//# sourceMappingURL=interactive-map.js.map