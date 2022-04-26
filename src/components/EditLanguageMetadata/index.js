import React from "react";
import { Button, Form, Label, Segment } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

const speakersAmountOptions = getTranslation => [
  { text: getTranslation("Vulnerable"), value: "Vulnerable" },
  { text: getTranslation("Definitely endangered"), value: "Definitely endangered" },
  { text: getTranslation("Critically endangered"), value: "Critically endangered" },
  { text: getTranslation("Extinct"), value: "Extinct" },
  { text: getTranslation("Severely endangered"), value: "Severely endangered" },
  { text: getTranslation("Safe"), value: "Safe" }
];

class EditLanguageMetadata extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.metadata || { speakersAmount: "" };

    this.initialState = { speakersAmount: this.state.speakersAmount };

    this.onChangeValue = this.onChangeValue.bind(this);
    this.onSaveValue = this.onSaveValue.bind(this);
  }

  onChangeValue(event, data) {
    this.setState({ speakersAmount: data.value }, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state);
      }
    });
  }

  onSaveValue() {
    this.initialState.speakersAmount = this.state.speakersAmount;
    if (this.props.onSave) {
      this.props.onSave(this.state);
    }
    this.forceUpdate();
  }

  render() {
    const { mode } = this.props;
    const { speakersAmount } = this.state;

    return (
      <Form>
        <h4>{this.context("Metadata")}</h4>
        <Segment>
          <Form.Group widths="equal">
            <Label size="large">{this.context("Number of native speakers")}</Label>
            <Form.Dropdown
              fluid
              selection
              options={speakersAmountOptions(this.context)}
              value={speakersAmount}
              onChange={this.onChangeValue}
            />
            {mode != "create" && (
              <Button
                content={this.context("Save")}
                disabled={JSON.stringify(speakersAmount) == JSON.stringify(this.initialState.speakersAmount)}
                onClick={this.onSaveValue}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
      </Form>
    );
  }
}

EditLanguageMetadata.contextType = TranslationContext;

EditLanguageMetadata.propTypes = {
  mode: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onChange: PropTypes.func,
  onSave: PropTypes.func
};

export default EditLanguageMetadata;
