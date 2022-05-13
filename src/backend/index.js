import { gql } from "@apollo/client";

// Queries
export const dictionariesInfoQuery = gql`
  query getAllDictionaries {
    dictionaries(mode: 1) {
      parent_id
      category
    }
  }
`;

export const getLanguageMetadataQuery = gql`
  query GetLanguageMetadata($id: LingvodocID!) {
    language(id: $id) {
      additional_metadata {
        speakersAmount
      }
    }
  }
`;

export const getLanguageTree = gql`
  query GetLanguageTree(
    $languageId: LingvodocID
    $byGrants: Boolean
    $grantId: Int
    $byOrganizations: Boolean
    $organizationId: Int
    $published: Boolean
    $category: Int
  ) {
    language_tree(
      language_id: $languageId
      by_grants: $byGrants
      grant_id: $grantId
      by_organizations: $byOrganizations
      organization_id: $organizationId
    ) {
      tree
      languages {
        id
        translations
        in_toc
        dictionaries(deleted: false, published: $published, category: $category) {
          id
          translations
          english_status: status(locale_id: 2)
          additional_metadata {
            authors
          }
          perspectives {
            id
            translations
          }
        }
      }
    }
  }
`;

export const getLanguagesForSearch = gql`
  query GetLanguagesForSearch {
    language_tree {
      languages {
        id
        translations
      }
    }
  }
`;

export const getTocGrants = gql`
  query GetTocGrants($participantPublished: Boolean, $participantCategory: Int) {
    grants(
      has_participant: true
      participant_deleted: false
      participant_published: $participantPublished
      participant_category: $participantCategory
    ) {
      id
      translations
      issuer_translations
      grant_number
    }
  }
`;

export const getTocLanguages = gql`
  query GetTocLanguages($published: Boolean, $category: Int) {
    language_toc {
      id
      translations
      dictionary_count(recursive: true, published: $published, category: $category)
    }
  }
`;

export const getTocOrganizations = gql`
  query GetTocOrganizations($participantPublished: Boolean, $participantCategory: Int) {
    organizations(
      has_participant: true
      participant_deleted: false
      participant_published: $participantPublished
      participant_category: $participantCategory
    ) {
      id
      translations
    }
  }
`;

export const languagesQuery = gql`
  query Languages {
    language_tree {
      id
      parent_id
      translations
      created_at
      translation_gist_id
      additional_metadata {
        toc_mark
      }
    }
  }
`;

export const proxyDictionaryInfo = gql`
  query ProxyDictionaryInfo($proxy: Boolean, $category: Int) {
    dictionaries(proxy: false, published: true, category: $category) {
      id
    }
    permission_lists(proxy: $proxy) {
      view {
        id
      }
      edit {
        id
      }
      publish {
        id
      }
      limited {
        id
      }
    }
  }
`;

export const queryCounter = gql`
  query qcounter($id: LingvodocID!, $mode: String!) {
    perspective(id: $id) {
      id
      counter(mode: $mode)
    }
  }
`;

// Mutations
export const createLanguageMutation = gql`
  mutation createLanguage($parent_id: LingvodocID!, $translationAtoms: [ObjectVal]!, $metadata: ObjectVal) {
    create_language(parent_id: $parent_id, translation_atoms: $translationAtoms, additional_metadata: $metadata) {
      triumph
    }
  }
`;

export const deleteLanguageMutation = gql`
  mutation DeleteLanguage($id: LingvodocID!) {
    delete_language(id: $id) {
      triumph
    }
  }
`;

export const downloadDictionariesMutation = gql`
  mutation DownloadDictionaries($ids: [LingvodocID]!) {
    download_dictionaries(ids: $ids) {
      triumph
    }
  }
`;

export const moveLanguageMutation = gql`
  mutation MoveLanguage($id: LingvodocID!, $parent_id: LingvodocID, $previous_sibling_id: LingvodocID) {
    move_language(id: $id, parent_id: $parent_id, previous_sibling: $previous_sibling_id) {
      triumph
    }
  }
`;

export const synchronizeMutation = gql`
  mutation {
    synchronize {
      triumph
    }
  }
`;

export const updateLanguageAtomMutation = gql`
  mutation updateAtom($id: LingvodocID!, $atom_id: LingvodocID, $locale_id: Int!, $content: String!) {
    update_language_atom(id: $id, atom_id: $atom_id, locale_id: $locale_id, content: $content) {
      triumph
    }
  }
`;

export const updateLanguageMetadataMutation = gql`
  mutation UpdateLanguageMetadata($id: LingvodocID!, $metadata: ObjectVal!) {
    update_language(id: $id, additional_metadata: $metadata) {
      triumph
    }
  }
`;
