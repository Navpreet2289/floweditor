import '~/global.scss';

import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect, Provider as ReduxProvider } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button, { ButtonTypes } from '~/components/button/Button';
import ConnectedFlow from '~/components/flow/Flow';
import * as styles from '~/components/index.scss';
import ConnectedLanguageSelector from '~/components/languageselector/LanguageSelector';
import ConfigProvider from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { FlowDefinition, FlowEditorConfig } from '~/flowTypes';
import createStore from '~/store/createStore';
import { Asset, Assets, RenderNodeMap } from '~/store/flowContext';
import { getCurrentDefinition } from '~/store/helpers';
import AppState from '~/store/state';
import { DispatchWithState, FetchFlow, fetchFlow } from '~/store/thunks';
import { downloadJSON, renderIf } from '~/utils';

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

export interface FlowEditorStoreProps {
    language: Asset;
    languages: Assets;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    fetchFlow: FetchFlow;
    nodes: RenderNodeMap;
}

const hotStore = createStore();

// Root container, wires up context-providers
const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => {
    return (
        <ConfigProvider config={{ ...config }}>
            <ReduxProvider store={hotStore}>
                <ConnectedFlowEditor />
            </ReduxProvider>
        </ConfigProvider>
    );
};

export const contextTypes = {
    flow: fakePropType,
    endpoints: fakePropType
};

export const editorContainerSpecId = 'editor-container';
export const editorSpecId = 'editor';

/**
 * A navigable list of flows for an account
 */
export class FlowEditor extends React.Component<FlowEditorStoreProps> {
    public static contextTypes = contextTypes;

    constructor(props: FlowEditorStoreProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public componentDidMount(): void {
        this.props.fetchFlow(this.context.endpoints, this.context.flow);
    }

    private handleDownloadClicked(): void {
        downloadJSON(getCurrentDefinition(this.props.definition, this.props.nodes), 'definition');
    }

    public getFooter(): JSX.Element {
        return (
            <div className={styles.footer}>
                <div className={styles.downloadButton}>
                    <Button
                        name="Download"
                        onClick={this.handleDownloadClicked}
                        type={ButtonTypes.primary}
                    />
                </div>
            </div>
        );
    }

    public render(): JSX.Element {
        /* <ConnectedFlowList /> */
        return (
            <div
                id={editorContainerSpecId}
                className={this.props.translating ? styles.translating : undefined}
                data-spec={editorContainerSpecId}
            >
                {this.getFooter()}
                <div className={styles.editor} data-spec={editorSpecId}>
                    {renderIf(
                        this.props.languages && Object.keys(this.props.languages.items).length > 0
                    )(<ConnectedLanguageSelector />)}
                    {renderIf(
                        this.props.definition && this.props.language && !this.props.fetchingFlow
                    )(<ConnectedFlow />)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    flowContext: { definition, dependencies, nodes, assets },
    editorState: { translating, language, fetchingFlow }
}: AppState) => {
    const languages = assets ? assets.languages : null;

    return {
        translating,
        language,
        fetchingFlow,
        definition,
        dependencies,
        nodes,
        languages
    };
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            fetchFlow
        },
        dispatch
    );

export const ConnectedFlowEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(FlowEditor);

export default FlowEditorContainer;
