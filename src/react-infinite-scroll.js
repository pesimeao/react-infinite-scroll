var deepEqual = require("deep-equal");

function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

module.exports = function (React, ReactDOM) {
  if (React.addons && React.addons.InfiniteScroll) {
    return React.addons.InfiniteScroll;
  }
  React.addons = React.addons || {};
  var InfiniteScroll = React.addons.InfiniteScroll = React.createClass({
    getDefaultProps: function () {
      return {
        pageStart: 0,
        hasMore: false,
        loadMore: function () {},
        threshold: 250
      };
    },
    componentDidMount: function () {
      this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
    },
    componentDidUpdate: function () {
      //this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
    },
    shouldComponentUpdate: function(nextProps, nextState) {
      return !deepEqual(this.props.children, nextProps.children || nextProps.hasMore !== this.props.hasMore);
    },
    reset: function() {
      this.pageLoaded = this.props.pageStart;
    },
    render: function () {
      var props = this.props;
      return React.DOM.div({id: this.props.id || 'infinite_scroll', className: this.props.className || 'infinite-scroll'}, props.children, props.hasMore && (props.loader || InfiniteScroll._defaultLoader));
    },
    getScrollParent: function() {
      var el = React.findDOMNode(this);
      var overflowKey = 'overflowY';
      while (el = el.parentElement) {
        switch (window.getComputedStyle(el)[overflowKey]) {
          case 'auto': case 'scroll': case 'overlay': return el;
        }
      }
      return window;
    },
    getViewportSize: function () {
      var scrollParent = this.scrollingDOM;
      return scrollParent === window ?
        window.innerHeight :
        scrollParent.clientHeight;
    },
    scrollListener: function () {
      //var el = ReactDOM.findDOMNode(this);
      var el = this.scrollingDOM;
      
      // If this doesn't work, look at this:
      // 1. https://github.com/doronaviguy/react-infinite-scroll/commit/0fe5dadf5df542077fcbd5776d7df464c7f5ca9f
      // 2. if (this.getDOMNode().getBoundingClientRect().bottom < this.getViewportSize() + this.props.threshold) {
      // 3. 
      //   var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      //   if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < Number(this.props.threshold)) { 
      if (el.scrollHeight - el.offsetHeight <= el.scrollTop + Number(this.props.threshold)) {
        this.detachScrollListener();
        // call loadMore after detachScrollListener to allow
        // for non-async loadMore functions
        this.props.loadMore(this.pageLoaded += 1);
      }
    },
    attachScrollListener: function () {
      if (!this.props.hasMore) {
        return;
      }
      this.scrollingDOM = this.getScrollParent();
      this.scrollingDOM.addEventListener('scroll', this.scrollListener);
      this.scrollingDOM.addEventListener('resize', this.scrollListener);
      this.scrollListener();
      // If problems, look at https://github.com/range-me/react-infinite-scroll/commit/7e31bd4b39804e3bc320ecea5bc42e0c2e036b55
    },
    detachScrollListener: function () {
      if (this.scrollingDOM) {
        this.scrollingDOM.removeEventListener('scroll', this.scrollListener);
        this.scrollingDOM.removeEventListener('resize', this.scrollListener);
        this.scrollingDOM = null;
      }
    },
    componentWillUnmount: function () {
      this.detachScrollListener();
    }
  });
  InfiniteScroll.setDefaultLoader = function (loader) {
    InfiniteScroll._defaultLoader = loader;
  };
  return InfiniteScroll;
};