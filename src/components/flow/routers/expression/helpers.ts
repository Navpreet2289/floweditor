import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { ExpressionRouterFormState } from '~/components/flow/routers/expression/ExpressionRouterForm';
import {
    createCaseProps,
    createRenderNode,
    hasCases,
    resolveExits
} from '~/components/flow/routers/helpers';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Types } from '~/config/typeConfigs';
import { Router, RouterTypes, SwitchRouter } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export const nodeToState = (settings: NodeEditorSettings): ExpressionRouterFormState => {
    let initialCases: CaseProps[] = [];

    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: '' };

    if (settings.originalNode && settings.originalNode.ui.type === Types.split_by_expression) {
        const router = settings.originalNode.node.router as SwitchRouter;
        if (router) {
            if (hasCases(settings.originalNode.node)) {
                initialCases = createCaseProps(router.cases, settings.originalNode.node.exits);
            }

            resultName = { value: router.result_name || '' };
        }
    }

    return {
        cases: initialCases,
        resultName,
        operand: { value: DEFAULT_OPERAND },
        valid: true
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: ExpressionRouterFormState
): RenderNode => {
    const { cases, exits, defaultExit } = resolveExits(state.cases, false, settings);

    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        default_exit_uuid: defaultExit,
        cases,
        operand: state.operand.value,
        ...optionalRouter
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.split_by_expression,
        []
    );

    return newRenderNode;
};
