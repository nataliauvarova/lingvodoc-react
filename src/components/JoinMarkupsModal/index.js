import React, { useCallback, useContext, useState } from "react";
import { Button, Checkbox, Modal, Table } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

const JoinMarkupsModal = ({ perspectiveId, mode, relations, onClose }) => {
  const getTranslation = useContext(TranslationContext);

  console.log("perspectiveId====");
  console.log(perspectiveId);

  console.log("mode====");
  console.log(mode);

  console.log("onClose====");
  console.log(onClose);

  console.log("relations===");
  console.log(relations);

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{getTranslation("Join markups")}</Modal.Header>
      <Modal.Content scrolling>
        !!!!! Table 1 !!!!!!
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
