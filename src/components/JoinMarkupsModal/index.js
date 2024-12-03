import React, { useCallback, useContext, useState } from "react";
import { Button, Checkbox, Form, Modal, Table } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

const JoinMarkupsModal = ({ perspectiveId, mode, relations, onClose }) => {
  const getTranslation = useContext(TranslationContext);

  const [firstTextRelation, setFirstTextRelation] = useState(null);
  const [secondTextRelation, setSecondTextRelation] = useState(null);
  const [typeRelation, setTypeRelation] = useState(null);

  const joinActive = firstTextRelation && secondTextRelation && typeRelation;

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

  console.log("perspectiveId====");
  console.log(perspectiveId);

  console.log("mode====");
  console.log(mode);

  console.log("onClose====");
  console.log(onClose);

  console.log("relations===");
  console.log(relations);

  console.log("joinActive===");
  console.log(joinActive);

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{getTranslation("Join markups")}</Modal.Header>
      <Modal.Content /*scrolling*/>
        <div className="join-markups-content">
          <div className="join-markups-content__table1">
            {/* Table 1 */}
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
                  {/*<div>
                    Selected value: <b>{typeRelation}</b>
                  </div>*/}

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
                  //icon={<i className="lingvo-icon lingvo-icon_check" />}
                  content={getTranslation("Join")}
                  onClick={onAddRelation}
                  className="lingvo-button-greenest"
                  disabled={!joinActive}
                />

                <Button
                  //icon={<i className="lingvo-icon lingvo-icon_check" />}
                  content={getTranslation("Delete")}
                  //onClick={onDeleteRelation}
                  className="lingvo-button-redder"
                  disabled={true}
                />
              </div>
            </div>
            {/* /Table 1 */}
          </div>

          <div className="join-markups-content__table2">
            {/* Table 2 */}
            <Table celled padded className="lingvo-perspective-table">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>&nbsp;</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Left text")}</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Right text")}</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Type")}</Table.HeaderCell>
                  <Table.HeaderCell>{getTranslation("Author")}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {relations.map(relation => {
                  return (
                    <Table.Row key={relation.id}>
                      <Table.Cell>
                        <Checkbox
                          className="lingvo-checkbox"
                          //checked={!!selectedEntries.find(e => isEqual(e, entry.id))}
                          //onChange={(e, { checked }) => onEntrySelect(entry.id, checked)}
                        />
                      </Table.Cell>
                      <Table.Cell>Left text</Table.Cell>
                      <Table.Cell>Right text</Table.Cell>
                      <Table.Cell>Type</Table.Cell>
                      <Table.Cell>Author</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
            {/* /Table 2 */}
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
