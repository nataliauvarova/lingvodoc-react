import React, { useCallback, useContext, useState } from "react";
import { Button, Checkbox, Form, Modal, Table, Message, Icon } from "semantic-ui-react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { useMutation } from "hooks";
import { gql, useQuery } from "@apollo/client";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

// Using this query we get data for single markups and for existent groups
// We have to control broken groups and clean markups of them
const getMarkupTreeQuery = gql`
  query getMarkupTree($perspectiveId: LingvodocID!, $groupType: String, $author: Int) {
    markups(perspective_id: $perspectiveId) {
      id
      text
      offset
      field_translation
      field_position
      markup_groups(group_type: $groupType, author: $author) {
        client_id
        object_id
        type
        author_id
        author_name
        created_at
      }
    }
  }
`;

// Entities' additional metadata should be updated as well
// 'markups' has the following format: [[ entity_client_id, entity_object_id, markup_start_offset ], ... ]
const createMarkupGroupMutation = gql`
  mutation createMarkupGroup($groupType: String!, $markups: [[Int]], $perspectiveId: LingvodocID!) {
    create_markup_group(group_type: $groupType, markups: $markups, perspective_id: $perspectiveId) {
      triumph
    }
  }
`;

// 'markups' has the following format: [[  ], ... ]
export const deleteMarkupGroupMutation = gql`
  mutation deleteMarkupGroup($groupIds: [LingvodocID]!, $markups: [[Int]], $perspectiveId: LingvodocID) {
    delete_markup_group(group_ids: $groupIds, markups: $markups, perspective_id: $perspectiveId) {
      triumph
    }
  }
`;

