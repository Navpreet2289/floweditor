import { getActionUUID } from '~/components/flow/actions/helpers';
import { SetRunResultFormState } from '~/components/flow/actions/setrunresult/SetRunResultForm';
import { Types } from '~/config/typeConfigs';
import { SetRunResult } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): SetRunResultFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.set_run_result) {
        const action = settings.originalAction as SetRunResult;

        return {
            name: { value: action.name },
            value: { value: action.value },
            category: { value: action.category },
            valid: true
        };
    }

    return {
        name: { value: '' },
        value: { value: '' },
        category: { value: '' },
        valid: false
    };
};

export const stateToAction = (
    settings: NodeEditorSettings,
    state: SetRunResultFormState
): SetRunResult => {
    return {
        type: Types.set_run_result,
        name: state.name.value,
        value: state.value.value,
        category: state.category.value,
        uuid: getActionUUID(settings, Types.set_run_result)
    };
};
