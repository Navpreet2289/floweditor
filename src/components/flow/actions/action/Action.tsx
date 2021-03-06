import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as styles from '~/components/flow/actions/action/Action.scss';
import * as shared from '~/components/shared.scss';
import TitleBar from '~/components/titlebar/TitleBar';
import { ConfigProviderContext, fakePropType } from '~/config/ConfigProvider';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { Action, AnyAction, LocalizationMap } from '~/flowTypes';
import { Asset, RenderNode } from '~/store/flowContext';
import AppState from '~/store/state';
import {
    ActionAC,
    DispatchWithState,
    moveActionUp,
    OnOpenNodeEditor,
    onOpenNodeEditor,
    removeAction
} from '~/store/thunks';
import { createClickHandler, getLocalization } from '~/utils';

export interface ActionWrapperPassedProps {
    thisNodeDragging: boolean;
    first: boolean;
    action: AnyAction;
    localization: LocalizationMap;
    render: (action: AnyAction) => React.ReactNode;
}

export interface ActionWrapperStoreProps {
    renderNode: RenderNode;
    language: Asset;
    translating: boolean;
    onOpenNodeEditor: OnOpenNodeEditor;
    removeAction: ActionAC;
    moveActionUp: ActionAC;
}

export type ActionWrapperProps = ActionWrapperPassedProps & ActionWrapperStoreProps;

export const actionContainerSpecId = 'action-container';
export const actionOverlaySpecId = 'action-overlay';
export const actionInteractiveDivSpecId = 'interactive-div';
export const actionBodySpecId = 'action-body';

const cx = classNames.bind({ ...shared, ...styles });

// Note: this needs to be a ComponentClass in order to work w/ react-flip-move
export class ActionWrapper extends React.Component<ActionWrapperProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ActionWrapperProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    public onClick(event: React.MouseEvent<HTMLDivElement>): void {
        const target = event.target as any;

        const showAdvanced =
            target && target.attributes && target.getAttribute('data-advanced') === 'true';

        if (!this.props.thisNodeDragging) {
            event.preventDefault();
            event.stopPropagation();
            this.props.onOpenNodeEditor({
                originalNode: this.props.renderNode,
                originalAction: this.props.action,
                showAdvanced
            });
        }
    }

    private onRemoval(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();
        this.props.removeAction(this.props.renderNode.node.uuid, this.props.action);
    }

    private onMoveUp(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();

        this.props.moveActionUp(this.props.renderNode.node.uuid, this.props.action);
    }

    public getAction(): Action {
        // if we are translating, us our localized version
        if (this.props.translating) {
            const localization = getLocalization(
                this.props.action,
                this.props.localization,
                this.props.language
            );
            return localization.getObject() as AnyAction;
        }

        return this.props.action;
    }

    private getClasses(): string {
        const localizedKeys = [];
        let missingLocalization = false;

        if (this.props.translating) {
            if (
                this.props.action.type === Types.send_msg ||
                this.props.action.type === Types.send_broadcast
            ) {
                localizedKeys.push('text');
            }

            if (localizedKeys.length !== 0) {
                const localization = getLocalization(
                    this.props.action,
                    this.props.localization,
                    this.props.language
                );

                if (localization.isLocalized()) {
                    for (const key of localizedKeys) {
                        if (!(key in localization.localizedKeys)) {
                            missingLocalization = true;
                            break;
                        }
                    }
                } else {
                    missingLocalization = true;
                }
            }
        }

        return cx({
            [styles.action]: true,
            [styles.has_router]:
                this.props.renderNode.node.hasOwnProperty('router') &&
                this.props.renderNode.node.router !== null,
            [styles.translating]: this.props.translating,
            [styles.not_localizable]: this.props.translating && localizedKeys.length === 0,
            [styles.missing_localization]: missingLocalization
        });
    }

    public render(): JSX.Element {
        const { name } = getTypeConfig(this.props.action.type);
        const classes = this.getClasses();
        const actionToInject = this.getAction();
        const titleBarClass = shared[this.props.action.type] || shared.missing;
        const actionClass = styles[this.props.action.type] || styles.missing;
        const showRemoval = !this.props.translating;
        const showMove = !this.props.first && !this.props.translating;

        return (
            <div
                id={`action-${this.props.action.uuid}`}
                className={classes}
                data-spec={actionContainerSpecId}
            >
                <div className={styles.overlay} data-spec={actionOverlaySpecId} />
                <div {...createClickHandler(this.onClick)} data-spec={actionInteractiveDivSpecId}>
                    <TitleBar
                        __className={titleBarClass}
                        title={name}
                        onRemoval={this.onRemoval}
                        showRemoval={showRemoval}
                        showMove={showMove}
                        onMoveUp={this.onMoveUp}
                    />
                    <div className={styles.body + ' ' + actionClass} data-spec={actionBodySpecId}>
                        {this.props.render(actionToInject)}
                    </div>
                </div>
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: {
        definition: { localization }
    },
    editorState: { language, translating }
}: AppState) => ({
    language,
    translating,
    localization
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            onOpenNodeEditor,
            removeAction,
            moveActionUp
        },
        dispatch
    );

const ConnectedActionWrapper = connect(
    mapStateToProps,
    mapDispatchToProps
)(ActionWrapper);

export default ConnectedActionWrapper;