const JoinMarkupsModal = ({ perspectiveId, onCloseUpdate, onClose }) => {
  const getTranslation = useContext(TranslationContext);

  const [firstTextRelation, setFirstTextRelation] = useState(null);
  const [secondTextRelation, setSecondTextRelation] = useState(null);
  const [typeRelation, setTypeRelation] = useState(null);
  const [selectedRelations, setSelectedRelations] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const joinActive = firstTextRelation && secondTextRelation && typeRelation;
  const deleteActive = selectedRelations;
  const onCleverClose = isDirty ? onCloseUpdate : onClose;

  const [markupDict, setMarkupDict] = useState({});
  const [groupDict, setGroupDict] = useState({});
  const [groupTotal, setGroupTotal] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);

  const [warnMessage, setWarnMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [createMarkupGroup] = useMutation(createMarkupGroupMutation);
  const [deleteMarkupGroup] = useMutation(deleteMarkupGroupMutation);

  const resetMessages = () => {
    setWarnMessage(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  const setRelationDict = markups => {

    const markupDict = {};
    const groupDict = {};
    let total = 0;

    for (const markup of markups) {

      const {
        field_position: f_pos,
        field_translation: f_name,
        markup_groups: groups,
        ...markup_data
      } = markup;

      const f_id = `${f_pos}_${f_name}`;

      if (!(f_id in markupDict)) {
        markupDict[f_id] = [];
      }
      markupDict[f_id].push(markup_data);

      for (const group of groups) {

        const {
          client_id,
          object_id,
          ...group_data
        } = group;

        const g_id = `${client_id}_${object_id}`;

        if (!(g_id in groupDict)) {
          groupDict[g_id] = { ...group_data, 'markups': [] };
        }
        groupDict[g_id]['markups'].push(markup_data);

        if (groupDict[g_id]['markups'].length === 2) {
          total++;
        }
      }
    }

    if (Object.keys(markupDict).length < 2) {
      throw new Error("At least two fields are required!");
    }

    setMarkupDict(markupDict);
    setGroupDict(groupDict);
    setGroupTotal(total);
  }

  const onAddRelation = useCallback(() => {
    //console.log("onAddRelation!!!!!!!");

    resetMessages();

    if (!firstTextRelation || !secondTextRelation || !typeRelation) {
      throw new Error("No either two markups or relation type is selected.");
    }

    for (const group of Object.values(groupDict)) {
      const ids = group['markups'].map(markup => markup.id);
      if (ids.includes(firstTextRelation) &&
          ids.includes(secondTextRelation) &&
          group.type === typeRelation) {

        setWarnMessage("Such group already exists.");
        return;
      }
    }

    createMarkupGroup({
      variables: {
        groupType: typeRelation,
        markups: [firstTextRelation.split('_'), secondTextRelation.split('_')],
        perspectiveId
      }
    }).then(refetch);

    setFirstTextRelation(null);
    setSecondTextRelation(null);
    setTypeRelation(null);
    setIsDirty(true);

    setSuccessMessage("The group was successfully added.");

  }, [firstTextRelation, secondTextRelation, typeRelation, groupDict]);

  const onDeleteRelation = useCallback(() => {

    resetMessages();

    const groupIds = (selectedRelations || []).map(
      id => id.split('_'));

    const markups = [];
    (selectedRelations || []).forEach(id => {
      const group_markups = groupDict[id].markups.map(m => m.id.split('_'));
      markups.push(...group_markups);
    });

    /*
    console.log("onDeleteRelation!!!!!!!");
    console.log("Их будем удалять: selectedRelations====");
    console.log(groupIds);
    console.log("Их будем удалять: selectedMarkups====");
    console.log(markups);
    */

    deleteMarkupGroup({
      variables: { groupIds, markups }
    }).then(refetch);

    setSelectedRelations(null);
    setSelectedTotal(0);
    setIsDirty(true);

    setSuccessMessage("The group was successfully deleted.");

  }, [groupDict, selectedRelations]);

  const onRelationSelect = (relation_id, checked) => {
    //console.log("onRelationSelect!!!!!!!");

    const selectedIds = (selectedRelations || []);

    const position = selectedIds.indexOf(relation_id);

    if (position === -1 && checked) {
      selectedIds.push(relation_id);
    } else {
      selectedIds.splice(position, 1);
    }

    //console.log("onRelationSelect: selectedIds======");
    //console.log(selectedIds);

    const selectedTotal = selectedIds.length;
    setSelectedRelations(selectedTotal ? selectedIds : null);
    setSelectedTotal(selectedTotal);
  };

  /*console.log("perspectiveId====");
  console.log(perspectiveId);

  console.log("mode====");
  console.log(mode);

  console.log("onClose====");
  console.log(onClose);

  console.log("relations===");
  console.log(relations);

  console.log("joinActive===");
  console.log(joinActive);

  console.log("selectedRelations=====");
  console.log(selectedRelations);*/

  if (Object.keys(markupDict) < 2) {
    return;
  }

  const firstField = Object.keys(markupDict)[0];
  const secondField = Object.keys(markupDict)[1];

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onCleverClose} size="fullscreen">
      <Modal.Header>{getTranslation("Join markups")}</Modal.Header>
      <Modal.Content>
        { error || loading ? (
          <span>
            {`${getTranslation("Loading markups and groups data")}...`} <Icon name="spinner" loading />
          </span>
        ) : (
          <div className="join-markups-content">
            <div className="join-markups-content__markups">
              {/* Table Markups */}
              <div className="block-add-relation">
                <div className="block-add-relation__column">
                  <Table celled padded className="lingvo-perspective-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          {firstField.split('_')[1]}: {firstTextRelation}
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {markupDict[firstField].map(markup => {
                        return (
                          <Table.Row key={markup.id}>
                            <Table.Cell
                              onClick={e => { setFirstTextRelation(markup.id); resetMessages(); }}
                              className={(markup.id === firstTextRelation && "selected-text-relation") || ""}
                            >
                              {markup.text}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </div>

                <div className="block-add-relation__column">
                  <Table celled padded className="lingvo-perspective-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          {secondField.split('_')[1]}: {secondTextRelation}
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {markupDict[secondField].map(markup => {
                        return (
                          <Table.Row key={markup.id}>
                            <Table.Cell
                              onClick={e => { setSecondTextRelation(markup.id); resetMessages(); }}
                              className={(markup.id === secondTextRelation && "selected-text-relation") || ""}
                            >
                              {markup.text}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </div>
                <div className="block-add-relation__actions">
                  {/*<Form>
                  {statistics.map(stat => (
                    <Form.Radio
                      key={stat.user_id}
                      label={stat.name}
                      value={stat.user_id}
                      checked={user_id === stat.user_id}
                      onChange={this.handleUserSelected}
                      className="lingvo-radio"
                    />
                  ))}
                </Form>*/}
                  <Form>
                    <Form.Radio
                      label={getTranslation("Translit")}
                      name="radioGroup"
                      key="Translit"
                      value="Translit"
                      checked={typeRelation === "Translit"}
                      onChange={(e, { value }) => { setTypeRelation(value); resetMessages(); }}
                      className="lingvo-radio"
                    />

                    <Form.Radio
                      label={getTranslation("Literal translation")}
                      name="radioGroup"
                      key="LiteralTranslation"
                      value="LiteralTranslation"
                      checked={typeRelation === "LiteralTranslation"}
                      onChange={(e, { value }) => { setTypeRelation(value); resetMessages(); }}
                      className="lingvo-radio"
                    />
                  </Form>

                  <Button
                    content={getTranslation("Join markups")}
                    onClick={onAddRelation}
                    className="lingvo-button-greenest"
                    disabled={!joinActive}
                  />
                </div>
              </div>
              {/* /Table Markups */}
            </div>

            { warnMessage && (
              <Message warning>
                <Message.Header>{getTranslation("Warning")}</Message.Header>
                <p>
                  {getTranslation(warnMessage)}
                </p>
              </Message>
            )}
            { successMessage && (
              <Message positive>
                <Message.Header>{getTranslation("Success")}</Message.Header>
                <p>
                  {getTranslation(successMessage)}
                </p>
              </Message>
            )}

            <div className="join-markups-content__relations">
              {/* Table Relations */}
              <Table celled padded className="lingvo-perspective-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="th-checkbox">&nbsp;</Table.HeaderCell>
                    <Table.HeaderCell> {firstField.split('_')[1]} </Table.HeaderCell>
                    <Table.HeaderCell> {secondField.split('_')[1]} </Table.HeaderCell>
                    <Table.HeaderCell> {getTranslation("Type")} </Table.HeaderCell>
                    <Table.HeaderCell> {getTranslation("Author")} </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.keys(groupDict).map(group_id => groupDict[group_id].markups.length > 1 && (
                    <Table.Row key={group_id}>
                      <Table.Cell>
                        <Checkbox
                          className="lingvo-checkbox"
                          //checked={selectedRelations.find(e => isEqual(e, relation.id))}
                          onChange={(e, { checked }) => onRelationSelect(group_id, checked)}
                        />
                      </Table.Cell>
                      <Table.Cell> {groupDict[group_id].markups[0].text} </Table.Cell>
                      <Table.Cell> {groupDict[group_id].markups[1].text} </Table.Cell>
                      <Table.Cell> {groupDict[group_id].type} </Table.Cell>
                      <Table.Cell> {groupDict[group_id].author_name} </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              {/* /Table Relations */}
            </div>
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={
            getTranslation("Delete groups") +
            " (" + selectedTotal + "/" + groupTotal + ")"}
          onClick={onDeleteRelation}
          className="lingvo-button-redder"
          disabled={!deleteActive}
          style={{float: "left"}}
        />
        <Button content={getTranslation("Close")} onClick={onCleverClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

JoinMarkupsModal.propTypes = {
  perspectiveId: PropTypes.arrayOf(PropTypes.number).isRequired,
  onCloseUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default JoinMarkupsModal;
