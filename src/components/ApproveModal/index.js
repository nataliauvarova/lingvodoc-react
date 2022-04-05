import React from "react";
import { graphql } from "react-apollo";
import DatePicker from "react-datepicker";
import { Button, Container, Divider, Form, Grid, Header, Modal, Table } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import gql from "graphql-tag";
import { clone } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import { compose } from "recompose";

import { queryCounter } from "backend";
import { queryLexicalEntries } from "components/PerspectiveView";

import "react-datepicker/dist/react-datepicker.css";

const perspectiveStatisticsQuery = gql`
  query statisticsPerspective($id: LingvodocID!, $start: Int!, $end: Int!) {
    perspective(id: $id) {
      id
      statistic(starting_time: $start, ending_time: $end)
    }
  }
`;

const approveMutation = gql`
  mutation approve(
    $perspective_id: LingvodocID!
    $user_id: Int!
    $accepted: Boolean
    $published: Boolean
    $field_ids: [LingvodocID]!
  ) {
    approve_all_for_user(
      perspective_id: $perspective_id
      user_id: $user_id
      accepted: $accepted
      published: $published
      field_ids: $field_ids
    ) {
      triumph
      update_count
    }
  }
`;

/** Modal dialog for performing mass publish entity or accept contibution operations. */
class ApproveModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startDate: moment().subtract(5, "years"),
      endDate: moment(),
      user_id: null,
      approveMap: []
    };

    this.getStatistics = this.getStatistics.bind(this);
    this.handleUserSelected = this.handleUserSelected.bind(this);
    this.onApprove = this.onApprove.bind(this);
  }

  getStatistics() {
    const { perspectiveId } = this.props;
    const { startDate, endDate } = this.state;
    this.props.data.refetch({ id: perspectiveId, start: startDate.unix(), end: endDate.unix() }).then(
      result => {
        if (!result.data.perspective.statistic.some(stat => stat.user_id == this.state.user_id)) {
          this.setState({ user_id: null });
        }
      },
      () => {
        this.setState({ user_id: null });
      }
    );
  }

  handleUserSelected(e, { value }) {
    this.setState({ user_id: value });
  }

  onApprove(keys) {
    const { user_id, approveMap } = this.state;
    const { perspectiveId, mode, approve, data } = this.props;

    const variables = {
      perspective_id: data.perspective.id,
      user_id: user_id,
      field_ids: keys.map(key => key.id)
    };
    const refetchQueries = [
      {
        query: queryLexicalEntries,
        variables: { id: perspectiveId, entitiesMode: mode === "publish" ? "all" : "not_accepted" }
      },
      {
        query: queryCounter,
        variables: {
          id: perspectiveId,
          mode: mode == "publish" ? "published" : "not_accepted"
        }
      }
    ];
    if (mode == "publish") {
      variables.published = true;
      refetchQueries.push({ query: queryLexicalEntries, variables: { id: perspectiveId, entitiesMode: "published" } });
    } else {
      variables.accepted = true;
    }
    approve({ variables, refetchQueries }).then(
      ({
        data: {
          approve_all_for_user: { update_count }
        }
      }) => {
        const updatedApproveMap = clone(approveMap);
        let approvedKeys = updatedApproveMap[user_id];
        if (!approvedKeys) {
          approvedKeys = [];
          updatedApproveMap[user_id] = approvedKeys;
        }
        keys.forEach(key => approvedKeys.push(key.name));
        this.setState({ approveMap: updatedApproveMap });

        window.logger.suc(`Updated ${update_count} entit${update_count == 1 ? "y" : "ies"}.`);
      }
    );
  }

  render() {
    const { loading, error, perspective } = this.props.data;
    if (error) {
      return null;
    }

    const { mode, onClose } = this.props;
    const { startDate, endDate, user_id, approveMap } = this.state;
    const { statistic: statistics } = perspective || { statistic: [] };
    const publishOrAccept = mode == "publish" ? getTranslation("Publish") : getTranslation("Accept");

    let toApprove = null;
    let keys = [];
    if (user_id != null) {
      statistics.some(stat => {
        if (user_id == stat.user_id) {
          if (stat.entities) {
            toApprove = mode == "publish" ? stat.entities.unpublished : stat.entities.unaccepted;
            keys = Object.keys(toApprove)
              .filter(key => key != "total")
              .map(key => {
                return { id: toApprove[key].field_id, name: key };
              });
          }
          return true;
        }
      });
    }

    return (
      <Modal open closeIcon closeOnDimmerClick={false} onClose={onClose} className="lingvo-modal2">
        <Modal.Header>
          {mode == "publish" ? getTranslation("Publish Entities") : getTranslation("Accept Contributions")}
        </Modal.Header>
        <Modal.Content scrolling>
          <div>
            {getTranslation("From:")}
            <DatePicker
              selected={startDate}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              onChange={date => this.setState({ startDate: date })}
              dateFormat="DD.MM.YYYY HH:mm"
            />
            {getTranslation("To:")}
            <DatePicker
              selected={endDate}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              onChange={date => this.setState({ endDate: date })}
              dateFormat="DD.MM.YYYY HH:mm"
            />
          </div>
          <Container textAlign="center">
            <Button color="blue" loading={loading} content={getTranslation("Refresh")} onClick={this.getStatistics} />
          </Container>
          <Divider />
          <Grid columns={2} divided centered>
            <Grid.Column>
              <Form>
                {statistics.map(stat => (
                  <Form.Radio
                    key={stat.user_id}
                    label={stat.name}
                    value={stat.user_id}
                    checked={user_id == stat.user_id}
                    onChange={this.handleUserSelected}
                  />
                ))}
              </Form>
            </Grid.Column>
            <Grid.Column>
              {user_id == null && (
                <Container textAlign="center">
                  <Header>{getTranslation("Please select a user")}</Header>
                </Container>
              )}
              {user_id != null && keys.length == 0 && (
                <Container textAlign="center">
                  <Header>{`${getTranslation("Nothing to")} ${publishOrAccept.toLowerCase()}`}</Header>
                </Container>
              )}
              {toApprove && keys.length != 0 && (
                <Table celled compact definition>
                  <Table.Body>
                    {keys.map(key => (
                      <Table.Row key={key.name}>
                        <Table.Cell>{key.name}</Table.Cell>
                        <Table.Cell>{toApprove[key.name].total}</Table.Cell>
                        <Table.Cell>
                          <Button
                            color="green"
                            loading={loading}
                            content={publishOrAccept}
                            disabled={approveMap[user_id] && approveMap[user_id].indexOf(key.name) != -1}
                            onClick={() => this.onApprove([key])}
                          />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              )}
              {toApprove && keys.length > 1 && (
                <Container textAlign="center">
                  <Button
                    color="green"
                    content={`${publishOrAccept} ${getTranslation("All")}`}
                    disabled={approveMap[user_id] && keys.every(key => approveMap[user_id].indexOf(key.name) != -1)}
                    onClick={() => this.onApprove(keys)}
                  />
                </Container>
              )}
            </Grid.Column>
          </Grid>
        </Modal.Content>
      </Modal>
    );
  }
}

ApproveModal.propTypes = {
  perspectiveId: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default compose(
  graphql(approveMutation, { name: "approve" }),
  graphql(perspectiveStatisticsQuery, {
    options: props => ({
      variables: {
        id: props.perspectiveId,
        start: moment().subtract(5, "years").unix(),
        end: moment().unix()
      },
      notifyOnNetworkStatusChange: true
    })
  })
)(ApproveModal);
