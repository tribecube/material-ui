var React = require('react'),
  Classable = require('./mixins/classable.js');

var Icon = React.createClass({

  mixins: [Classable],

  propTypes: {
    icon: React.PropTypes.string
  },

  render: function() {
    var { className, icon, ...other } = this.props,
      isMuiCustomIcon = icon.indexOf('mui-icon') > -1,
      mdfiClassName = 'mdfi_' + icon.replace(/-/g, '_'),
      iconClassName = isMuiCustomIcon ? icon : mdfiClassName,
      classes = this.getClasses('mui-icon ' + iconClassName);

    var supportedIconClasses = this.getClasses('mui-icon');

    if(icon.indexOf("mdi mdi")>-1) {
      return (
        <span {...other} className={supportedIconClasses}>
          <i className={icon} style={{verticalAlign: "middle"}}/>
        </span>
      );
    } else if(icon.indexOf("fa fa")>-1) {
      return (
        <span {...other} className={supportedIconClasses}>
          <i className={icon} style={{verticalAlign: "middle"}}/>
        </span>
      );
    } else if(icon.indexOf("md md")>-1) {
      return (
        <span {...other} className={supportedIconClasses}>
          <i className={icon} style={{verticalAlign: "middle"}} />
        </span>
      );
    } else {
      return (
        <span {...other} className={classes} />
      );
    }
  }

});

module.exports = Icon;
