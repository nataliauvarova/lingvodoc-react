import React, { useCallback, useContext, useState } from "react";
import { Button, Checkbox, Form, Modal, Table } from "semantic-ui-react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

// Using this query we get data for single markups and for existent groups
// We have to control broken groups and clean markups of them
const getMarkupTreeQuery = gql`
  query getMarkupTree($perspectiveId: LingvodocID!, $groupType: String, $author: Int) {
    markups(perspective_id: $perspectiveId) {
      field_translation
      field_position
      entity_client_id
      entity_object_id
      markup_offset
      markup_text
      markup_groups(gr_type: $groupType, author: $author) {
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

const JoinMarkupsModal = ({ perspectiveId, mode, relations, onClose }) => {
  const getTranslation = useContext(TranslationContext);

  const [firstTextRelation, setFirstTextRelation] = useState(null);
  const [secondTextRelation, setSecondTextRelation] = useState(null);
  const [typeRelation, setTypeRelation] = useState(null);

  const joinActive = firstTextRelation && secondTextRelation && typeRelation;
  const [deleteActive, setDeleteActive] = useState(false);

  const [selectedRelations, setSelectedRelations] = useState([]);

  const [markupDict, setMarkupDict] = useState({});
  const [groupDict, setGroupDict] = useState({});

  const {data, error, loading, refetch} = useQuery(getMarkupTreeQuery, {
    variables: { perspectiveId },
    fetchPolicy: "network-only",
    onCompleted: data => setRelationDict(data.markups)
  });

  const setRelationDict = markups => {

    const markupDict = {};
    const groupDict = {};

    for (const markup of markups) {

      const {
        field_position: f_pos,
        field_translation: f_name,
        markup_groups: groups,
        ...markup_data
      } = markup;

      const f_id = f_pos, f_name;

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

        const g_id = client_id, object_id;

        if (!(g_id in groupDict)) {
          groupDict[g_id] = { ...group_data, markups: [] };
        }
        groupDict[g_id][markups].push(markup_data);
      }
    }
    setMarkupDict(markupDict);
    setGroupDict(groupDict);
  }

  const onAddRelation = useCallback(
    /*newMetadata*/ () => {
      console.log("onAddRelation!!!!!!!");
      setFirstTextRelation(null);
      setSecondTextRelation(null);
      setTypeRelation(null);
      /*updateLanguageMetadata({
        variables: { id: language.id, metadata: newMetadata }
      }).then(() => setMetadata(newMetadata));*/
    },
    [
      /*language, updateLanguageMetadata*/
    ]
  );

  const onDeleteRelation = useCallback(() => {
    console.log("onDeleteRelation!!!!!!!");
    console.log("Их будем удалять: selectedRelations====");
    console.log(selectedRelations);
  }, []);

  const onRelationSelect = useCallback((relation_id, checked) => {
    console.log("onRelationSelect!!!!!!!");
    /*console.log("relation_id====");
    console.log(relation_id);
    console.log("checked====");
    console.log(checked);
    console.log("Начало функции: selectedRelations====");
    console.log(selectedRelations);*/

    const selectedIds = selectedRelations;

    const position = selectedIds.indexOf(relation_id);

    if (position === -1 && checked) {
      selectedIds.push(relation_id);
    } else {
      selectedIds.splice(position, 1);
    }

    console.log("onRelationSelect: selectedIds======");
    console.log(selectedIds);

    setSelectedRelations(selectedIds);
    setDeleteActive(selectedIds.length > 0);
  }, []);

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

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{getTranslation("Join markups")}</Modal.Header>
      <Modal.Content>
        <div className="join-markups-content">
          <div className="join-markups-content__markups">
            {/* Table Markups */}
            <div className="block-add-relation">
              <div className="block-add-relation__column">
                <Table celled padded className="lingvo-perspective-table">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>
                        {getTranslation("Left text")}: {firstTextRelation}
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {relations.map(relation => {
                      return (
                        <Table.Row key={relation.id}>
                          <Table.Cell
                            onClick={e => setFirstTextRelation(relation.id)}
                            className={(relation.id === firstTextRelation && "selected-text-relation") || ""}
                          >
                            Left text Left text Left text Left text Left text
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
                        {getTranslation("Right text")}: {secondTextRelation}
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {relations.map(relation => {
                      return (
                        <Table.Row key={relation.id}>
                          <Table.Cell
                            onClick={e => setSecondTextRelation(relation.id)}
                            className={(relation.id === secondTextRelation && "selected-text-relation") || ""}
                          >
                            Right text Right text Right text Right text
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
                    onChange={(e, { value }) => setTypeRelation(value)}
                    className="lingvo-radio"
                  />

                  <Form.Radio
                    label={getTranslation("Literal translation")}
                    name="radioGroup"
                    key="LiteralTranslation"
                    value="LiteralTranslation"
                    checked={typeRelation === "LiteralTranslation"}
                    onChange={(e, { value }) => setTypeRelation(value)}
                    className="lingvo-radio"
                  />
                </Form>

                <Button
                  content={getTranslation("Attach")}
                  onClick={onAddRelation}
                  className="lingvo-button-greenest"
                  disabled={!joinActive}
                />

                <Button
                  content={getTranslation("Delete")}
                  onClick={onDeleteRelation}
                  className="lingvo-button-redder"
                  disabled={!deleteActive}
                />
              </div>
            </div>
            {/* /Table Markups */}
          </div>

          <div className="join-markups-content__relations">
            {/* Table Relations */}
            <Table celled padded className="lingvo-perspective-table">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="th-checkbox">&nbsp;</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Left text")}</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Right text")}</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Type")}</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Author")}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {relations.map(relation => (
                  <Table.Row key={relation.id}>
                    <Table.Cell>
                      <Checkbox
                        className="lingvo-checkbox"
                        //checked={selectedRelations.find(e => isEqual(e, relation.id))}
                        onChange={(e, { checked }) => onRelationSelect(relation.id, checked)}
                      />
                    </Table.Cell>
                    <Table.Cell>Left text</Table.Cell>
                    <Table.Cell>Right text</Table.Cell>
                    <Table.Cell>Type</Table.Cell>
                    <Table.Cell>Author</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            {/* /Table Relations */}
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Close")} onClick={onClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

JoinMarkupsModal.propTypes = {
  perspectiveId: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired,
  relations: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired
};

export default JoinMarkupsModal;
