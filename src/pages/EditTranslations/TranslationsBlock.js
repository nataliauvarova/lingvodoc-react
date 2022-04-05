import React from "react";
import { graphql } from "react-apollo";
import { Button, Container, Loader } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import gql from "graphql-tag";

import EditAtoms from "./EditAtoms";

const getTranslationsQuery = gql`
  query getTranslations($gists_type: String!) {
    translationgists(gists_type: $gists_type) {
      id
      type
      translationatoms(deleted: false) {
        id
        content
        locale_id
      }
    }
    all_locales
  }
`;

class TranslationsBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gistsType: props.gists_type,
      translationgists: props.translationgists,
      newgists: []
    };

    this.addTranslationGist = this.addTranslationGist.bind(this);
  }

  addTranslationGist() {
    const newGists = this.state.newgists;
    const date = new Date();
    const date_str = date.toISOString() + date.getUTCMilliseconds().toString();
    newGists.push({ type: this.state.gistsType, atoms: [{ id: date_str, locale_id: 2, content: "" }] });
    this.setState({ newgists: newGists });
  }

  componentWillReceiveProps(props) {
    if (!props.data.loading) {
      if (props.gists_type != this.state.gistsType) {
        this.refetching = true;

        props.data.refetch().then(result => {
          this.refetching = false;
          this.setState({ gistsType: props.gists_type, translationgists: result.data.translationgists, newgists: [] });
        });
      }
    }
  }

  render() {
    const {
      data: { error, loading, translationgists, all_locales }
    } = this.props;

    const newGists = this.state.newgists;

    if (error) {
      return null;
    }

    if (loading || this.refetching) {
      return <Loader active content={getTranslation("Loading")}></Loader>;
    }

    const typeGistsMap = new Map();
    const types = [];
    let currentType = null;

    translationgists.forEach(item => {
      if (item.translationatoms.length == 0) {
        return;
      }

      if (currentType == null || currentType != item.type) {
        currentType = item.type;
        types.push(currentType);
        typeGistsMap[currentType] = [];
        typeGistsMap[currentType].push(item);
      } else if (currentType == item.type) {
        typeGistsMap[currentType].push(item);
      }
    });

    return (
      <Container>
        {types.map((type, index) => (
          <Container fluid key={type}>
            <h1 className="lingvo-header-translations">{getTranslation(type)}</h1>

            {this.state.gistsType && (
              <div className="lingvo-new-gists">
                <Button onClick={this.addTranslationGist} className="lingvo-button-violet-dashed">
                  {getTranslation("Add new translation gist")}
                </Button>

                {newGists
                  .map((gist, i) => (
                    <EditAtoms
                      key={`atom${i}-type${type}`}
                      gistId={`atom${i}-type${type}`}
                      atoms={gist.atoms}
                      locales={all_locales}
                      gistsType={type}
                      newGist="true"
                    ></EditAtoms>
                  ))
                  .reverse()}
              </div>
            )}

            {typeGistsMap[type].map((gist, index) => (
              <EditAtoms key={gist.id} gistId={gist.id} atoms={gist.translationatoms} locales={all_locales}></EditAtoms>
            ))}
          </Container>
        ))}
      </Container>
    );
  }
}

export default graphql(getTranslationsQuery)(TranslationsBlock);
