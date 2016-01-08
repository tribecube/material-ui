var React = require('react');
var Tab = require('./tab.jsx');
var TabTemplate = require('./tabTemplate.jsx');
var InkBar = require('../ink-bar.jsx');

var Tabs = React.createClass({

  propTypes: {
    onActive: React.PropTypes.func
  },

  getInitialState: function(){
    var state = { selectedIndex: 0 };
    if (this.props.selectedIndex != null && this.props.selectedIndex != undefined) {
      state.selectedIndex = this.props.selectedIndex;
    }
    return state;
  },

  getEvenWidth: function(){
    return (
      parseInt(window
        .getComputedStyle(this.getDOMNode())
        .getPropertyValue('width'), 10)
    );
  },

  componentDidMount: function(){
    if(this.props.tabWidth) {
      if(!(this.props.children.length * this.props.tabWidth > this.getEvenWidth())){
        this.setState({
          width: this.props.tabWidth,
          fixed: false
        });
        return;
      }
    }
    this.setState({
      width: this.getEvenWidth(),
      fixed: true
    });
  },

  componentWillReceiveProps: function(props) {
    var state = {};
    if (props.selectedIndex != null && props.selectedIndex != undefined) {
      state.selectedIndex = props.selectedIndex;
    }
    this.setState(state);
  },

  handleTouchTap: function(tabIndex, tab){
    if (this.props.onChange && this.state.selectedIndex !== tabIndex) this.props.onChange();
    this.setState({selectedIndex: tabIndex});
    //default CB is _onActive. Can be updated in tab.jsx
    if(tab.props.onActive) tab.props.onActive(tab);
  },

  render: function(){
    var _this = this;
    //var width = this.state.fixed ?
    //  this.state.width/this.props.children.length :
    //  this.props.tabWidth;

    var width = 100/this.props.children.length;
    var left = width * this.state.selectedIndex || 0;

    var widthPerc = width + "%";
    var leftPerc = left + "%";

    var currentTemplate;
    var tabs = React.Children.map(this.props.children, function(tab, index){
      if(tab.type.displayName === "Tab"){
        if(_this.state.selectedIndex === index) currentTemplate = tab.props.children;
         return React.addons.cloneWithProps(tab, {
            key: index,
            selected: _this.state.selectedIndex === index,
            tabIndex: index,
            width: widthPerc,
            handleTouchTap: _this.handleTouchTap
          })
      } else {
        var type = tab.type.displayName || tab.type;
        throw "Tabs only accepts Tab Components as children. Found " + type + " as child number " + (index + 1) + " of Tabs";
      }
    });

    return (
      <div className="mui-tabs-container">
        <div className="mui-tab-item-container">
          {tabs}
        </div>
        <InkBar left={leftPerc} width={widthPerc}/>
        <TabTemplate>
          {currentTemplate}
        </TabTemplate>
      </div>
    )
  },

});

module.exports = Tabs;
