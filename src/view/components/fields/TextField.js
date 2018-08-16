/**
 * Description: TextField component
 *
 * @author:   Henrik Grönvall
 * @version:  0.0.1
 * @copyright:  Copyright (c) 2017 HGC AB
 * @license: The MIT License (MIT)
 */

// react
import React from "react";
import PropTypes from "prop-types";

// material-ui
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    margin: theme.spacing.unit
  },
});

/**
 * TextField component
 * @param {object} props
 * @returns {*}
 * @constructor
 */
function TextField(props) {
  const {
    classes,
    id,
    disabled,
    required,
    value,
    label,
    onChange,
  } = props;

  return(
    <FormControl className={ classes.root }>
      <InputLabel
        htmlFor={ id }
        required={ required }
      >
        { label }
      </InputLabel>
      <Input
        id={ id }
        disable={ disabled.toString() }
        value={ value }
        autoComplete={ id }
        onChange={ onChange(id) }
      />
    </FormControl>
  );
}

TextField.propTypes = {
  classes: PropTypes.object,
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  required: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

TextField.defaultProps = {
  label: 'label',
  disabled: false,
  required: false,
};


// Inject styles
export default withStyles(styles)(TextField);