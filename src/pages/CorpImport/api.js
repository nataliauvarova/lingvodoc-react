import { Map } from "immutable";

export function corpusInfo({ linking, languages, licenses }) {
  const baseBlob = linking.first();
  const baseId = baseBlob.get("id");
  const language = languages.get(baseId);
  const license = licenses.get(baseId);

  const translation_atoms = baseBlob
    .get("translation", new Map())
    .filter(content => content && content.trim() !== "")
    .map((content, locale_id) => ({ content, locale_id }))
    .toArray();

  const parent_id = language.get("id", new Map()).toArray();

  return {
    translation_atoms,
    parent_id,
    license
  };
}

function blobExport(blob, columnType) {
  const blob_id = blob.get("id").toArray();
  const dedash = blob.getIn(["values", "dedash"], false);
  const field_id =  columnType.get("sentence", new Map()).toArray();

  return {
    blob_id,
    field_id,
    dedash
  };
}

export function columnsInfo({ linking, columnTypes }) {
  return linking.reduce(
    (acc, blob, id) => [...acc, blobExport(blob, columnTypes.get(id))],
    []
  );
}
