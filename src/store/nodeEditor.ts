// tslint:disable:no-shadowed-variable
import mutate from 'immutability-helper';
import { combineReducers } from 'redux';
import { Type } from '~/config';
import { AnyAction } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { LocalizedObject } from '~/services/Localization';
import ActionTypes, {
    UpdateNodeEditorSettings,
    UpdateOperandAction,
    UpdateResultNameAction,
    UpdateShowResultNameAction,
    UpdateTimeoutAction,
    UpdateTypeConfigAction,
    UpdateUserAddingActionAction
} from '~/store/actionTypes';
import Constants from '~/store/constants';
import { RenderNode } from '~/store/flowContext';

export interface ValidationFailure {
    message: string;
}

export interface FormEntry {
    value: any;
    validationFailures?: ValidationFailure[];
}

export interface StringEntry extends FormEntry {
    value: string;
}

export interface StringArrayEntry extends FormEntry {
    value: string[];
}

export interface AssetEntry extends FormEntry {
    value: Asset;
}

export interface AssetArrayEntry extends FormEntry {
    value: Asset[];
}

export const mergeForm = (
    form: FormState,
    toMerge: Partial<FormState>,
    toRemove: any[] = []
): FormState => {
    let updated = form || {};
    // we auto update array items with uuids
    for (const key of Object.keys(toMerge)) {
        const entry: any = toMerge[key];
        if (Array.isArray(entry)) {
            for (let item of entry) {
                // we support objects with uuids or FormEntry's with uuids
                if (item.hasOwnProperty('value')) {
                    item = item.value;
                }

                if (item.uuid) {
                    const existingIdx = form[key].findIndex((existing: any) => {
                        let obj = existing;
                        if (obj.hasOwnProperty('value')) {
                            obj = obj.value;
                        }
                        return obj.uuid === item.uuid;
                    });

                    if (existingIdx > -1) {
                        // we found a match, merge us in
                        updated = mutate(updated, {
                            [key]: { $merge: { [existingIdx]: item } }
                        }) as FormState;
                    } else {
                        // couldn't find it, lets push it on
                        updated = mutate(updated, {
                            [key]: { $push: [item] }
                        }) as FormState;
                    }
                }
            }

            // remove it from our merge
            delete toMerge[key];
        }
    }

    // removals can be items in an array
    for (const remove of toRemove.filter((item: any) => typeof item === 'object')) {
        for (const key of Object.keys(remove)) {
            const entry: any = remove[key];
            if (Array.isArray(entry)) {
                for (let item of entry) {
                    if (item.hasOwnProperty('value')) {
                        item = item.value;
                    }
                    if (item.uuid) {
                        updated = mutate(updated, {
                            [key]: (items: any) =>
                                items.filter((existing: any) => {
                                    let obj = existing;
                                    if (obj.hasOwnProperty('value')) {
                                        obj = obj.value;
                                    }
                                    return obj.uuid !== item.uuid;
                                })
                        });
                    }
                }
            }
        }
    }

    const removeKeys = toRemove.filter((item: any) => typeof item === 'string');
    updated = mutate(updated, { $merge: toMerge, $unset: removeKeys }) as FormState;
    let valid = true;
    for (const key of Object.keys(form)) {
        const entry: any = form[key];
        if (entry && typeof entry === 'object') {
            if (entry.validationFailures && entry.validationFailures.length > 0) {
                valid = false;
                break;
            }
        }
    }

    return mutate(updated, { $merge: { valid } }) as FormState;
};

export interface FormState {
    validationFailures?: ValidationFailure[];
    valid: boolean;
}

export interface NodeEditorSettings {
    originalNode: RenderNode;
    showAdvanced?: boolean;
    originalAction?: AnyAction;
    localizations?: LocalizedObject[];
    languages?: Asset[];
}

export interface NodeEditor {
    typeConfig: Type;
    resultName: string;
    showResultName: boolean;
    operand: string;
    userAddingAction: boolean;
    settings: NodeEditorSettings;
    timeout: number;
}

const DEFAULT_OPERAND = '@run.input';

// Initial state
export const initialState: NodeEditor = {
    typeConfig: null,
    resultName: '',
    showResultName: false,
    operand: DEFAULT_OPERAND,
    userAddingAction: false,
    timeout: null,
    settings: null
};

// Action Creators
export const updateTypeConfig = (typeConfig: Type): UpdateTypeConfigAction => ({
    type: Constants.UPDATE_TYPE_CONFIG,
    payload: {
        typeConfig
    }
});

export const updateNodeEditorSettings = (
    settings: NodeEditorSettings
): UpdateNodeEditorSettings => ({
    type: Constants.UPDATE_NODE_EDITOR_SETTINGS,
    payload: {
        settings
    }
});

export const updateResultName = (resultName: string): UpdateResultNameAction => ({
    type: Constants.UPDATE_RESULT_NAME,
    payload: {
        resultName
    }
});

export const updateOperand = (operand: string): UpdateOperandAction => ({
    type: Constants.UPDATE_OPERAND,
    payload: {
        operand
    }
});

export const updateUserAddingAction = (
    userAddingAction: boolean
): UpdateUserAddingActionAction => ({
    type: Constants.UPDATE_USER_ADDING_ACTION,
    payload: {
        userAddingAction
    }
});

export const updateShowResultName = (showResultName: boolean): UpdateShowResultNameAction => ({
    type: Constants.UPDATE_SHOW_RESULT_NAME,
    payload: {
        showResultName
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateTimeout = (timeout: number): UpdateTimeoutAction => ({
    type: Constants.UPDATE_TIMEOUT,
    payload: {
        timeout
    }
});

// Reducers
export const typeConfig = (state: Type = initialState.typeConfig, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TYPE_CONFIG:
            return action.payload.typeConfig;
        default:
            return state;
    }
};

export const resultName = (state: string = initialState.resultName, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_RESULT_NAME:
            return action.payload.resultName;
        default:
            return state;
    }
};

export const showResultName = (
    state: boolean = initialState.showResultName,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_SHOW_RESULT_NAME:
            return action.payload.showResultName;
        default:
            return state;
    }
};

export const operand = (state: string = initialState.operand, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_OPERAND:
            return action.payload.operand;
        default:
            return state;
    }
};

export const userAddingAction = (
    state: boolean = initialState.userAddingAction,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_USER_ADDING_ACTION:
            return action.payload.userAddingAction;
        default:
            return state;
    }
};

export const timeout = (state: number = initialState.timeout, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TIMEOUT:
            return action.payload.timeout;
        default:
            return state;
    }
};

export const settings = (
    state: NodeEditorSettings = initialState.settings,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_EDITOR_SETTINGS:
            return action.payload.settings;
        default:
            return state;
    }
};

// Root reducer
export default combineReducers({
    typeConfig,
    resultName,
    showResultName,
    operand,
    userAddingAction,
    settings,
    timeout
});
