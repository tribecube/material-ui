var React = require('react'),
  CssEvent = require('./utils/css-event.js'),
  Dom = require('./utils/dom.js'),
  KeyLine = require('./utils/key-line.js'),
  Classable = require('./mixins/classable.js'),
  ClickAwayable = require('./mixins/click-awayable'),
  Paper = require('./paper.jsx'),
  MenuItem = require('./menu-item.jsx');

/***********************
 * Nested Menu Component
 ***********************/
var NestedMenuItem = React.createClass({

  mixins: [Classable, ClickAwayable],

  propTypes: {
    index: React.PropTypes.number.isRequired,
    text: React.PropTypes.string,
    menuItems: React.PropTypes.array.isRequired,
    zDepth: React.PropTypes.number,
    onItemClick: React.PropTypes.func
  },

  getInitialState: function() {
    return { open: false }
  },

  componentClickAway: function() {
    this.setState({ open: false });
  },

  componentDidMount: function() {
    this._positionNestedMenu();
  },

  componentDidUpdate: function(prevProps, prevState) {
    this._positionNestedMenu();
  },

  render: function() {
    var classes = this.getClasses('mui-nested-menu-item', {
      'mui-open': this.state.open
    });

    return (
      <div className={classes}>
        <MenuItem index={this.props.index} iconRight="mui-icon-arrow-drop-right" onClick={this._onParentItemClick}>
          {this.props.text}
        </MenuItem>
        <Menu
          ref="nestedMenu"
          menuItems={this.props.menuItems}
          onItemClick={this._onMenuItemClick}
          hideable={true}
          visible={this.state.open}
          zDepth={this.props.zDepth + 1} />
      </div>
    );
  },

  _positionNestedMenu: function() {
    var el = this.getDOMNode(),
      nestedMenu = this.refs.nestedMenu.getDOMNode();

    nestedMenu.style.left = el.offsetWidth + 'px';
  },

  _onParentItemClick: function() {
    this.setState({ open: !this.state.open });
  },

  _onMenuItemClick: function(e, index, menuItem) {
    this.setState({ open: false });
    if (this.props.onItemClick) this.props.onItemClick(e, index, menuItem);
  }

});

/****************
 * Menu Component
 ****************/
