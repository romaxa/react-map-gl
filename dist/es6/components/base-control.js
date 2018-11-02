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
import { PureComponent, createElement, createRef } from 'react';
import PropTypes from 'prop-types';
import { InteractiveContext } from './interactive-map';
import { StaticContext } from './static-map';
const propTypes = {
  /** Event handling */
  captureScroll: PropTypes.bool,
  // Stop map pan & rotate
  captureDrag: PropTypes.bool,
  // Stop map click
  captureClick: PropTypes.bool,
  // Stop map double click
  captureDoubleClick: PropTypes.bool
};
const defaultProps = {
  captureScroll: false,
  captureDrag: true,
  captureClick: true,
  captureDoubleClick: true
};
/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

export default class BaseControl extends PureComponent {
  constructor(props) {
    super(props);

    _defineProperty(this, "_onScroll", evt => {
      if (this.props.captureScroll) {
        evt.stopPropagation();
      }
    });

    _defineProperty(this, "_onDragStart", evt => {
      if (this.props.captureDrag) {
        evt.stopPropagation();
      }
    });

    _defineProperty(this, "_onPointerUp", evt => {
      if (this.props.captureDoubleClick) {
        const eventManager = this._context.eventManager;

        const _eventManager$manager = eventManager.manager.get('doubletap'),
              enable = _eventManager$manager.options.enable; // Temporarily disable doubletap


        if (enable) {
          eventManager._toggleRecognizer('doubletap', false);
          /* global setTimeout */


          setTimeout(() => {
            eventManager._toggleRecognizer('doubletap', true);
          }, 0);
        }
      }
    });

    _defineProperty(this, "_onClick", evt => {
      if (this.props.captureClick) {
        evt.stopPropagation();
      }
    });

    this._context = {};
    this._events = null;
    this._containerRef = createRef();
  }

  componentDidMount() {
    const ref = this._containerRef.current;

    if (!ref) {
      return;
    }

    const eventManager = this._context.eventManager; // Return early if no eventManager is found

    if (eventManager) {
      this._events = {
        wheel: this._onScroll,
        panstart: this._onDragStart,
        click: this._onClick,
        pointerup: this._onPointerUp
      };
      eventManager.on(this._events, ref);
    }
  }

  componentWillUnmount() {
    const eventManager = this._context.eventManager;

    if (eventManager && this._events) {
      eventManager.off(this._events);
    }
  }

  _render() {
    throw new Error('_render() not implemented');
  }

  render() {
    return createElement(InteractiveContext.Consumer, null, interactiveContext => {
      // Save event manager
      return createElement(StaticContext.Consumer, null, staticContext => {
        this._context = Object.assign({}, interactiveContext, staticContext);
        return this._render();
      });
    });
  }

}
BaseControl.propTypes = propTypes;
BaseControl.defaultProps = defaultProps;
//# sourceMappingURL=base-control.js.map