var Menu = React.createClass({

  mixins: [Classable],

  propTypes: {
    autoWidth: React.PropTypes.bool,
    onItemClick: React.PropTypes.func,
    onToggleClick: React.PropTypes.func,
    menuItems: React.PropTypes.array.isRequired,
    selectedIndex: React.PropTypes.number,
    hideable: React.PropTypes.bool,
    visible: React.PropTypes.bool,
    zDepth: React.PropTypes.number,
    menuPosition: React.PropTypes.array
  },

  getInitialState: function() {
    return { nestedMenuShown: false }
  },

  getDefaultProps: function() {
    return {
      autoWidth: true,
      hideable: false,
      visible: true,
      zDepth: 1
    };
  },

  componentDidMount: function() {
    var el = this.getDOMNode();

    //Set the menu with
    this._setKeyWidth(el);

    //Save the initial menu height for later
    this._initialMenuHeight = el.offsetHeight + KeyLine.Desktop.GUTTER_LESS;

    //Show or Hide the menu according to visibility
    this._renderVisibility();
  },

  componentDidUpdate: function(prevProps, prevState) {

    var el = this.getDOMNode();
    var newWidth = 0;
    var newHeight = KeyLine.Desktop.GUTTER_LESS;
    for (var ix = 0; ix < el.childNodes.length; ix++) {
      if (el.childNodes[ix].childNodes) {
        for (var jx = 0; jx < el.childNodes[ix].childNodes.length; jx++) {
          var aNode = el.childNodes[ix].childNodes[jx];
          newHeight += aNode.offsetHeight;
          var widthSpacing = $(aNode).outerWidth(true) - $(aNode).width();
          for (var kx = 0; kx < aNode.childNodes.length; kx++) {
            var innerNode = aNode.childNodes[kx];
            var testWidth = innerNode.offsetWidth + widthSpacing;
            if (testWidth > newWidth) {
              newWidth = testWidth;
            }
          }
        }
      }
    }

    var menuWidth = this.props.autoWidth ? KeyLine.getIncrementalDim(newWidth) + 'px' : '100%';

    //Update the menu width
    el.style.width = menuWidth;

    //Open the menu
    this._initialMenuHeight = newHeight;

    if (this.props.visible !== prevProps.visible) this._renderVisibility();
  },

  render: function() {
    var topBottom = (this.props.menuPosition) ? this.props.menuPosition[0] : "middle";
    var rightLeft = (this.props.menuPosition) ? this.props.menuPosition[1] : "right";
    var classes = this.getClasses('mui-menu ' + topBottom + ' ' + rightLeft, {
      'mui-menu-hideable': this.props.hideable,
      'mui-visible': this.props.visible
    });

    return (
      <Paper ref="paperContainer" zDepth={this.props.zDepth} className={classes} onContextMenu={this.props.onContextMenu}>
        {this._getChildren()}
      </Paper>
    );
  },

  _getChildren: function() {
    var children = [],
      menuItem,
      itemComponent,
      isSelected;

    //This array is used to keep track of all nested menu refs
    this._nestedChildren = [];

    for (var i=0; i < this.props.menuItems.length; i++) {
      menuItem = this.props.menuItems[i];
      isSelected = i === this.props.selectedIndex;

      switch (menuItem.type) {

        case MenuItem.Types.LINK:
          itemComponent = (
            <a key={i} index={i} className="mui-menu-item" href={menuItem.payload}>{menuItem.text}</a>
          );
        break;

        case MenuItem.Types.SUBHEADER:
          itemComponent = (
            <div key={i} index={i} className="mui-subheader">{menuItem.text}</div>
          );
          break;

        case MenuItem.Types.NESTED:
          itemComponent = (
            <NestedMenuItem
              ref={i}
              key={i}
              index={i}
              text={menuItem.text}
              menuItems={menuItem.items}
              zDepth={this.props.zDepth}
              onItemClick={this._onNestedItemClick} />
          );
          this._nestedChildren.push(i);
          break;

        default:
          itemComponent = (
            <MenuItem
              selected={isSelected}
              key={i}
              index={i}
              icon={menuItem.icon}
              data={menuItem.data}
              attribute={menuItem.attribute}
              number={menuItem.number}
              toggle={menuItem.toggle}
              onClick={this._onItemClick}
              onToggle={this._onItemToggle}>
              {menuItem.text}
            </MenuItem>
          );
      }
      children.push(itemComponent);
    }

    return children;
  },

  _setKeyWidth: function(el) {
    var menuWidth = this.props.autoWidth ?
      KeyLine.getIncrementalDim(el.offsetWidth) + 'px' :
      '100%';

    //Update the menu width
    Dom.withoutTransition(el, function() {
      el.style.width = menuWidth;
    });
  },

  _renderVisibility: function() {
    var el;

    if (this.props.hideable) {
      el = this.getDOMNode();
      var innerContainer = this.refs.paperContainer.getInnerContainer().getDOMNode();
      
      if (this.props.visible) {

        //Open the menu
        el.style.height = this._initialMenuHeight + 'px';

        //Set the overflow to visible after the animation is done so
        //that other nested menus can be shown
        CssEvent.onTransitionEnd(el, function() {
          //Make sure the menu is open before setting the overflow.
          //This is to accout for fast clicks
          if (this.props.visible) innerContainer.style.overflow = 'visible';
        }.bind(this));

      } else {

        //Close the menu
        el.style.height = '0px';

        //Set the overflow to hidden so that animation works properly
        innerContainer.style.overflow = 'hidden';
      }
    }
  },

  _onNestedItemClick: function(e, index, menuItem) {
    if (this.props.onItemClick) this.props.onItemClick(e, index, menuItem);
  },

  _onItemClick: function(e, index) {
    if (this.props.onItemClick) this.props.onItemClick(e, index, this.props.menuItems[index]);
  },

  _onItemToggle: function(e, index, toggled) {
    if (this.props.onItemToggle) this.props.onItemToggle(e, index, this.props.menuItems[index], toggled);
  }

});

module.exports = Menu;
